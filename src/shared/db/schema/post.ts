import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./user";

export const post = pgTable("post", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	userId: integer("user_id")
		.references(() => user.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at").notNull().defaultNow(),
});

export type Post = typeof post.$inferSelect;
export type PostCreate = typeof post.$inferInsert;
