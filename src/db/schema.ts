import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";

export const langClubTable = pgTable("lang_club", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tutor: varchar({ length: 255 }).notNull(),
  date: timestamp().notNull(),
  theme: varchar({ length: 255 }).notNull(),
  description: text(),
  level: text(),
  location: text().notNull(),
  peopleBooked: integer().notNull().default(0),
  maxBooked: integer().notNull().default(0),
  duration: integer(),
  price: decimal({ precision: 10, scale: 2 }).notNull().default("0"),
  stripeProductId: varchar({ length: 255 }),
  stripePriceId: varchar({ length: 255 }),
});

export const langClubBookingsTable = pgTable("lang_club_bookings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer()
    .notNull()
    .references(() => langClubTable.id),
  userId: varchar({ length: 255 }).notNull(),
  stripeSessionId: varchar({ length: 255 }),
  stripePaymentIntentId: varchar({ length: 255 }),
  status: varchar({ length: 50 }).notNull().default("pending"), // pending, paid, cancelled, refunded
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
