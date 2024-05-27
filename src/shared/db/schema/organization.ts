import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const organization = pgTable("organization", {
	id: serial("id").primaryKey(),
	domain: text("domain").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at").notNull().defaultNow(),
});

export type Organization = typeof organization.$inferSelect;
export type OrganizationCreate = typeof organization.$inferInsert;
