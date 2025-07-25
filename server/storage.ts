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

export class MemStorage implements IStorage {
  private surfSpots: Map<number, SurfSpot>;
  private surfConditions: Map<number, SurfCondition[]>;
  private tideTimes: Map<string, TideTime[]>; // key: spotId-date
  private forecasts: Map<number, Forecast[]>;
  private users: Map<string, User>;
  private userFavorites: Map<string, UserFavorite[]>;
  private userSessions: Map<string, UserSession[]>;
  private userPreferences: Map<string, UserPreferences>;
  private pushSubscriptions: Map<string, PushSubscription[]>;
  private notificationLog: Map<string, NotificationLog[]>;
  private currentId: number;

  constructor() {
    this.surfSpots = new Map();
    this.surfConditions = new Map();
    this.tideTimes = new Map();
    this.forecasts = new Map();
    this.users = new Map();
    this.userFavorites = new Map();
    this.userSessions = new Map();
    this.userPreferences = new Map();
    this.pushSubscriptions = new Map();
    this.notificationLog = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize Victoria surf spots with comprehensive beach type data from Wikipedia
    const spots: SurfSpot[] = [
      {
        id: 1,
        name: "Bells Beach",
        latitude: -38.367,
        longitude: 144.283,
        description: "World-famous surf break home to the Rip Curl Pro Bells Beach competition since 1962. One of the best right-hand point breaks in Australia.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Bells_Beach_2009.jpg/1280px-Bells_Beach_2009.jpg",
        region: "Surf Coast",
        difficulty: "advanced",
        beachType: "surf",
        beachCategory: "surf_beach",
        facilities: ["parking", "toilets", "walking_tracks"],
        accessInfo: "5km southwest of Torquay via Bells Beach Road. Well-maintained access road to cliff-top viewing area.",
        bestConditions: "Southwest swell 4-8ft, northwest offshore winds. Best in winter months (May-September).",
        hazards: ["strong_currents", "rocks", "experienced_surfers_only"],
        externalId: "bells-beach-vic",
        apiSource: "open-meteo"
      },
      {
        id: 2,
        name: "Torquay Point",
        latitude: -38.331,
        longitude: 144.321,
        description: "Beginner-friendly surf beach with gentle, consistent waves. Protected reef and point break suitable for learning.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Torquay_Front_Beach.jpg/1280px-Torquay_Front_Beach.jpg",
        region: "Surf Coast",
        difficulty: "beginner",
        beachType: "both",
        beachCategory: "family_beach",
        facilities: ["parking", "toilets", "cafe", "surf_schools", "lifeguards"],
        accessInfo: "Central Torquay via The Esplanade. Multiple access points and parking areas.",
        bestConditions: "Small to medium southwest swell, light offshore winds. Works on all tides.",
        hazards: ["crowds", "beginners"],
        externalId: "torquay-point-vic",
        apiSource: "open-meteo"
      },
      {
        id: 3,
        name: "Jan Juc",
        latitude: -38.365,
        longitude: 144.308,
        description: "Consistent surf beach with 1.2km of golden sand between Rocky Point and Bird Rock. Popular alternative to crowded Torquay beaches.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Jan_Juc_surf_beach.JPG/1280px-Jan_Juc_surf_beach.JPG",
        region: "Surf Coast",
        difficulty: "intermediate",
        beachType: "surf",
        beachCategory: "surf_beach",
        facilities: ["parking", "toilets", "showers", "lifeguards_summer"],
        accessInfo: "Direct access via Jan Juc Road. 100-car sealed parking area.",
        bestConditions: "Southwest to southeast swell, northwest to northeast winds. Works year-round.",
        hazards: ["rips", "shallow_sand_bars", "underwater_rocks"],
        externalId: "jan-juc-vic",
        apiSource: "open-meteo"
      },
      {
        id: 4,
        name: "Winkipop",
        latitude: -38.373,
        longitude: 144.289,
        description: "High-performance right-hand reef break adjacent to Bells Beach. Offers longer rides and works in more diverse conditions.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Winki_Pop%2C_Victoria%2C_Australia_%2835728698534%29.jpg/1280px-Winki_Pop%2C_Victoria%2C_Australia_%2835728698534%29.jpg",
        region: "Surf Coast",
        difficulty: "expert",
        beachType: "surf",
        beachCategory: "surf_beach",
        facilities: ["parking", "walking_tracks"],
        accessInfo: "Access via Bells Beach Road, then walk along coastal track. No direct vehicle access.",
        bestConditions: "Any size southwest swell, any wind direction, any tide. Very consistent.",
        hazards: ["rocks", "very_crowded", "experienced_surfers_only"],
        externalId: "winki-pop-vic",
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

    // Initialize mock user for development
    const mockUser: User = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "surfer@example.com",
      firstName: "Alex",
      lastName: "Surfer",
      displayName: "Wave Rider",
      profileImageUrl: null,
      location: "Melbourne, Victoria",
      bio: "Passionate surfer exploring Victoria's amazing coastline. Love catching waves at Bells Beach!",
      surfingExperience: "intermediate",
      phoneNumber: "+61 4XX XXX XXX",
      instagramHandle: "@alexsurfer",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
    };
    this.users.set(mockUser.id, mockUser);
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
      imageUrl: spot.imageUrl || null,
      beachType: spot.beachType || "surf",
      beachCategory: spot.beachCategory || null,
      facilities: spot.facilities || [],
      accessInfo: spot.accessInfo || null,
      bestConditions: spot.bestConditions || null,
      hazards: spot.hazards || [],
      externalId: spot.externalId || null,
      apiSource: spot.apiSource || null
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

  async getTideTimesFromBOM(spotId: number, date: string): Promise<TideTime[]> {
    try {
      const bomTideData = await getTideDataFromBOM(spotId, date);

      // Convert BOM data to our TideTime format
      const tideData: TideTime[] = bomTideData.map((bomTide, index) => {
        const datetime = new Date(bomTide.datetime);
        return {
          id: Math.floor(Math.random() * 100000) + index, // Generate temporary ID for mem storage
          spotId,
          date,
          time: datetime.toTimeString().substring(0, 5), // HH:MM format
          height: bomTide.height,
          type: bomTide.type
        };
      });

      // Store in memory cache
      const key = `${spotId}-${date}`;
      this.tideTimes.set(key, tideData);

      return tideData;
    } catch (error) {
      console.error('Error fetching BOM tide data:', error);
      return this.getTideTimesForDate(spotId, date);
    }
  }

  async getHourlyTideReport(spotId: number, date: string): Promise<any[]> {
    try {
      const hourlyData = await getHourlyTideReport(spotId, date);
      return hourlyData;
    } catch (error) {
      console.error('Error fetching hourly tide report:', error);
      return [];
    }
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

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const userId = `user-${this.currentId++}`;
    const newUser: User = {
      id: userId,
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      displayName: user.displayName || null,
      profileImageUrl: user.profileImageUrl || null,
      location: user.location || null,
      bio: user.bio || null,
      surfingExperience: user.surfingExperience || null,
      phoneNumber: user.phoneNumber || null,
      instagramHandle: user.instagramHandle || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existing = this.users.get(user.id);
    if (existing) {
      const updated: User = {
        ...existing,
        ...user,
        updatedAt: new Date()
      };
      this.users.set(user.id, updated);
      return updated;
    } else {
      return this.createUser(user);
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // User Favorites
  async getUserFavorites(userId: string): Promise<(UserFavorite & { spot: SurfSpot })[]> {
    const favorites = this.userFavorites.get(userId) || [];
    return favorites.map(fav => ({
      ...fav,
      spot: this.surfSpots.get(fav.spotId!)!
    }));
  }

  async addUserFavorite(userId: string, spotId: number): Promise<UserFavorite> {
    const favorite: UserFavorite = {
      id: this.currentId++,
      userId,
      spotId,
      addedAt: new Date()
    };

    if (!this.userFavorites.has(userId)) {
      this.userFavorites.set(userId, []);
    }
    this.userFavorites.get(userId)!.push(favorite);
    return favorite;
  }

  async removeUserFavorite(userId: string, spotId: number): Promise<boolean> {
    const favorites = this.userFavorites.get(userId) || [];
    const index = favorites.findIndex(fav => fav.spotId === spotId);
    if (index > -1) {
      favorites.splice(index, 1);
      return true;
    }
    return false;
  }

  async isSpotFavorited(userId: string, spotId: number): Promise<boolean> {
    const favorites = this.userFavorites.get(userId) || [];
    return favorites.some(fav => fav.spotId === spotId);
  }

  // User Sessions
  async getUserSessions(userId: string, limit: number = 20): Promise<(UserSession & { spot: SurfSpot })[]> {
    const sessions = this.userSessions.get(userId) || [];
    return sessions.slice(0, limit).map(session => ({
      ...session,
      spot: this.surfSpots.get(session.spotId!)!
    }));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const newSession: UserSession = {
      ...session,
      id: this.currentId++,
      createdAt: new Date(),
      userId: session.userId || null,
      spotId: session.spotId || null,
      rating: session.rating || null,
      notes: session.notes || null,
      duration: session.duration || null,
      waveHeight: session.waveHeight || null
    };

    if (!this.userSessions.has(session.userId!)) {
      this.userSessions.set(session.userId!, []);
    }
    this.userSessions.get(session.userId!)!.push(newSession);
    return newSession;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.userPreferences.get(userId);
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = this.userPreferences.get(userId);

    if (existing) {
      const updated: UserPreferences = {
        ...existing,
        ...preferences,
        updatedAt: new Date()
      };
      this.userPreferences.set(userId, updated);
      return updated;
    } else {
      const newPrefs: UserPreferences = {
        id: this.currentId++,
        userId,
        preferredUnits: "metric",
        defaultLocation: null,
        emailNotifications: true,
        pushNotifications: true,
        optimalConditionAlerts: true,
        waveHeightMin: 1.0,
        waveHeightMax: 4.0,
        windSpeedMax: 20,
        favoriteRegions: ["Surf Coast"],
        skillLevel: "intermediate",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...preferences
      };
      this.userPreferences.set(userId, newPrefs);
      return newPrefs;
    }
  }

  // Push Notifications
  async subscribeToPush(userId: string, subscription: InsertPushSubscription): Promise<PushSubscription> {
    const newSubscription: PushSubscription = {
      ...subscription,
      id: this.currentId++,
      userId: subscription.userId || null,
      isActive: true,
      createdAt: new Date(),
      userAgent: subscription.userAgent || null
    };

    if (!this.pushSubscriptions.has(userId)) {
      this.pushSubscriptions.set(userId, []);
    }
    this.pushSubscriptions.get(userId)!.push(newSubscription);
    return newSubscription;
  }

  async unsubscribeFromPush(userId: string, endpoint: string): Promise<boolean> {
    const subscriptions = this.pushSubscriptions.get(userId) || [];
    const subscription = subscriptions.find(sub => sub.endpoint === endpoint);
    if (subscription) {
      subscription.isActive = false;
      return true;
    }
    return false;
  }

  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const subscriptions = this.pushSubscriptions.get(userId) || [];
    return subscriptions.filter(sub => sub.isActive);
  }

  // Notification Log
  async createNotificationLog(notification: InsertNotificationLog): Promise<NotificationLog> {
    const newNotification: NotificationLog = {
      ...notification,
      id: this.currentId++,
      sent: false,
      sentAt: null,
      createdAt: new Date(),
      userId: notification.userId || null,
      spotId: notification.spotId || null
    };

    if (!this.notificationLog.has(notification.userId!)) {
      this.notificationLog.set(notification.userId!, []);
    }
    this.notificationLog.get(notification.userId!)!.push(newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<NotificationLog[]> {
    const notifications = this.notificationLog.get(userId) || [];
    return notifications.slice(0, limit);
  }

  // Beach Cameras
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
          description: "Scenic view of the world-famous Bells Beach break",
          note: "Live camera feeds require premium subscriptions - visit Swellnet or Surfline for real-time feeds"
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
          id: "winkipop-swellnet",
          name: "Winkipop",
          provider: "Swellnet",
          status: "live",
          imageUrl: `https://cams.swellnet.com/cache/winkipop-latest.jpg?t=${timestamp}`,
          embedUrl: "https://www.swellnet.com/surfcams/winkipop",
          lastUpdated: new Date().toISOString(),
          description: "Premium right-hand point break"
        }
      ]
    };

    return cameraMapping[spotId] || [];
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

      // Insert new BOM tide data
      if (tideData.length > 0) {
        const insertedTides = await db.insert(tideTimes).values(tideData).returning();
        return insertedTides;
      }

      return [];
    } catch (error) {
      console.error('Error fetching BOM tide data:', error);
      return this.getTideTimesForDate(spotId, date);
    }
  }

  async getHourlyTideReport(spotId: number, date: string): Promise<any[]> {
    try {
      const hourlyData = await getHourlyTideReport(spotId, date);
      return hourlyData;
    } catch (error) {
      console.error('Error fetching hourly tide report:', error);
      return [];
    }
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

  // Beach Cameras
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
          description: "Scenic view of the world-famous Bells Beach break",
          note: "Live camera feeds require premium subscriptions - visit Swellnet or Surfline for real-time feeds"
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
          id: "winkipop-swellnet",
          name: "Winkipop",
          provider: "Swellnet",
          status: "live",
          imageUrl: `https://cams.swellnet.com/cache/winkipop-latest.jpg?t=${timestamp}`,
          embedUrl: "https://www.swellnet.com/surfcams/winkipop",
          lastUpdated: new Date().toISOString(),
          description: "Premium right-hand point break"
        }
      ]
    };

    return cameraMapping[spotId] || [];
  }
}

// Use database storage for production, memory storage for fallback
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();