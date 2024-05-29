import { eq } from "drizzle-orm";

import db from "@shared/db";
import { Posts } from "@shared/db/tables/posts";
import { CouldNotCreateError, CouldNotUpdateError } from "@shared/types/errors";
import type { CreatePostPayload } from "./types/request";

export const findPostById = async (id: number) => {
	const result = await db
		.select({
			id: Posts.id,
			content: Posts.content,
			userId: Posts.userId,
		})
		.from(Posts)
		.where(eq(Posts.id, id));

	if (!result.length) return null;

	return result[0];
};

export const createPost = async (
	post: CreatePostPayload,
	fallbackUserId: number,
) => {
	const result = await db
		.insert(Posts)
		.values({
			content: post.content,
			userId: post.userId || fallbackUserId,
		})
		.returning();

	if (!result.length) {
		throw new CouldNotCreateError(
			`Failed to create post with content: ${post.content}`,
		);
	}

	return result[0];
};

export const updatePost = async (id: number, post: CreatePostPayload) => {
	const result = await db
		.update(Posts)
		.set({
			content: post.content,
		})
		.where(eq(Posts.id, id))
		.returning();

	if (!result.length) {
		throw new CouldNotUpdateError(`Failed to update post with id: ${id}`);
	}

	return result[0];
};
