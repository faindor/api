import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const Organizations = pgTable("organizations", {
	id: serial("id").primaryKey(),
	domain: text("domain").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type Organization = typeof Organizations.$inferSelect;
export type OrganizationInsert = typeof Organizations.$inferInsert;
