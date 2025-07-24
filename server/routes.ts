import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const tides = await storage.getTideTimesForDate(spotId, date);
      res.json(tides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tide times" });
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

  const httpServer = createServer(app);
  return httpServer;
}
