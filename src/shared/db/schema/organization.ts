import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const organizationSchema = pgTable("organization", {
	id: serial("id").primaryKey(),
	domain: text("domain").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type Organization = typeof organizationSchema.$inferSelect;
export type OrganizationCreate = typeof organizationSchema.$inferInsert;
