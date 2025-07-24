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
import { getCurrentConditionsFromAPI, getForecastFromAPI } from "./api-integrations";
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
  createTideTime(tide: InsertTideTime): Promise<TideTime>;

  // Forecasts
  getForecast(spotId: number, days: number): Promise<Forecast[]>;
  getForecastFromAPI(spotId: number, days: number): Promise<Forecast[]>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
}

export class MemStorage implements IStorage {
  private surfSpots: Map<number, SurfSpot>;
  private surfConditions: Map<number, SurfCondition[]>;
  private tideTimes: Map<string, TideTime[]>; // key: spotId-date
  private forecasts: Map<number, Forecast[]>;
  private currentId: number;

  constructor() {
    this.surfSpots = new Map();
    this.surfConditions = new Map();
    this.tideTimes = new Map();
    this.forecasts = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize Victoria surf spots with accurate coordinates for API integration
    const spots: SurfSpot[] = [
      {
        id: 1,
        name: "Bells Beach",
        latitude: -38.3720,
        longitude: 144.2820,
        description: "World-famous surf break, home of the Rip Curl Pro",
        imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        region: "Surf Coast",
        difficulty: "intermediate",
        externalId: null,
        apiSource: "open-meteo"
      },
      {
        id: 2,
        name: "Torquay Point",
        latitude: -38.3306,
        longitude: 144.3272,
        description: "Consistent waves in the heart of surf city",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
        region: "Surf Coast",
        difficulty: "beginner",
        externalId: null,
        apiSource: "open-meteo"
      },
      {
        id: 3,
        name: "Jan Juc",
        latitude: -38.3500,
        longitude: 144.3000,
        description: "Popular beach break with good learning waves",
        imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
        region: "Surf Coast",
        difficulty: "beginner",
        externalId: null,
        apiSource: "open-meteo"
      },
      {
        id: 4,
        name: "Winki Pop",
        latitude: -38.3750,
        longitude: 144.2800,
        description: "World-class right-hand point break",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
        region: "Surf Coast",
        difficulty: "expert",
        externalId: null,
        apiSource: "open-meteo"
      }
    ];

    spots.forEach(spot => this.surfSpots.set(spot.id, spot));

    // Initialize current conditions
    const conditions: SurfCondition[] = [
      {
        id: 1,
        spotId: 1,
        waveHeight: 1.2,
        waveDirection: "SW",
        wavePeriod: 12,
        windSpeed: 15,
        windDirection: "SW",
        airTemperature: 22,
        waterTemperature: 18,
        rating: "good",
        timestamp: new Date()
      },
      {
        id: 2,
        spotId: 2,
        waveHeight: 1.0,
        waveDirection: "S",
        wavePeriod: 10,
        windSpeed: 12,
        windDirection: "NE",
        airTemperature: 23,
        waterTemperature: 18,
        rating: "good",
        timestamp: new Date()
      },
      {
        id: 3,
        spotId: 3,
        waveHeight: 0.7,
        waveDirection: "S",
        wavePeriod: 8,
        windSpeed: 12,
        windDirection: "NE",
        airTemperature: 23,
        waterTemperature: 18,
        rating: "fair",
        timestamp: new Date()
      },
      {
        id: 4,
        spotId: 4,
        waveHeight: 1.5,
        waveDirection: "SW",
        wavePeriod: 14,
        windSpeed: 8,
        windDirection: "SW",
        airTemperature: 22,
        waterTemperature: 18,
        rating: "excellent",
        timestamp: new Date()
      }
    ];

    conditions.forEach(condition => {
      if (!this.surfConditions.has(condition.spotId)) {
        this.surfConditions.set(condition.spotId, []);
      }
      this.surfConditions.get(condition.spotId)!.push(condition);
    });

    // Initialize tide times for today
    const today = new Date().toISOString().split('T')[0];
    const tides: TideTime[] = [
      { id: 1, spotId: 1, date: today, time: "06:32", height: 1.8, type: "high" },
      { id: 2, spotId: 1, date: today, time: "12:45", height: 0.3, type: "low" },
      { id: 3, spotId: 1, date: today, time: "19:15", height: 1.6, type: "high" },
    ];

    tides.forEach(tide => {
      const key = `${tide.spotId}-${tide.date}`;
      if (!this.tideTimes.has(key)) {
        this.tideTimes.set(key, []);
      }
      this.tideTimes.get(key)!.push(tide);
    });

    // Initialize 7-day forecast
    const forecasts: Forecast[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      spots.forEach(spot => {
        const forecast: Forecast = {
          id: forecasts.length + 1,
          spotId: spot.id,
          date: dateStr,
          waveHeight: 0.8 + Math.random() * 1.5,
          waveDirection: ["S", "SW", "W", "NW"][Math.floor(Math.random() * 4)] as string,
          windSpeed: 8 + Math.random() * 15,
          windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
          rating: ["fair", "good", "very-good", "excellent"][Math.floor(Math.random() * 4)],
          airTemperature: 18 + Math.random() * 8,
          waterTemperature: 16 + Math.random() * 4
        };
        forecasts.push(forecast);
      });
    }

    forecasts.forEach(forecast => {
      if (!this.forecasts.has(forecast.spotId)) {
        this.forecasts.set(forecast.spotId, []);
      }
      this.forecasts.get(forecast.spotId)!.push(forecast);
    });

    this.currentId = Math.max(
      Math.max(...Array.from(this.surfSpots.keys())) + 1,
      forecasts.length + 1
    );
  }

  async getSurfSpots(): Promise<SurfSpot[]> {
    return Array.from(this.surfSpots.values());
  }

  async getSurfSpot(id: number): Promise<SurfSpot | undefined> {
    return this.surfSpots.get(id);
  }

  async createSurfSpot(spot: InsertSurfSpot): Promise<SurfSpot> {
    const id = this.currentId++;
    const newSpot: SurfSpot = { 
      ...spot, 
      id,
      description: spot.description || null,
      imageUrl: spot.imageUrl || null 
    };
    this.surfSpots.set(id, newSpot);
    return newSpot;
  }

  async getCurrentConditions(spotId: number): Promise<SurfCondition | undefined> {
    const conditions = this.surfConditions.get(spotId);
    return conditions?.[conditions.length - 1];
  }

  async getCurrentConditionsFromAPI(spotId: number): Promise<SurfCondition | undefined> {
    try {
      const spot = this.surfSpots.get(spotId);
      if (!spot) return undefined;

      const apiConditions = await getCurrentConditionsFromAPI(spotId, spot.latitude, spot.longitude);
      
      // Create and store the new conditions
      const id = this.currentId++;
      const newCondition: SurfCondition = {
        ...apiConditions,
        id,
        spotId,
        waveHeight: apiConditions.waveHeight || 0,
        windSpeed: apiConditions.windSpeed || 0,
        windDirection: apiConditions.windDirection || "N",
        airTemperature: apiConditions.airTemperature || 20,
        waterTemperature: apiConditions.waterTemperature || 18,
        rating: apiConditions.rating || "fair",
        timestamp: new Date(),
        waveDirection: apiConditions.waveDirection || null,
        wavePeriod: apiConditions.wavePeriod || null
      };

      if (!this.surfConditions.has(spotId)) {
        this.surfConditions.set(spotId, []);
      }
      this.surfConditions.get(spotId)!.push(newCondition);
      
      return newCondition;
    } catch (error) {
      console.error(`API fetch failed for spot ${spotId}, falling back to stored data:`, error);
      return this.getCurrentConditions(spotId);
    }
  }

  async createSurfCondition(condition: InsertSurfCondition): Promise<SurfCondition> {
    const id = this.currentId++;
    const newCondition: SurfCondition = { 
      ...condition, 
      id, 
      timestamp: new Date(),
      waveDirection: condition.waveDirection || null,
      wavePeriod: condition.wavePeriod || null
    };
    
    if (!this.surfConditions.has(condition.spotId)) {
      this.surfConditions.set(condition.spotId, []);
    }
    this.surfConditions.get(condition.spotId)!.push(newCondition);
    return newCondition;
  }

  async getTideTimesForDate(spotId: number, date: string): Promise<TideTime[]> {
    const key = `${spotId}-${date}`;
    return this.tideTimes.get(key) || [];
  }

  async createTideTime(tide: InsertTideTime): Promise<TideTime> {
    const id = this.currentId++;
    const newTide: TideTime = { ...tide, id };
    
    const key = `${tide.spotId}-${tide.date}`;
    if (!this.tideTimes.has(key)) {
      this.tideTimes.set(key, []);
    }
    this.tideTimes.get(key)!.push(newTide);
    return newTide;
  }

  async getForecast(spotId: number, days: number): Promise<Forecast[]> {
    const allForecasts = this.forecasts.get(spotId) || [];
    return allForecasts.slice(0, days);
  }

  async getForecastFromAPI(spotId: number, days: number): Promise<Forecast[]> {
    try {
      const spot = this.surfSpots.get(spotId);
      if (!spot) return [];

      const apiForecast = await getForecastFromAPI(spotId, spot.latitude, spot.longitude, days);
      
      const forecasts: Forecast[] = apiForecast.map((forecast, index) => ({
        id: this.currentId + index,
        spotId,
        date: forecast.date || new Date().toISOString().split('T')[0],
        waveHeight: forecast.waveHeight || 0,
        waveDirection: forecast.waveDirection || null,
        windSpeed: forecast.windSpeed || 0,
        windDirection: forecast.windDirection || "N",
        rating: forecast.rating || "fair",
        airTemperature: forecast.airTemperature || 20,
        waterTemperature: forecast.waterTemperature || 18
      }));

      // Update the currentId to account for new forecast entries
      this.currentId += forecasts.length;

      // Store the forecasts
      this.forecasts.set(spotId, forecasts);
      
      return forecasts;
    } catch (error) {
      console.error(`API forecast fetch failed for spot ${spotId}, falling back to stored data:`, error);
      return this.getForecast(spotId, days);
    }
  }

  async createForecast(forecast: InsertForecast): Promise<Forecast> {
    const id = this.currentId++;
    const newForecast: Forecast = { 
      ...forecast, 
      id,
      waveDirection: forecast.waveDirection || null
    };
    
    if (!this.forecasts.has(forecast.spotId)) {
      this.forecasts.set(forecast.spotId, []);
    }
    this.forecasts.get(forecast.spotId)!.push(newForecast);
    return newForecast;
  }
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

  async createTideTime(tide: InsertTideTime): Promise<TideTime> {
    const [newTide] = await db.insert(tideTimes).values(tide).returning();
    return newTide;
  }

  async getForecast(spotId: number, days: number): Promise<Forecast[]> {
    return await db
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, spotId))
      .limit(days);
  }

  async getForecastFromAPI(spotId: number, days: number): Promise<Forecast[]> {
    try {
      const spot = await this.getSurfSpot(spotId);
      if (!spot) return [];

      const apiForecast = await getForecastFromAPI(spotId, spot.latitude, spot.longitude, days);
      
      // Clear existing forecasts for this spot to avoid duplicates
      await db.delete(forecasts).where(eq(forecasts.spotId, spotId));

      const forecastData = apiForecast.map(forecast => ({
        spotId,
        date: forecast.date || new Date().toISOString().split('T')[0],
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
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
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
    return result.rowCount > 0;
  }

  async isSpotFavorited(userId: string, spotId: number): Promise<boolean> {
    const [favorite] = await db
      .select({ id: userFavorites.id })
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.spotId, spotId)));
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
        waveHeight: userSessions.waveHeight,
        rating: userSessions.rating,
        notes: userSessions.notes,
        duration: userSessions.duration,
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
      waveHeight: s.waveHeight,
      rating: s.rating,
      notes: s.notes,
      duration: s.duration,
      createdAt: s.createdAt,
      spot: s.spot
    }));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db.insert(userSessions).values(session).returning();
    return newSession;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ userId, ...preferences })
        .returning();
      return created;
    }
  }

  // Push Notifications
  async subscribeToPush(userId: string, subscription: InsertPushSubscription): Promise<PushSubscription> {
    // Deactivate existing subscriptions for this user
    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.userId, userId));

    // Create new subscription
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values(subscription)
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
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

// Use database storage for production, memory storage for fallback
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
