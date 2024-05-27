import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { userSchema } from "./user";

export const postSchema = pgTable("post", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	userId: integer("user_id")
		.references(() => userSchema.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at").notNull().defaultNow(),
});

export type Post = typeof postSchema.$inferSelect;
export type PostCreate = typeof postSchema.$inferInsert;
