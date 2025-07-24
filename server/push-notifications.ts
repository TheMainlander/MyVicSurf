import webpush from "web-push";
import { db } from "./db";
import { 
  pushSubscriptions, 
  notificationLog, 
  userPreferences,
  userFavorites,
  surfSpots,
  surfConditions,
  type PushSubscription,
  type InsertNotificationLog,
  type User,
  type SurfCondition 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BNJzp5DbZefY5Zu9KoLVJFJQdqhqLnz3FOq2z_BwHjEeojJ1KJRUhEJdnqKW_YQJpEjW2x7aSWgKXDq6qsKsZBE";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "BJQjBDR1M1A2J5J6K7K8L9M0N1O2P3Q4R5S6T7U8V9W0";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "admin@vicsurf.com";

// Only set VAPID details if we have proper keys
if (VAPID_PRIVATE_KEY !== "BJQjBDR1M1A2J5J6K7K8L9M0N1O2P3Q4R5S6T7U8V9W0") {
  webpush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export class PushNotificationService {
  async subscribeToPush(userId: string, subscription: any): Promise<PushSubscription> {
    // Deactivate existing subscriptions for this user
    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.userId, userId));

    // Create new subscription
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userAgent: subscription.userAgent || null,
      })
      .returning();

    return newSubscription;
  }

  async unsubscribeFromPush(userId: string, endpoint: string): Promise<boolean> {
    const result = await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      ));

    return (result.rowCount || 0) > 0;
  }

  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.isActive, true)
      ));
  }

  async sendNotification(userId: string, title: string, message: string, spotId?: number): Promise<boolean> {
    // Skip sending if VAPID keys are not configured
    if (VAPID_PRIVATE_KEY === "BJQjBDR1M1A2J5J6K7K8L9M0N1O2P3Q4R5S6T7U8V9W0") {
      console.log("Push notifications not configured - VAPID keys missing");
      return false;
    }

    const subscriptions = await this.getUserSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      console.log(`No active subscriptions for user ${userId}`);
      return false;
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: {
        spotId,
        url: spotId ? `/spot/${spotId}` : "/",
        timestamp: Date.now()
      }
    });

    const results = await Promise.allSettled(
      subscriptions.map(subscription => 
        webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dhKey,
            auth: subscription.authKey
          }
        }, payload)
      )
    );

    // Log the notification
    await db.insert(notificationLog).values({
      userId,
      spotId: spotId || null,
      notificationType: "optimal_conditions",
      title,
      message,
      sent: true,
      sentAt: new Date()
    });

    const successCount = results.filter(result => result.status === "fulfilled").length;
    console.log(`Sent ${successCount}/${subscriptions.length} notifications to user ${userId}`);

    return successCount > 0;
  }

  async checkOptimalConditions(): Promise<void> {
    console.log("Checking optimal conditions for notifications...");

    try {
      // Get all users with notification preferences enabled
      const usersWithPrefs = await db
        .select({
          userId: userPreferences.userId,
          optimalConditionAlerts: userPreferences.optimalConditionAlerts,
          waveHeightMin: userPreferences.waveHeightMin,
          waveHeightMax: userPreferences.waveHeightMax,
          windSpeedMax: userPreferences.windSpeedMax,
        })
        .from(userPreferences)
        .where(eq(userPreferences.optimalConditionAlerts, true));

      for (const userPref of usersWithPrefs) {
        // Get user's favorite spots
        const favorites = await db
          .select({
            spotId: userFavorites.spotId,
            spotName: surfSpots.name,
          })
          .from(userFavorites)
          .innerJoin(surfSpots, eq(userFavorites.spotId, surfSpots.id))
          .where(eq(userFavorites.userId, userPref.userId));

        for (const favorite of favorites) {
          const spotId = favorite.spotId;
          if (spotId) {
            // Check if conditions are optimal
            const isOptimal = await this.isConditionOptimal(
              spotId,
              userPref.waveHeightMin || 1.0,
              userPref.waveHeightMax || 4.0,
              userPref.windSpeedMax || 20
            );

            if (isOptimal) {
              // Check if we've already sent a notification today
              const today = new Date().toISOString().split('T')[0];
              const existingNotification = await db
                .select()
                .from(notificationLog)
                .where(and(
                  eq(notificationLog.userId, userPref.userId),
                  eq(notificationLog.spotId, spotId),
                  eq(notificationLog.notificationType, "optimal_conditions")
                ))
                .orderBy(desc(notificationLog.createdAt))
                .limit(1);

              const lastNotification = existingNotification[0];
              const lastNotificationDate = lastNotification?.createdAt?.toISOString().split('T')[0];

              if (!lastNotification || lastNotificationDate !== today) {
                await this.sendNotification(
                  userPref.userId,
                  `🏄‍♂️ Perfect Surf at ${favorite.spotName}!`,
                  `Optimal conditions detected at ${favorite.spotName}. Great waves are waiting!`,
                  spotId
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking optimal conditions:", error);
    }
  }

  private async isConditionOptimal(
    spotId: number, 
    minWaveHeight: number, 
    maxWaveHeight: number, 
    maxWindSpeed: number
  ): Promise<boolean> {
    // This would integrate with your current conditions API
    // For now, we'll use a simple mock check
    const conditions = await this.getCurrentConditions(spotId);
    
    if (!conditions) return false;

    return (
      conditions.waveHeight >= minWaveHeight &&
      conditions.waveHeight <= maxWaveHeight &&
      conditions.windSpeed <= maxWindSpeed &&
      (conditions.rating === "good" || conditions.rating === "very-good" || conditions.rating === "excellent")
    );
  }

  private async getCurrentConditions(spotId: number): Promise<SurfCondition | null> {
    try {
      const [condition] = await db
        .select()
        .from(surfConditions)
        .where(eq(surfConditions.spotId, spotId))
        .orderBy(desc(surfConditions.timestamp))
        .limit(1);
      
      return condition || null;
    } catch (error) {
      console.error(`Error fetching conditions for spot ${spotId}:`, error);
      return null;
    }
  }

  async startOptimalConditionsChecker(): Promise<void> {
    // Check every 2 hours for optimal conditions
    const checkInterval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    setInterval(() => {
      this.checkOptimalConditions();
    }, checkInterval);

    // Run initial check
    setTimeout(() => {
      this.checkOptimalConditions();
    }, 5000); // Wait 5 seconds after startup
  }
}

export const pushNotificationService = new PushNotificationService();

// VAPID public key for frontend
export const VAPID_PUBLIC_KEY_FOR_CLIENT = VAPID_PUBLIC_KEY;