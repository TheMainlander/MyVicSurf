import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireAdmin, requireSuperAdmin } from "./middleware/admin-auth";

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

  // Admin Beach Management Routes
  app.put('/api/admin/surf-spots/:id', requireAdmin, async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const spotData = req.body;
      
      // Validate required fields
      if (!spotData.name || !spotData.region) {
        return res.status(400).json({ message: "Name and region are required" });
      }
      
      const updatedSpot = await storage.updateSurfSpot(spotId, spotData);
      if (!updatedSpot) {
        return res.status(404).json({ message: "Surf spot not found" });
      }
      
      res.json(updatedSpot);
    } catch (error) {
      console.error("Error updating surf spot:", error);
      res.status(500).json({ message: "Failed to update surf spot" });
    }
  });

  app.post('/api/admin/surf-spots', requireAdmin, async (req, res) => {
    try {
      const spotData = req.body;
      
      // Validate required fields
      if (!spotData.name || !spotData.region) {
        return res.status(400).json({ message: "Name and region are required" });
      }
      
      // Set defaults for optional fields
      const newSpotData = {
        ...spotData,
        latitude: spotData.latitude || 0,
        longitude: spotData.longitude || 0,
        difficulty: spotData.difficulty || 'beginner',
        beachType: spotData.beachType || 'surf',
        beachCategory: spotData.beachCategory || 'surf_beach',
        facilities: spotData.facilities || [],
        hazards: spotData.hazards || []
      };
      
      const newSpot = await storage.createSurfSpot(newSpotData);
      res.status(201).json(newSpot);
    } catch (error) {
      console.error("Error creating surf spot:", error);
      res.status(500).json({ message: "Failed to create surf spot" });
    }
  });

  app.delete('/api/admin/surf-spots/:id', requireAdmin, async (req, res) => {
    try {
      const spotId = parseInt(req.params.id);
      const deleted = await storage.deleteSurfSpot(spotId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Surf spot not found" });
      }
      
      res.json({ message: "Surf spot deleted successfully" });
    } catch (error) {
      console.error("Error deleting surf spot:", error);
      res.status(500).json({ message: "Failed to delete surf spot" });
    }
  });

  // Admin Routes for Carousel Images
  app.get('/api/admin/carousel-images', requireAdmin, async (req, res) => {
    try {
      const images = await storage.getCarouselImages();
      res.json(images);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      res.status(500).json({ message: 'Failed to fetch carousel images' });
    }
  });

  app.post('/api/admin/carousel-images', requireAdmin, async (req, res) => {
    try {
      const imageData = req.body;
      const newImage = await storage.createCarouselImage(imageData);
      res.json(newImage);
    } catch (error) {
      console.error('Error creating carousel image:', error);
      res.status(500).json({ message: 'Failed to create carousel image' });
    }
  });

  app.put('/api/admin/carousel-images/:id', requireAdmin, async (req, res) => {
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

  app.delete('/api/admin/carousel-images/:id', requireAdmin, async (req, res) => {
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

  // Serve admin guide documentation
  app.get('/ADMIN_GUIDE.md', (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.sendFile(path.join(__dirname, '../ADMIN_GUIDE.md'));
  });

  // Admin User Management Routes
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await storage.getAllUsers(limit);
      
      // Remove sensitive information
      const sanitizedUsers = users.map(user => ({
        ...user,
        stripeCustomerId: undefined,
        stripeSubscriptionId: undefined
      }));
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.put('/api/admin/users/:userId/role', requireSuperAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { role } = req.body;
      
      if (!['user', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  app.put('/api/admin/users/:userId/deactivate', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedUser = await storage.deactivateUser(userId);
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        isActive: updatedUser.isActive
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: 'Failed to deactivate user' });
    }
  });

  app.put('/api/admin/users/:userId/activate', requireAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedUser = await storage.activateUser(userId);
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        isActive: updatedUser.isActive
      });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({ message: 'Failed to activate user' });
    }
  });

  // Admin info route
  app.get('/api/admin/info', requireAdmin, async (req, res) => {
    try {
      const adminUser = req.adminUser;
      const totalUsers = await storage.getAllUsers(1000);
      const adminUsers = await storage.getUsersByRole('admin');
      const superAdminUsers = await storage.getUsersByRole('super_admin');
      
      res.json({
        currentAdmin: {
          id: adminUser.id,
          email: adminUser.email,
          displayName: adminUser.displayName,
          role: adminUser.role
        },
        stats: {
          totalUsers: totalUsers.length,
          adminUsers: adminUsers.length,
          superAdminUsers: superAdminUsers.length,
          activeUsers: totalUsers.filter(u => u.isActive).length
        },
        permissions: {
          canManageUsers: adminUser.role === 'admin' || adminUser.role === 'super_admin',
          canManageRoles: adminUser.role === 'super_admin',
          canManageCarousel: adminUser.role === 'admin' || adminUser.role === 'super_admin'
        }
      });
    } catch (error) {
      console.error('Error fetching admin info:', error);
      res.status(500).json({ message: 'Failed to fetch admin info' });
    }
  });

  // Document management endpoints (Marketing + System Admin)
  app.get("/api/admin/documents", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string;
      const documents = category 
        ? await storage.getDocumentsByCategory(category)
        : await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/admin/documents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/admin/documents", requireAdmin, async (req, res) => {
    try {
      const documentData = {
        ...req.body,
        createdBy: req.user?.firstName || req.user?.email || 'Admin'
      };
      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/admin/documents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/admin/documents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Legacy marketing documents endpoints for backward compatibility
  app.get("/api/admin/marketing-documents", requireAdmin, async (req, res) => {
    try {
      const documents = await storage.getMarketingDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching marketing documents:", error);
      res.status(500).json({ message: "Failed to fetch marketing documents" });
    }
  });

  app.post("/api/admin/marketing-documents", requireAdmin, async (req, res) => {
    try {
      const documentData = {
        ...req.body,
        category: 'marketing',
        createdBy: req.user?.firstName || req.user?.email || 'Admin'
      };
      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error creating marketing document:", error);
      res.status(500).json({ message: "Failed to create marketing document" });
    }
  });

  // Document download endpoint with format conversion
  app.get("/api/admin/documents/:id/download", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const requestedFormat = (req.query.format as string) || 'md';
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const cleanTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      switch (requestedFormat) {
        case 'pdf': {
          try {
            // Generate PDF from markdown content
            const htmlPdfNode = await import('html-pdf-node');
            const markedModule = await import('marked');
            
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>${document.title}</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
                  h1, h2, h3 { color: #0066cc; margin-top: 24px; margin-bottom: 16px; }
                  h1 { border-bottom: 2px solid #0066cc; padding-bottom: 10px; font-size: 24px; }
                  h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 20px; }
                  h3 { font-size: 16px; }
                  .header { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                  .meta { color: #666; font-size: 0.9em; }
                  pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; }
                  code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-size: 12px; }
                  blockquote { border-left: 4px solid #0066cc; margin: 16px 0; padding-left: 20px; color: #666; }
                  table { border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 12px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f5f5f5; font-weight: bold; }
                  ul, ol { margin: 16px 0; padding-left: 24px; }
                  li { margin: 4px 0; }
                  p { margin: 12px 0; }
                  .page-break { page-break-before: always; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>${document.title}</h1>
                  <div class="meta">
                    <p><strong>Type:</strong> ${document.type} | <strong>Created:</strong> ${new Date(document.createdAt).toLocaleDateString()} | <strong>By:</strong> ${document.createdBy}</p>
                    <p><strong>Description:</strong> ${document.description}</p>
                  </div>
                </div>
                ${markedModule.marked.parse(document.content)}
              </body>
              </html>
            `;
            
            const options = { 
              format: 'A4',
              printBackground: true,
              margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
              timeout: 30000,
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            };
            const file = { content: htmlContent };
            
            console.log(`Generating PDF for document: ${document.title}`);
            const pdfBuffer = await htmlPdfNode.generatePdf(file, options);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.pdf"`);
            res.send(pdfBuffer);
            console.log(`PDF generated successfully for: ${document.title}`);
          } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            res.status(500).json({ 
              message: 'Failed to generate PDF', 
              error: pdfError.message,
              details: 'PDF generation requires browser dependencies. Please try downloading as HTML or Markdown instead.'
            });
          }
          break;
        }
        
        case 'html': {
          // Generate formatted HTML
          const markedModule = await import('marked');
          const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${document.title}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
                h1, h2, h3 { color: #2563eb; }
                h1 { border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; }
                .document-header { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #2563eb; }
                .document-meta { color: #6b7280; font-size: 0.9em; margin-bottom: 10px; }
                .document-type { display: inline-block; background: #2563eb; color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.8em; font-weight: 500; }
                pre { background: #f1f5f9; padding: 20px; border-radius: 6px; overflow-x: auto; border-left: 4px solid #2563eb; }
                code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
                blockquote { border-left: 4px solid #2563eb; margin: 20px 0; padding-left: 20px; color: #4b5563; background: #f8fafc; padding: 15px 20px; border-radius: 0 6px 6px 0; }
                table { border-collapse: collapse; width: 100%; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
                th { background: #f8fafc; font-weight: 600; color: #374151; }
                a { color: #2563eb; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em; text-align: center; }
              </style>
            </head>
            <body>
              <div class="document-header">
                <h1 style="margin: 0; border: none; color: #1f2937;">${document.title}</h1>
                <div class="document-meta">
                  <span class="document-type">${document.type}</span>
                  <span style="margin-left: 15px;">Created: ${new Date(document.createdAt).toLocaleDateString()}</span>
                  <span style="margin-left: 15px;">By: ${document.createdBy}</span>
                </div>
                <p style="margin: 15px 0 0 0; color: #4b5563;"><strong>Description:</strong> ${document.description}</p>
              </div>
              
              <div class="document-content">
                ${markedModule.marked.parse(document.content)}
              </div>
              
              <div class="footer">
                <p>Generated from VicSurf Marketing Documents • ${new Date().toLocaleDateString()}</p>
              </div>
            </body>
            </html>
          `;
          
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.html"`);
          res.send(htmlContent);
          break;
        }
        
        case 'txt': {
          // Generate plain text format
          const textContent = `${document.title.toUpperCase()}
${'='.repeat(document.title.length)}

Type: ${document.type}
Created: ${new Date(document.createdAt).toLocaleDateString()}
Created by: ${document.createdBy}
Description: ${document.description}

${'='.repeat(50)}

${document.content}

${'='.repeat(50)}
Generated from VicSurf Marketing Documents
${new Date().toLocaleDateString()}`;
          
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.txt"`);
          res.send(textContent);
          break;
        }
        
        case 'md':
        default: {
          // Generate enhanced markdown with metadata
          const markdownContent = `# ${document.title}

**Type:** ${document.type} | **Created:** ${new Date(document.createdAt).toLocaleDateString()} | **By:** ${document.createdBy}

**Description:** ${document.description}

---

${document.content}

---

*Generated from VicSurf Marketing Documents on ${new Date().toLocaleDateString()}*`;
          
          res.setHeader('Content-Type', 'text/markdown');
          res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.md"`);
          res.send(markdownContent);
          break;
        }
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  app.delete("/api/admin/marketing-documents/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMarketingDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting marketing document:", error);
      res.status(500).json({ message: "Failed to delete marketing document" });
    }
  });

  // Feedback Routes
  
  // Submit feedback (public route - allows anonymous feedback)
  app.post('/api/feedback', async (req, res) => {
    try {
      const feedbackData = req.body;
      
      // Add user ID if authenticated
      if (req.isAuthenticated?.()) {
        feedbackData.userId = req.user.id;
      }
      
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: 'Failed to submit feedback' });
    }
  });

  // Get all feedback (filtered by visibility and user permissions)
  app.get('/api/feedback', async (req, res) => {
    try {
      const { 
        feedbackType, 
        status, 
        spotId, 
        isPublic = 'true',
        limit = '20',
        offset = '0' 
      } = req.query;

      const filters: any = {
        feedbackType: feedbackType as string,
        status: status as string,
        spotId: spotId ? parseInt(spotId as string) : undefined,
        isPublic: isPublic === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      // If user is authenticated, they can see their own private feedback
      if (req.isAuthenticated?.()) {
        // Admin can see all feedback
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
          delete filters.isPublic;
        }
      }

      const feedback = await storage.getAllFeedback(filters);
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Failed to fetch feedback' });
    }
  });

  // Get feedback for a specific spot
  app.get('/api/surf-spots/:spotId/feedback', async (req, res) => {
    try {
      const spotId = parseInt(req.params.spotId);
      const { limit = '10', offset = '0' } = req.query;

      const feedback = await storage.getAllFeedback({
        spotId,
        isPublic: true,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json(feedback);
    } catch (error) {
      console.error('Error fetching spot feedback:', error);
      res.status(500).json({ message: 'Failed to fetch spot feedback' });
    }
  });

  // Vote on feedback (requires authentication)
  app.post('/api/feedback/:id/vote', async (req, res) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const feedbackId = parseInt(req.params.id);
      const { voteType } = req.body;
      const userId = req.user.id;

      if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ message: 'Invalid vote type' });
      }

      await storage.voteFeedback(feedbackId, userId, voteType);
      res.json({ success: true });
    } catch (error) {
      console.error('Error voting on feedback:', error);
      res.status(500).json({ message: 'Failed to vote on feedback' });
    }
  });

  // Remove vote (requires authentication)
  app.delete('/api/feedback/:id/vote', async (req, res) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const feedbackId = parseInt(req.params.id);
      const userId = req.user.id;

      await storage.removeVoteFeedback(feedbackId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing vote:', error);
      res.status(500).json({ message: 'Failed to remove vote' });
    }
  });

  // Admin: Update feedback status
  app.put('/api/admin/feedback/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedFeedback = await storage.updateFeedback(id, updates);
      res.json(updatedFeedback);
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ message: 'Failed to update feedback' });
    }
  });

  // Admin: Delete feedback
  app.delete('/api/admin/feedback/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeedback(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ message: 'Failed to delete feedback' });
    }
  });

  // SEO and Sitemap Routes
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { sitemapGenerator } = await import('./sitemap-generator');
      const sitemap = sitemapGenerator.generateSitemapIndex();
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      });
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap index:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/sitemap-main.xml", async (req, res) => {
    try {
      const { sitemapGenerator } = await import('./sitemap-generator');
      const sitemap = await sitemapGenerator.generateMainSitemap();
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      });
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating main sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/sitemap-spots.xml", async (req, res) => {
    try {
      const { sitemapGenerator } = await import('./sitemap-generator');
      const sitemap = await sitemapGenerator.generateSpotsSitemap();
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      });
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating spots sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/sitemap-forecasts.xml", async (req, res) => {
    try {
      const { sitemapGenerator } = await import('./sitemap-generator');
      const sitemap = await sitemapGenerator.generateForecastSitemap();
      
      res.set({
        'Content-Type': 'application/xml', 
        'Cache-Control': 'public, max-age=900' // Cache for 15 minutes (forecast data changes frequently)
      });
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating forecast sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const { sitemapGenerator } = await import('./sitemap-generator');
      const robotsTxt = sitemapGenerator.generateRobotsTxt();
      
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      });
      res.send(robotsTxt);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
