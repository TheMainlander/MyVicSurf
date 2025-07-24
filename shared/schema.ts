import { pgTable, text, serial, integer, boolean, real, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

// User management tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  spotId: integer("spot_id").references(() => surfSpots.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  spotId: integer("spot_id").references(() => surfSpots.id),
  sessionDate: timestamp("session_date").notNull(),
  waveHeight: real("wave_height"),
  rating: integer("rating"), // 1-5 user rating
  notes: text("notes"),
  duration: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  preferredUnits: text("preferred_units").default("metric"), // metric, imperial
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  favoriteRegions: text("favorite_regions").array().default(["Surf Coast"]),
  skillLevel: text("skill_level").default("intermediate"), // beginner, intermediate, advanced, expert
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  favorites: many(userFavorites),
  sessions: many(userSessions),
  preferences: one(userPreferences),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  spot: one(surfSpots, {
    fields: [userFavorites.spotId],
    references: [surfSpots.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
  spot: one(surfSpots, {
    fields: [userSessions.spotId],
    references: [surfSpots.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const surfSpotsRelations = relations(surfSpots, ({ many }) => ({
  favorites: many(userFavorites),
  sessions: many(userSessions),
  conditions: many(surfConditions),
  tides: many(tideTimes),
  forecasts: many(forecasts),
}));

// User schema exports
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  addedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type User = typeof users.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type SurfSpot = typeof surfSpots.$inferSelect;
export type SurfCondition = typeof surfConditions.$inferSelect;
export type TideTime = typeof tideTimes.$inferSelect;
export type Forecast = typeof forecasts.$inferSelect;
