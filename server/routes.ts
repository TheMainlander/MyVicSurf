import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Global flag to track auth status
let authConfigured = false;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication for production with Replit Auth
  const hasRequiredEnvVars = process.env.DATABASE_URL && 
                            process.env.REPLIT_DOMAINS && 
                            process.env.REPL_ID && 
                            process.env.SESSION_SECRET;

  if (hasRequiredEnvVars) {
    try {
      await setupAuth(app);
      authConfigured = true;
      console.log("Replit Auth configured successfully");
    } catch (error) {
      console.error("Replit Auth configuration failed:", (error as Error).message);
      console.warn("Continuing without authentication - some features may be limited");
      authConfigured = false;
    }
  } else {
    const missingVars = [
      !process.env.DATABASE_URL && 'DATABASE_URL',
      !process.env.REPLIT_DOMAINS && 'REPLIT_DOMAINS', 
      !process.env.REPL_ID && 'REPL_ID',
      !process.env.SESSION_SECRET && 'SESSION_SECRET'
    ].filter(Boolean);
    
    console.warn(`Replit Auth not configured - missing environment variables: ${missingVars.join(', ')}`);
    console.warn("Application will run without authentication");
    authConfigured = false;
  }

  // Add fallback authentication endpoints when auth is not configured
  if (!authConfigured) {
    app.get('/api/login', (req, res) => {
      res.status(503).json({ 
        error: 'Authentication not configured', 
        message: 'Missing required environment variables for authentication'
      });
    });

    app.get('/api/callback', (req, res) => {
      res.status(503).json({ 
        error: 'Authentication not configured'
      });
    });

    app.get('/api/logout', (req, res) => {
      res.redirect('/');
    });

    app.get('/api/auth/user', (req, res) => {
      res.status(401).json({ 
        error: 'Authentication not configured'
      });
    });
  }

  // Health check endpoint for production monitoring
  app.get('/api/health', async (req, res) => {
    try {
      // Check database connection
      const spots = await storage.getSurfSpots();
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: 'connected',
        spotsCount: spots.length,
        environment: process.env.NODE_ENV || 'development',
        authentication: authConfigured ? 'enabled' : 'disabled',
        missingEnvVars: authConfigured ? [] : [
          !process.env.DATABASE_URL && 'DATABASE_URL',
          !process.env.REPLIT_DOMAINS && 'REPLIT_DOMAINS',
          !process.env.REPL_ID && 'REPL_ID', 
          !process.env.SESSION_SECRET && 'SESSION_SECRET'
        ].filter(Boolean)
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
        authentication: authConfigured ? 'enabled' : 'disabled'
      });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all surf spots
  app.get("/api/surf-spots", async (req, res) => {
    try {
      const spots = await storage.getSurfSpots();
      res.json(spots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surf spots" });
    }
  });

  // Get specific surf spot
  app.get("/api/surf-spots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spot = await storage.getSurfSpot(id);
      if (!spot) {
        return res.status(404).json({ message: "Surf spot not found" });
      }
      res.json(spot);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surf spot" });
    }
  });

  // Get current conditions for a spot (using real API)
  app.get("/api/surf-spots/:id/conditions", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const useRealData = req.query.api === 'true';
      
      let conditions;
      if (useRealData) {
        conditions = await storage.getCurrentConditionsFromAPI(spotId);
      } else {
        conditions = await storage.getCurrentConditions(spotId);
      }
      
      if (!conditions) {
        return res.status(404).json({ message: "No conditions found for this spot" });
      }
      res.json(conditions);
    } catch (error) {
      console.error("Error fetching conditions:", error);
      res.status(500).json({ message: "Failed to fetch surf conditions" });
    }
  });

  // Get tide times for a specific date
  app.get("/api/surf-spots/:id/tides", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const useBOM = req.query.bom === 'true';
      
      let tides;
      if (useBOM) {
        tides = await storage.getTideTimesFromBOM(spotId, date);
      } else {
        tides = await storage.getTideTimesForDate(spotId, date);
      }
      
      res.json(tides);
    } catch (error) {
      console.error("Error fetching tide times:", error);
      res.status(500).json({ message: "Failed to fetch tide times" });
    }
  });

  // Get BOM tide data specifically (always fetches from BOM)
  app.get("/api/surf-spots/:id/tides/bom", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const tides = await storage.getTideTimesFromBOM(spotId, date);
      res.json(tides);
    } catch (error) {
      console.error("Error fetching BOM tide data:", error);
      res.status(500).json({ message: "Failed to fetch BOM tide data" });
    }
  });

  // Get hourly tide report for Victorian beaches
  app.get("/api/surf-spots/:id/tides/hourly", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const hourlyTides = await storage.getHourlyTideReport(spotId, date);
      res.json(hourlyTides);
    } catch (error) {
      console.error("Error fetching hourly tide report:", error);
      res.status(500).json({ message: "Failed to fetch hourly tide report" });
    }
  });

  // Get forecast for a spot (using real API)
  app.get("/api/surf-spots/:id/forecast", async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 7;
      const useRealData = req.query.api === 'true';
      
      let forecast;
      if (useRealData) {
        forecast = await storage.getForecastFromAPI(spotId, days);
      } else {
        forecast = await storage.getForecast(spotId, days);
      }
      
      res.json(forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      res.status(500).json({ message: "Failed to fetch forecast" });
    }
  });

  // Get nearby spots with real-time conditions
  app.get("/api/surf-spots/:id/nearby", async (req, res) => {
    try {
      const currentSpotId = parseInt(req.params.id);
      const useRealData = req.query.api === 'true';
      const allSpots = await storage.getSurfSpots();
      const nearbySpots = allSpots.filter(spot => spot.id !== currentSpotId);
      
      // Add current conditions to each spot
      const spotsWithConditions = await Promise.all(
        nearbySpots.map(async (spot) => {
          let conditions;
          if (useRealData) {
            conditions = await storage.getCurrentConditionsFromAPI(spot.id);
          } else {
            conditions = await storage.getCurrentConditions(spot.id);
          }
          return {
            ...spot,
            conditions
          };
        })
      );
      
      res.json(spotsWithConditions);
    } catch (error) {
      console.error("Error fetching nearby spots:", error);
      res.status(500).json({ message: "Failed to fetch nearby spots" });
    }
  });

  // User favorites routes
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = req.params.userId;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { spotId } = req.body;
      
      // Check if already favorited
      const isAlreadyFavorited = await storage.isSpotFavorited(userId, spotId);
      if (isAlreadyFavorited) {
        return res.status(409).json({ message: "Spot already favorited" });
      }
      
      const favorite = await storage.addUserFavorite(userId, spotId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/users/:userId/favorites/:spotId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const spotId = parseInt(req.params.spotId);
      
      const removed = await storage.removeUserFavorite(userId, spotId);
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Check if spot is favorited
  app.get("/api/users/:userId/favorites/:spotId/check", async (req, res) => {
    try {
      const userId = req.params.userId;
      const spotId = parseInt(req.params.spotId);
      
      const isFavorited = await storage.isSpotFavorited(userId, spotId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // User sessions routes
  app.get("/api/users/:userId/sessions", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const sessions = await storage.getUserSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/users/:userId/sessions", async (req, res) => {
    try {
      const userId = req.params.userId;
      const sessionData = { ...req.body, userId };
      
      const session = await storage.createUserSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // User preferences routes
  app.get("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = req.params.userId;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.put("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = req.params.userId;
      const preferences = await storage.updateUserPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Push notification routes
  app.post("/api/users/:userId/push-subscribe", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { endpoint, keys, userAgent } = req.body;

      const subscription = await storage.subscribeToPush(userId, {
        userId,
        endpoint,
        p256dhKey: keys.p256dh,
        authKey: keys.auth,
        userAgent: userAgent || null,
        isActive: true
      });

      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      res.status(500).json({ message: "Failed to subscribe to push notifications" });
    }
  });

  app.delete("/api/users/:userId/push-unsubscribe", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { endpoint } = req.body;

      const unsubscribed = await storage.unsubscribeFromPush(userId, endpoint);
      if (!unsubscribed) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      res.status(500).json({ message: "Failed to unsubscribe from push notifications" });
    }
  });

  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // VAPID public key endpoint
  app.get("/api/vapid-public-key", (req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY || "BNJzp5DbZefY5Zu9KoLVJFJQdqhqLnz3FOq2z_BwHjEeojJ1KJRUhEJdnqKW_YQJpEjW2x7aSWgKXDq6qsKsZBE";
    res.json({ publicKey });
  });

  const httpServer = createServer(app);
  return httpServer;
}
