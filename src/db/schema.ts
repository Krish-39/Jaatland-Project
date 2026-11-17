import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { HomepageConfig } from "@/lib/types";

// Prices are stored as integer cents. Floating-point euros are only produced
// at the edge, when rows are mapped to the `Product` type the UI uses.
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  category: text("category").notNull(),
  color: text("color").notNull(),
  sizes: text("sizes").array().notNull(),
  images: text("images").array().notNull(),
  badge: text("badge"),
  similarIds: text("similar_ids").array().notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Single-row table (id is always 1) holding the editable homepage copy.
export const homepageConfig = pgTable("homepage_config", {
  id: integer("id").primaryKey(),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroImage: text("hero_image").notNull(),
  newsletterTitle: text("newsletter_title").notNull(),
  newsletterSubtitle: text("newsletter_subtitle").notNull(),
  homepageProducts: jsonb("homepage_products")
    .$type<HomepageConfig["homepageProducts"]>()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Always stored trimmed and lower-cased. */
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<"customer" | "admin">().notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// The id is the SHA-256 of the session token. The token itself only ever
// lives in the visitor's cookie, so a leaked table cannot be replayed.
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type UserRow = typeof users.$inferSelect;
