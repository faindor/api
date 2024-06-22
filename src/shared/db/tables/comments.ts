import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { Posts } from "./posts";
import { Users } from "./users";

export const Comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	postId: integer("post_id")
		.references(() => Posts.id)
		.notNull(),
	userId: integer("user_id")
		.references(() => Users.id)
		.notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at"),
	deletedAt: timestamp("deleted_at"),
});
