import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const surfSpots = pgTable("surf_spots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  region: text("region").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced, expert
  externalId: text("external_id"), // For external API integration
  apiSource: text("api_source").default("open-meteo"), // Track data source
});

export const surfConditions = pgTable("surf_conditions", {
  id: serial("id").primaryKey(),
  spotId: integer("spot_id").notNull().references(() => surfSpots.id),
  waveHeight: real("wave_height").notNull(), // in meters
  waveDirection: text("wave_direction"), // N, NE, E, SE, S, SW, W, NW
  wavePeriod: real("wave_period"), // in seconds
  windSpeed: real("wind_speed").notNull(), // km/h
  windDirection: text("wind_direction").notNull(),
  airTemperature: real("air_temperature").notNull(), // celsius
  waterTemperature: real("water_temperature").notNull(), // celsius
  rating: text("rating").notNull(), // poor, fair, good, very-good, excellent
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tideTimes = pgTable("tide_times", {
  id: serial("id").primaryKey(),
  spotId: integer("spot_id").notNull().references(() => surfSpots.id),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM
  height: real("height").notNull(), // in meters
  type: text("type").notNull(), // high, low
});

export const forecasts = pgTable("forecasts", {
  id: serial("id").primaryKey(),
  spotId: integer("spot_id").notNull().references(() => surfSpots.id),
  date: text("date").notNull(), // YYYY-MM-DD
  waveHeight: real("wave_height").notNull(),
  waveDirection: text("wave_direction"),
  windSpeed: real("wind_speed").notNull(),
  windDirection: text("wind_direction").notNull(),
  rating: text("rating").notNull(),
  airTemperature: real("air_temperature").notNull(),
  waterTemperature: real("water_temperature").notNull(),
});

export const insertSurfSpotSchema = createInsertSchema(surfSpots).omit({
  id: true,
});

export const insertSurfConditionSchema = createInsertSchema(surfConditions).omit({
  id: true,
  timestamp: true,
});

export const insertTideTimeSchema = createInsertSchema(tideTimes).omit({
  id: true,
});

export const insertForecastSchema = createInsertSchema(forecasts).omit({
  id: true,
});

export type InsertSurfSpot = z.infer<typeof insertSurfSpotSchema>;
export type InsertSurfCondition = z.infer<typeof insertSurfConditionSchema>;
export type InsertTideTime = z.infer<typeof insertTideTimeSchema>;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

export type SurfSpot = typeof surfSpots.$inferSelect;
export type SurfCondition = typeof surfConditions.$inferSelect;
export type TideTime = typeof tideTimes.$inferSelect;
export type Forecast = typeof forecasts.$inferSelect;
