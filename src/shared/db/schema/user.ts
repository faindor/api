import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { organizationSchema } from "./organization";

export const userSchema = pgTable("user", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	password: text("password").notNull(),
	organizationId: integer("organization_id")
		.references(() => organizationSchema.id)
		.notNull(),
	role: text("role").$type<"admin" | "user">().notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type User = typeof userSchema.$inferSelect;
export type UserCreate = typeof userSchema.$inferInsert;
