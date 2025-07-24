import { 
  surfSpots, 
  surfConditions, 
  tideTimes, 
  forecasts,
  type SurfSpot, 
  type SurfCondition, 
  type TideTime, 
  type Forecast,
  type InsertSurfSpot,
  type InsertSurfCondition,
  type InsertTideTime,
  type InsertForecast
} from "@shared/schema";

export interface IStorage {
  // Surf Spots
  getSurfSpots(): Promise<SurfSpot[]>;
  getSurfSpot(id: number): Promise<SurfSpot | undefined>;
  createSurfSpot(spot: InsertSurfSpot): Promise<SurfSpot>;

  // Surf Conditions
  getCurrentConditions(spotId: number): Promise<SurfCondition | undefined>;
  createSurfCondition(condition: InsertSurfCondition): Promise<SurfCondition>;

  // Tide Times
  getTideTimesForDate(spotId: number, date: string): Promise<TideTime[]>;
  createTideTime(tide: InsertTideTime): Promise<TideTime>;

  // Forecasts
  getForecast(spotId: number, days: number): Promise<Forecast[]>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;
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
    // Initialize Victoria surf spots
    const spots: SurfSpot[] = [
      {
        id: 1,
        name: "Bells Beach",
        latitude: -38.3720,
        longitude: 144.2820,
        description: "World-famous surf break, home of the Rip Curl Pro",
        imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        region: "Surf Coast",
        difficulty: "intermediate"
      },
      {
        id: 2,
        name: "Torquay Point",
        latitude: -38.3306,
        longitude: 144.3272,
        description: "Consistent waves in the heart of surf city",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
        region: "Surf Coast",
        difficulty: "beginner"
      },
      {
        id: 3,
        name: "Jan Juc",
        latitude: -38.3500,
        longitude: 144.3000,
        description: "Popular beach break with good learning waves",
        imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
        region: "Surf Coast",
        difficulty: "beginner"
      },
      {
        id: 4,
        name: "Winki Pop",
        latitude: -38.3750,
        longitude: 144.2800,
        description: "World-class right-hand point break",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
        region: "Surf Coast",
        difficulty: "expert"
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

export const storage = new MemStorage();
