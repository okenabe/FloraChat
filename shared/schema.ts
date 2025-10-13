import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  location: text("location"),
  yardSize: text("yard_size"),
  experienceLevel: text("experience_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

export const gardenBeds = pgTable("garden_beds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bedName: text("bed_name").notNull(),
  bedSizeSqft: real("bed_size_sqft"),
  sunExposure: text("sun_exposure"),
  soilType: text("soil_type"),
  soilMoisture: text("soil_moisture"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const plants = pgTable("plants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bedId: varchar("bed_id").notNull().references(() => gardenBeds.id),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name"),
  plantType: text("plant_type"),
  datePlanted: text("date_planted"),
  imageUrl: text("image_url"),
  quantity: integer("quantity").default(1),
  spacingInches: real("spacing_inches"),
  currentHeight: text("current_height"),
  healthStatus: text("health_status"),
  identificationConfidence: integer("identification_confidence"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  messages: text("messages").notNull(),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  gardenBeds: many(gardenBeds),
  conversations: many(conversations),
}));

export const gardenBedsRelations = relations(gardenBeds, ({ one, many }) => ({
  user: one(users, {
    fields: [gardenBeds.userId],
    references: [users.id],
  }),
  plants: many(plants),
}));

export const plantsRelations = relations(plants, ({ one }) => ({
  gardenBed: one(gardenBeds, {
    fields: [plants.bedId],
    references: [gardenBeds.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertGardenBedSchema = createInsertSchema(gardenBeds).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGardenBed = z.infer<typeof insertGardenBedSchema>;
export type GardenBed = typeof gardenBeds.$inferSelect;

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
