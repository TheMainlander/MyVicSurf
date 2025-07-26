import { pgTable, text, serial, integer, boolean, real, timestamp, uuid, varchar, jsonb, index } from "drizzle-orm/pg-core";
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
  beachType: text("beach_type").notNull().default("both"), // surf, swimming, both
  beachCategory: text("beach_category").default("surf_beach"), // surf_beach, family_beach, protected_bay, ocean_beach
  facilities: text("facilities").array().default([]), // parking, toilets, cafe, lifeguards, etc
  accessInfo: text("access_info"), // How to access the beach
  bestConditions: text("best_conditions"), // Optimal wind/swell conditions
  hazards: text("hazards").array().default([]), // rips, rocks, sharks, etc
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

// Marketing Documents table
export const marketingDocuments = pgTable("marketing_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  type: text("type").notNull(), // strategy, campaign, analysis, report, proposal
  format: text("format").notNull().default("md"), // md, pdf
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull(),
});

export const insertMarketingDocumentSchema = createInsertSchema(marketingDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MarketingDocument = typeof marketingDocuments.$inferSelect;
export type InsertMarketingDocument = typeof insertMarketingDocumentSchema._type;

export type InsertSurfSpot = z.infer<typeof insertSurfSpotSchema>;
export type InsertSurfCondition = z.infer<typeof insertSurfConditionSchema>;
export type InsertTideTime = z.infer<typeof insertTideTimeSchema>;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

// Session storage table for SSO
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User management tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  profileImageUrl: varchar("profile_image_url"),
  location: varchar("location"),
  bio: text("bio"),
  surfingExperience: varchar("surfing_experience"), // beginner, intermediate, advanced, expert
  phoneNumber: varchar("phone_number"),
  instagramHandle: varchar("instagram_handle"),
  twitterHandle: varchar("twitter_handle"),
  facebookHandle: varchar("facebook_handle"),
  role: varchar("role").default("user"), // user, admin, super_admin
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"), // free, active, cancelled, past_due
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, premium, pro
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  spotId: integer("spot_id").references(() => surfSpots.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  preferredUnits: text("preferred_units").default("metric"), // metric, imperial
  defaultLocation: text("default_location"), // user's preferred default surf spot
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  optimalConditionAlerts: boolean("optimal_condition_alerts").default(true),
  waveHeightMin: real("wave_height_min").default(1.0), // minimum wave height for alerts
  waveHeightMax: real("wave_height_max").default(4.0), // maximum wave height for alerts
  windSpeedMax: real("wind_speed_max").default(20), // max wind speed for optimal conditions
  favoriteRegions: text("favorite_regions").array().default(["Surf Coast"]),
  skillLevel: text("skill_level").default("intermediate"), // beginner, intermediate, advanced, expert
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationLog = pgTable("notification_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  spotId: integer("spot_id").references(() => surfSpots.id),
  notificationType: text("notification_type").notNull(), // optimal_conditions, daily_forecast
  title: text("title").notNull(),
  message: text("message").notNull(),
  sent: boolean("sent").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  stripeSessionId: varchar("stripe_session_id").unique(),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency").default("aud"),
  status: varchar("status").notNull(), // pending, succeeded, failed, cancelled
  paymentType: varchar("payment_type").notNull(), // subscription, one_time
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents
  currency: varchar("currency").default("aud"),
  interval: varchar("interval").notNull(), // month, year
  stripePriceId: varchar("stripe_price_id"),
  features: text("features").array().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carouselImages = pgTable("carousel_images", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  location: varchar("location"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  favorites: many(userFavorites),
  sessions: many(userSessions),
  preferences: one(userPreferences),
  pushSubscriptions: many(pushSubscriptions),
  notifications: many(notificationLog),
  payments: many(payments),
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

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export const notificationLogRelations = relations(notificationLog, ({ one }) => ({
  user: one(users, {
    fields: [notificationLog.userId],
    references: [users.id],
  }),
  spot: one(surfSpots, {
    fields: [notificationLog.spotId],
    references: [surfSpots.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  // Future: can add relation to subscriptions if needed
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

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationLogSchema = createInsertSchema(notificationLog).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCarouselImageSchema = createInsertSchema(carouselImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type InsertCarouselImage = z.infer<typeof insertCarouselImageSchema>;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NotificationLog = typeof notificationLog.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type CarouselImage = typeof carouselImages.$inferSelect;

export type SurfSpot = typeof surfSpots.$inferSelect;
export type SurfCondition = typeof surfConditions.$inferSelect;
export type TideTime = typeof tideTimes.$inferSelect;
export type Forecast = typeof forecasts.$inferSelect;
