import {
  users,
  gardenBeds,
  plants,
  conversations,
  type User,
  type InsertUser,
  type GardenBed,
  type InsertGardenBed,
  type Plant,
  type InsertPlant,
  type Conversation,
  type InsertConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastActive(id: string): Promise<void>;

  // Garden bed operations
  getGardenBed(id: string): Promise<GardenBed | undefined>;
  getGardenBedsByUser(userId: string): Promise<GardenBed[]>;
  createGardenBed(bed: InsertGardenBed): Promise<GardenBed>;
  updateGardenBed(id: string, bed: Partial<InsertGardenBed>): Promise<GardenBed>;
  deleteGardenBed(id: string): Promise<void>;

  // Plant operations
  getPlant(id: string): Promise<Plant | undefined>;
  getPlantsByBed(bedId: string): Promise<Plant[]>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: string, plant: Partial<InsertPlant>): Promise<Plant>;
  deletePlant(id: string): Promise<void>;

  // Conversation operations
  getConversation(userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastActive(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, id));
  }

  // Garden bed operations
  async getGardenBed(id: string): Promise<GardenBed | undefined> {
    const [bed] = await db.select().from(gardenBeds).where(eq(gardenBeds.id, id));
    return bed || undefined;
  }

  async getGardenBedsByUser(userId: string): Promise<GardenBed[]> {
    return await db
      .select()
      .from(gardenBeds)
      .where(eq(gardenBeds.userId, userId))
      .orderBy(desc(gardenBeds.lastUpdated));
  }

  async createGardenBed(bed: InsertGardenBed): Promise<GardenBed> {
    const [gardenBed] = await db.insert(gardenBeds).values(bed).returning();
    return gardenBed;
  }

  async updateGardenBed(id: string, bed: Partial<InsertGardenBed>): Promise<GardenBed> {
    const [updated] = await db
      .update(gardenBeds)
      .set({ ...bed, lastUpdated: new Date() })
      .where(eq(gardenBeds.id, id))
      .returning();
    return updated;
  }

  async deleteGardenBed(id: string): Promise<void> {
    await db.delete(gardenBeds).where(eq(gardenBeds.id, id));
  }

  // Plant operations
  async getPlant(id: string): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant || undefined;
  }

  async getPlantsByBed(bedId: string): Promise<Plant[]> {
    return await db
      .select()
      .from(plants)
      .where(eq(plants.bedId, bedId))
      .orderBy(desc(plants.lastUpdated));
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values(plant).returning();
    return newPlant;
  }

  async updatePlant(id: string, plant: Partial<InsertPlant>): Promise<Plant> {
    const [updated] = await db
      .update(plants)
      .set({ ...plant, lastUpdated: new Date() })
      .where(eq(plants.id, id))
      .returning();
    return updated;
  }

  async deletePlant(id: string): Promise<void> {
    await db.delete(plants).where(eq(plants.id, id));
  }

  // Conversation operations
  async getConversation(userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastUpdated))
      .limit(1);
    return conversation || undefined;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async updateConversation(
    id: string,
    conversation: Partial<InsertConversation>
  ): Promise<Conversation> {
    const [updated] = await db
      .update(conversations)
      .set({ ...conversation, lastUpdated: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
