import { pgTable, text, serial, integer, boolean, real, timestamp, uuid, varchar, jsonb, index, unique } from "drizzle-orm/pg-core";
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
  
  // Enhanced surf metrics for professional forecasting
  swellHeight: real("swell_height"), // Unbroken swell height in open ocean
  breakingHeight: real("breaking_height"), // Expected breaking wave height at shore
  heightConfidence: real("height_confidence"), // Forecast confidence percentage
  swellType: text("swell_type"), // 'ground_swell', 'wind_swell', 'mixed'
  swellQuality: text("swell_quality"), // 'excellent', 'good', 'fair', 'poor'
  waveEnergy: real("wave_energy"), // Calculated: height² × period
  
  // Multi-swell analysis
  primarySwellHeight: real("primary_swell_height"),
  primarySwellPeriod: real("primary_swell_period"),
  primarySwellDirection: text("primary_swell_direction"),
  primarySwellDominance: real("primary_swell_dominance"), // Percentage contribution
  
  secondarySwellHeight: real("secondary_swell_height"),
  secondarySwellPeriod: real("secondary_swell_period"),
  secondarySwellDirection: text("secondary_swell_direction"),
  secondarySwellDominance: real("secondary_swell_dominance"),
  
  swellInteraction: text("swell_interaction"), // 'constructive', 'destructive', 'neutral'
  
  // Professional scoring system (1.0-10.0)
  surfScore: real("surf_score"), // Overall quality score
  waveQuality: real("wave_quality"), // Wave component score
  windQuality: real("wind_quality"), // Wind component score
  tideOptimal: real("tide_optimal"), // Tide optimization score
  consistencyScore: real("consistency_score"), // Wave consistency rating
  
  // Environmental context
  uvIndex: real("uv_index"), // UV index for sun protection
  visibility: real("visibility"), // Visibility in kilometers
  cloudCover: integer("cloud_cover"), // Percentage cloud coverage
  precipitationProbability: real("precipitation_probability"), // Rain chance percentage
  precipitationAmount: real("precipitation_amount"), // Expected rainfall in mm
  windGust: real("wind_gust"), // Maximum wind gust speed
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
  
  // Enhanced forecast metrics matching surf_conditions
  wavePeriod: real("wave_period"), // in seconds
  swellHeight: real("swell_height"),
  swellType: text("swell_type"),
  swellQuality: text("swell_quality"),
  waveEnergy: real("wave_energy"),
  surfScore: real("surf_score"),
  uvIndex: real("uv_index"),
  visibility: real("visibility"),
  precipitationProbability: real("precipitation_probability"),
  windGust: real("wind_gust"),
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

// Documents table (expanded from marketing documents to include system admin docs)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: text("category").notNull(), // marketing, system_admin
  type: text("type").notNull(), // strategy, campaign, analysis, report, proposal, prd, solution_design, technical_spec
  format: text("format").notNull().default("md"), // md, pdf
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull(),
});

// Legacy table name for backward compatibility
export const marketingDocuments = documents;

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Legacy schema for backward compatibility
export const insertMarketingDocumentSchema = insertDocumentSchema;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof insertDocumentSchema._type;

// Legacy types for backward compatibility
export type MarketingDocument = Document;
export type InsertMarketingDocument = InsertDocument;

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
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, wave_rider, surf_master
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

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // Optional for anonymous feedback
  email: varchar("email"), // For anonymous users to follow up
  name: varchar("name"), // Optional name for feedback
  feedbackType: varchar("feedback_type").notNull(), // feature_request, beach_suggestion, bug_report, general
  category: varchar("category"), // ui_ux, forecasting, locations, performance, other
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("submitted"), // submitted, reviewing, in_progress, completed, rejected
  spotId: integer("spot_id").references(() => surfSpots.id, { onDelete: "set null" }), // For beach-specific feedback
  upvotes: integer("upvotes").default(0),
  adminNotes: text("admin_notes"),
  adminResponse: text("admin_response"),
  isPublic: boolean("is_public").default(true), // Whether feedback is visible to other users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedbackVotes = pgTable("feedback_votes", {
  id: serial("id").primaryKey(),
  feedbackId: integer("feedback_id").references(() => userFeedback.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  voteType: varchar("vote_type").notNull(), // upvote, downvote
  createdAt: timestamp("created_at").defaultNow(),
});

// Panel management for home page layout
export const homePanels = pgTable("home_panels", {
  id: serial("id").primaryKey(),
  panelKey: varchar("panel_key").notNull().unique(), // e.g., 'current-conditions', 'premium-features', 'beach-cameras'
  title: varchar("title").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  componentName: varchar("component_name").notNull(), // React component name
  panelType: varchar("panel_type").default("standard"), // 'standard', 'premium', 'conditional'
  requiredRole: varchar("required_role"), // null for public, 'user', 'admin', etc.
  settings: jsonb("settings"), // JSON configuration for panel behavior
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
  feedbackSubmissions: many(userFeedback),
  feedbackVotes: many(feedbackVotes),
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
  feedback: many(userFeedback),
}));

export const userFeedbackRelations = relations(userFeedback, ({ one, many }) => ({
  user: one(users, {
    fields: [userFeedback.userId],
    references: [users.id],
  }),
  spot: one(surfSpots, {
    fields: [userFeedback.spotId],
    references: [surfSpots.id],
  }),
  votes: many(feedbackVotes),
}));

export const feedbackVotesRelations = relations(feedbackVotes, ({ one }) => ({
  feedback: one(userFeedback, {
    fields: [feedbackVotes.feedbackId],
    references: [userFeedback.id],
  }),
  user: one(users, {
    fields: [feedbackVotes.userId],
    references: [users.id],
  }),
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

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  upvotes: true,
  adminNotes: true,
  adminResponse: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackVoteSchema = createInsertSchema(feedbackVotes).omit({
  id: true,
  createdAt: true,
});

export const insertHomePanelSchema = createInsertSchema(homePanels).omit({
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
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type InsertFeedbackVote = z.infer<typeof insertFeedbackVoteSchema>;
export type InsertHomePanel = z.infer<typeof insertHomePanelSchema>;

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
export type UserFeedback = typeof userFeedback.$inferSelect;
export type FeedbackVote = typeof feedbackVotes.$inferSelect;
export type HomePanel = typeof homePanels.$inferSelect;

export type SurfSpot = typeof surfSpots.$inferSelect;
export type SurfCondition = typeof surfConditions.$inferSelect;
export type TideTime = typeof tideTimes.$inferSelect;
export type Forecast = typeof forecasts.$inferSelect;
