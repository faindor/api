import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { Organizations } from "./organizations";

export const Users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	password: text("password").notNull(),
	organizationId: integer("organization_id")
		.references(() => Organizations.id)
		.notNull(),
	role: text("role")
		.$type<"APP_ADMIN" | "ORG_ADMIN" | "USER">()
		.notNull()
		.default("USER"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"),
});

export type User = typeof Users.$inferSelect;
export type UserInsert = typeof Users.$inferInsert;
