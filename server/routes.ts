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

  // User profile routes
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.patch("/api/users/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      
      // Validate profile image URL if provided
      if (updateData.profileImageUrl && updateData.profileImageUrl.trim() === "") {
        updateData.profileImageUrl = null;
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(500).json({ message: "Failed to update user profile" });
      }
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

  // Beach cameras endpoint
  app.get("/api/surf-spots/:spotId/cameras", async (req, res) => {
    try {
      const spotId = parseInt(req.params.spotId);
      const cameras = await storage.getBeachCameras(spotId);
      res.json(cameras);
    } catch (error) {
      console.error("Error fetching beach cameras:", error);
      res.status(500).json({ message: "Failed to fetch beach cameras" });
    }
  });

  // Beach camera screenshot endpoint
  app.get("/api/surf-spots/:spotId/cameras/:cameraId/screenshot", async (req, res) => {
    try {
      const spotId = parseInt(req.params.spotId);
      const cameraId = req.params.cameraId;
      
      // Get camera information
      const cameras = await storage.getBeachCameras(spotId);
      const camera = cameras.find(cam => cam.id === cameraId);
      
      if (!camera || !camera.imageUrl) {
        return res.status(404).json({ message: "Camera or image not found" });
      }

      // Fetch the image from the camera URL
      const imageResponse = await fetch(camera.imageUrl);
      if (!imageResponse.ok) {
        return res.status(502).json({ message: "Failed to fetch camera image" });
      }

      // Stream the image back to the client
      const imageBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${camera.name}-screenshot.jpg"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
    } catch (error) {
      console.error("Error capturing camera screenshot:", error);
      res.status(500).json({ message: "Failed to capture screenshot" });
    }
  });

  // VAPID public key endpoint
  app.get("/api/vapid-public-key", (req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY || "BNJzp5DbZefY5Zu9KoLVJFJQdqhqLnz3FOq2z_BwHjEeojJ1KJRUhEJdnqKW_YQJpEjW2x7aSWgKXDq6qsKsZBE";
    res.json({ publicKey });
  });

  // Payment and Subscription Routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.get("/api/subscription-plans/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const plan = await storage.getSubscriptionPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      res.status(500).json({ message: "Failed to fetch subscription plan" });
    }
  });

  // Stripe payment intent for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        message: "Payment processing not configured. Stripe secret key is missing." 
      });
    }

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-06-30.basil",
      });

      const { amount, planId } = req.body;
      
      // Create payment record in database
      let userId = req.user ? (req.user as any).id : "guest";
      
      const payment = await storage.createPayment({
        userId,
        amount: amount,
        currency: "aud",
        status: "pending",
        paymentType: "subscription",
        description: `Subscription plan ${planId}`,
        metadata: { planId: planId.toString() }
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "aud",
        metadata: {
          paymentId: payment.id.toString(),
          planId: planId.toString(),
          userId: userId
        }
      });

      // Update payment with Stripe ID
      await storage.updatePaymentStatus(payment.id, "pending");
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id 
      });
    } catch (error: any) {
      console.error("Payment intent creation failed:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Get user subscription status
  app.get("/api/users/:userId/subscription", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUserSubscriptionStatus(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        subscriptionStatus: user.subscriptionStatus || "free",
        subscriptionPlan: user.subscriptionPlan || "free",
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId
      });
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // Get user payment history
  app.get("/api/users/:userId/payments", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const payments = await storage.getUserPayments(userId, limit);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Stripe webhook for payment confirmations (future implementation)
  app.post("/api/stripe-webhook", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    try {
      // This would handle Stripe webhooks for payment confirmations
      // Implementation would verify webhook signature and update payment status
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handling failed:", error);
      res.status(400).json({ message: "Webhook handling failed" });
    }
  });

  // Admin Routes for Carousel Images
  app.get('/api/admin/carousel-images', isAuthenticated, async (req, res) => {
    try {
      const images = await storage.getCarouselImages();
      res.json(images);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      res.status(500).json({ message: 'Failed to fetch carousel images' });
    }
  });

  app.post('/api/admin/carousel-images', isAuthenticated, async (req, res) => {
    try {
      const imageData = req.body;
      const newImage = await storage.createCarouselImage(imageData);
      res.json(newImage);
    } catch (error) {
      console.error('Error creating carousel image:', error);
      res.status(500).json({ message: 'Failed to create carousel image' });
    }
  });

  app.put('/api/admin/carousel-images/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedImage = await storage.updateCarouselImage(id, updates);
      res.json(updatedImage);
    } catch (error) {
      console.error('Error updating carousel image:', error);
      res.status(500).json({ message: 'Failed to update carousel image' });
    }
  });

  app.delete('/api/admin/carousel-images/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCarouselImage(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting carousel image:', error);
      res.status(500).json({ message: 'Failed to delete carousel image' });
    }
  });

  // Public route for getting carousel images (for landing page)
  app.get('/api/carousel-images', async (req, res) => {
    try {
      const images = await storage.getCarouselImages();
      res.json(images);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      res.status(500).json({ message: 'Failed to fetch carousel images' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
