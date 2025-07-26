import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pushNotificationService } from "./push-notifications";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed data on startup with error handling to prevent server crashes
  try {
    console.log("Starting database seeding process...");
    
    // Seed subscription plans on startup
    const { seedSubscriptionPlans } = await import("./seed-subscription-plans");
    await seedSubscriptionPlans();
    
    // Seed carousel images on startup
    const { seedCarouselImages } = await import("./carousel-seed");
    await seedCarouselImages();
    
    // Seed admin user on startup
    const { seedAdminUser } = await import("./admin-seed");
    await seedAdminUser();
    
    // Seed marketing documents on startup
    const { seedMarketingDocuments } = await import("./marketing-documents-seed");
    await seedMarketingDocuments();
    
    // Seed system admin documents on startup
    const { seedSystemDocuments } = await import("./system-documents-seed");
    await seedSystemDocuments();
    
    // Seed container order on startup
    const { seedContainerOrder } = await import("./container-order-seed");
    await seedContainerOrder();
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error during database seeding:", error);
    console.warn("Continuing to start server despite seeding errors...");
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details for debugging
    console.error("Server error:", {
      status,
      message,
      stack: err.stack,
      url: _req.url,
      method: _req.method
    });

    res.status(status).json({ message });
    
    // Log in all environments, don't throw to prevent crashes
    console.error("Request failed with status:", status);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`VicSurf server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`Health check available at: http://0.0.0.0:${port}/`);
    
    // Start push notification monitoring
    if (process.env.DATABASE_URL) {
      try {
        pushNotificationService.startOptimalConditionsChecker();
        log("Push notification service started");
      } catch (error) {
        console.error("Failed to start push notification service:", error);
      }
    }
  });

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

})().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
