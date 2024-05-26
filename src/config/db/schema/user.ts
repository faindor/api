import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { organization } from "./organization";

export const user = pgTable("user", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	password: text("password").notNull(),
	organizationId: integer("organization_id")
		.references(() => organization.id)
		.notNull(),
	role: text("role").$type<"admin" | "user">().notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at").notNull().defaultNow(),
});
