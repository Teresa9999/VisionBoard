import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const visionSessions = pgTable("vision_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  emotion: text("emotion").notNull(),
  likedCards: jsonb("liked_cards").notNull().default([]),
  skippedCards: jsonb("skipped_cards").notNull().default([]),
  summary: text("summary"),
  userSupplement: text("user_supplement"),
  goals: jsonb("goals").notNull().default([]),
  timeframe: text("timeframe"),
  status: text("status").notNull().default("in_progress"), // in_progress | completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type VisionSession = InferSelectModel<typeof visionSessions>;
