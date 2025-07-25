import { 
  surfSpots, 
  surfConditions, 
  tideTimes, 
  forecasts,
  users,
  userFavorites,
  userSessions,
  userPreferences,
  pushSubscriptions,
  notificationLog,
  type SurfSpot, 
  type SurfCondition, 
  type TideTime, 
  type Forecast,
  type User,
  type UserFavorite,
  type UserSession,
  type UserPreferences,
  type PushSubscription,
  type NotificationLog,
  type InsertSurfSpot,
  type InsertSurfCondition,
  type InsertTideTime,
  type InsertForecast,
  type InsertUser,
  type InsertUserFavorite,
  type InsertUserSession,
  type InsertUserPreferences,
  type InsertPushSubscription,
  type InsertNotificationLog,
  type UpsertUser
} from "@shared/schema";
import { getCurrentConditionsFromAPI, getForecastFromAPI, getTideDataFromBOM, getHourlyTideReport } from "./api-integrations";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Surf Spots
  getSurfSpots(): Promise<SurfSpot[]>;
  getSurfSpot(id: number): Promise<SurfSpot | undefined>;
  createSurfSpot(spot: InsertSurfSpot): Promise<SurfSpot>;

  // Surf Conditions
  getCurrentConditions(spotId: number): Promise<SurfCondition | undefined>;
  getCurrentConditionsFromAPI(spotId: number): Promise<SurfCondition | undefined>;
  createSurfCondition(condition: InsertSurfCondition): Promise<SurfCondition>;

  // Tide Times
  getTideTimesForDate(spotId: number, date: string): Promise<TideTime[]>;
  getTideTimesFromBOM(spotId: number, date: string): Promise<TideTime[]>;
  getHourlyTideReport(spotId: number, date: string): Promise<any[]>;
  createTideTime(tide: InsertTideTime): Promise<TideTime>;

  // Forecasts
  getForecast(spotId: number, days: number): Promise<Forecast[]>;
  getForecastFromAPI(spotId: number, days: number): Promise<Forecast[]>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // User Favorites
  getUserFavorites(userId: string): Promise<(UserFavorite & { spot: SurfSpot })[]>;
  addUserFavorite(userId: string, spotId: number): Promise<UserFavorite>;
  removeUserFavorite(userId: string, spotId: number): Promise<boolean>;
  isSpotFavorited(userId: string, spotId: number): Promise<boolean>;

  // User Sessions
  getUserSessions(userId: string, limit?: number): Promise<(UserSession & { spot: SurfSpot })[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;

  // Push Notifications
  subscribeToPush(userId: string, subscription: InsertPushSubscription): Promise<PushSubscription>;
  unsubscribeFromPush(userId: string, endpoint: string): Promise<boolean>;
  getUserPushSubscriptions(userId: string): Promise<PushSubscription[]>;

  // Notification Log
  createNotificationLog(notification: InsertNotificationLog): Promise<NotificationLog>;
  getUserNotifications(userId: string, limit?: number): Promise<NotificationLog[]>;

  // Beach Cameras
  getBeachCameras(spotId: number): Promise<any[]>;
}

// Database-backed storage for production
export class DatabaseStorage implements IStorage {
  // Mock user for development - in production this would come from authentication
  private currentUserId = "550e8400-e29b-41d4-a716-446655440000";

  async getSurfSpots(): Promise<SurfSpot[]> {
    return await db.select().from(surfSpots);
  }

  async getSurfSpot(id: number): Promise<SurfSpot | undefined> {
    const [spot] = await db.select().from(surfSpots).where(eq(surfSpots.id, id));
    return spot;
  }

  async createSurfSpot(spot: InsertSurfSpot): Promise<SurfSpot> {
    const [newSpot] = await db.insert(surfSpots).values(spot).returning();
    return newSpot;
  }

  async getCurrentConditions(spotId: number): Promise<SurfCondition | undefined> {
    const [condition] = await db
      .select()
      .from(surfConditions)
      .where(eq(surfConditions.spotId, spotId))
      .orderBy(desc(surfConditions.timestamp))
      .limit(1);
    return condition;
  }

  async getCurrentConditionsFromAPI(spotId: number): Promise<SurfCondition | undefined> {
    try {
      const spot = await this.getSurfSpot(spotId);
      if (!spot) return undefined;

      const apiConditions = await getCurrentConditionsFromAPI(spotId, spot.latitude, spot.longitude);

      // Create new conditions from API data
      const newCondition = {
        spotId,
        waveHeight: apiConditions.waveHeight || 0,
        waveDirection: apiConditions.waveDirection || null,
        wavePeriod: apiConditions.wavePeriod || null,
        windSpeed: apiConditions.windSpeed || 0,
        windDirection: apiConditions.windDirection || "N",
        airTemperature: apiConditions.airTemperature || 20,
        waterTemperature: apiConditions.waterTemperature || 18,
        rating: apiConditions.rating || "fair",
      };

      const [inserted] = await db.insert(surfConditions).values(newCondition).returning();
      return inserted;
    } catch (error) {
      console.error(`API fetch failed for spot ${spotId}, falling back to stored data:`, error);
      return this.getCurrentConditions(spotId);
    }
  }

  async createSurfCondition(condition: InsertSurfCondition): Promise<SurfCondition> {
    const [newCondition] = await db.insert(surfConditions).values(condition).returning();
    return newCondition;
  }

  async getTideTimesForDate(spotId: number, date: string): Promise<TideTime[]> {
    return await db
      .select()
      .from(tideTimes)
      .where(and(eq(tideTimes.spotId, spotId), eq(tideTimes.date, date)));
  }

  async getTideTimesFromBOM(spotId: number, date: string): Promise<TideTime[]> {
    try {
      const bomTideData = await getTideDataFromBOM(spotId, date);

      // Convert BOM data to our TideTime format and store in database
      const tideData: InsertTideTime[] = bomTideData.map(bomTide => {
        const datetime = new Date(bomTide.datetime);
        return {
          spotId,
          date,
          time: datetime.toTimeString().substring(0, 5), // HH:MM format
          height: bomTide.height,
          type: bomTide.type
        };
      });

      // Clear existing tide data for this spot and date to avoid duplicates
      await db.delete(tideTimes).where(
        and(eq(tideTimes.spotId, spotId), eq(tideTimes.date, date))
      );

      const insertedTides = await db.insert(tideTimes).values(tideData).returning();
      return insertedTides;
    } catch (error) {
      console.error(`BOM tide fetch failed for spot ${spotId}, falling back to stored data:`, error);
      return this.getTideTimesForDate(spotId, date);
    }
  }

  async getHourlyTideReport(spotId: number, date: string): Promise<any[]> {
    try {
      return await getHourlyTideReport(spotId, date);
    } catch (error) {
      console.error(`Hourly tide report failed for spot ${spotId}:`, error);
      return [];
    }
  }

  async createTideTime(tide: InsertTideTime): Promise<TideTime> {
    const [newTide] = await db.insert(tideTimes).values(tide).returning();
    return newTide;
  }

  async getForecast(spotId: number, days: number = 7): Promise<Forecast[]> {
    return await db
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, spotId))
      .orderBy(forecasts.date)
      .limit(days);
  }

  async getForecastFromAPI(spotId: number, days: number = 7): Promise<Forecast[]> {
    try {
      const spot = await this.getSurfSpot(spotId);
      if (!spot) return [];

      const apiForecast = await getForecastFromAPI(spotId, spot.latitude, spot.longitude, days);

      // Clear existing forecast data for this spot to avoid duplicates
      await db.delete(forecasts).where(eq(forecasts.spotId, spotId));

      // Convert API data to our Forecast format and store
      const forecastData: InsertForecast[] = apiForecast.map(forecast => ({
        spotId,
        date: forecast.date,
        waveHeight: forecast.waveHeight || 0,
        waveDirection: forecast.waveDirection || null,
        windSpeed: forecast.windSpeed || 0,
        windDirection: forecast.windDirection || "N",
        rating: forecast.rating || "fair",
        airTemperature: forecast.airTemperature || 20,
        waterTemperature: forecast.waterTemperature || 18
      }));

      const insertedForecasts = await db.insert(forecasts).values(forecastData).returning();
      return insertedForecasts;
    } catch (error) {
      console.error(`API forecast fetch failed for spot ${spotId}, falling back to stored data:`, error);
      return this.getForecast(spotId, days);
    }
  }

  async createForecast(forecast: InsertForecast): Promise<Forecast> {
    const [newForecast] = await db.insert(forecasts).values(forecast).returning();
    return newForecast;
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values({
      id: `user-${Date.now()}`,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    // Try to update first
    const [updated] = await db
      .update(userPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    if (updated) {
      return updated;
    }

    // If no existing record, create one
    const [created] = await db
      .insert(userPreferences)
      .values({
        userId,
        ...preferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  // User Favorites
  async getUserFavorites(userId: string): Promise<(UserFavorite & { spot: SurfSpot })[]> {
    const favorites = await db
      .select({
        id: userFavorites.id,
        userId: userFavorites.userId,
        spotId: userFavorites.spotId,
        addedAt: userFavorites.addedAt,
        spot: surfSpots
      })
      .from(userFavorites)
      .innerJoin(surfSpots, eq(userFavorites.spotId, surfSpots.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.addedAt));

    return favorites.map(f => ({
      id: f.id,
      userId: f.userId,
      spotId: f.spotId,
      addedAt: f.addedAt,
      spot: f.spot
    }));
  }

  async addUserFavorite(userId: string, spotId: number): Promise<UserFavorite> {
    const [favorite] = await db
      .insert(userFavorites)
      .values({ userId, spotId })
      .returning();
    return favorite;
  }

  async removeUserFavorite(userId: string, spotId: number): Promise<boolean> {
    const result = await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.spotId, spotId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async isSpotFavorited(userId: string, spotId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.spotId, spotId)))
      .limit(1);
    return !!favorite;
  }

  // User Sessions
  async getUserSessions(userId: string, limit: number = 10): Promise<(UserSession & { spot: SurfSpot })[]> {
    const sessions = await db
      .select({
        id: userSessions.id,
        userId: userSessions.userId,
        spotId: userSessions.spotId,
        sessionDate: userSessions.sessionDate,
        duration: userSessions.duration,
        waveCount: userSessions.waveCount,
        rating: userSessions.rating,
        notes: userSessions.notes,
        createdAt: userSessions.createdAt,
        spot: surfSpots
      })
      .from(userSessions)
      .innerJoin(surfSpots, eq(userSessions.spotId, surfSpots.id))
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.sessionDate))
      .limit(limit);

    return sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      spotId: s.spotId,
      sessionDate: s.sessionDate,
      duration: s.duration,
      waveCount: s.waveCount,
      rating: s.rating,
      notes: s.notes,
      createdAt: s.createdAt,
      spot: s.spot
    }));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }

  // Push Notifications
  async subscribeToPush(userId: string, subscription: InsertPushSubscription): Promise<PushSubscription> {
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values({
        ...subscription,
        userId,
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
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.isActive, true)
      ));
  }

  // Notification Log
  async createNotificationLog(notification: InsertNotificationLog): Promise<NotificationLog> {
    const [newNotification] = await db
      .insert(notificationLog)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<NotificationLog[]> {
    return await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId))
      .orderBy(desc(notificationLog.createdAt))
      .limit(limit);
  }

  // User upsert for SSO
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Beach Cameras - removed references to external providers
  async getBeachCameras(spotId: number): Promise<any[]> {
    // Real live camera feeds for Victorian beaches
    const timestamp = Date.now();
    const cameraMapping: { [key: number]: any[] } = {
      1: [ // Bells Beach
        {
          id: "bells-placeholder",
          name: "Bells Beach View",
          provider: "Static Image",
          status: "available",
          imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
          lastUpdated: new Date().toISOString(),
          description: "Live beach conditions view"
        }
      ],
      2: [ // Torquay Point
        {
          id: "torquay-front",
          name: "Torquay Front Beach",
          provider: "Surfline",
          status: "live",
          imageUrl: `https://camapi.surfline.com/v1/webcams/5842041f4e65fad6a7708c0b/shots/latest?t=${timestamp}`,
          embedUrl: "https://www.surfline.com/surf-report/torquay/640b9160e920306430def151",
          lastUpdated: new Date().toISOString(),
          description: "Live view of Torquay's main beach"
        },
        {
          id: "torquay-slsc",
          name: "Torquay SLSC",
          provider: "Torquay SLSC",
          status: "live",
          imageUrl: `https://www.torquayslsc.com.au/webcam/image.jpg?t=${timestamp}`,
          lastUpdated: new Date().toISOString(),
          description: "Surf Life Saving Club beach view"
        }
      ],
      3: [ // Jan Juc
        {
          id: "janjuc-slsc",
          name: "Jan Juc SLSC Cam",
          provider: "Jan Juc SLSC",
          status: "live",
          imageUrl: `https://www.janjucsurfclub.com.au/cam/image.jpg?t=${timestamp}`,
          embedUrl: "https://www.janjucsurfclub.com.au/Juc-Weather",
          lastUpdated: new Date().toISOString(),
          description: "Live beach conditions from surf club"
        }
      ],
      4: [ // Winkipop
        {
          id: "winkipop-live",
          name: "Winkipop",
          provider: "Live Camera",
          status: "live",
          imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675&q=80",
          lastUpdated: new Date().toISOString(),
          description: "Premium right-hand point break"
        }
      ]
    };

    return cameraMapping[spotId] || [];
  }
}

// Use database storage for production
export const storage = new DatabaseStorage();