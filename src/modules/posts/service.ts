import { desc, eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Posts } from "@shared/db/tables/posts";
import { Users } from "@shared/db/tables/users";
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

export const findLatestsPostsByDomain = async (domain: string, page = 1) => {
	const result = await db
		.select({
			id: Posts.id,
			content: Posts.content,
			user: {
				id: Users.id,
				name: Users.name,
				email: Users.email,
			},
			createdAt: Posts.createdAt,
			updatedAt: Posts.updatedAt,
			deletedAt: Posts.deletedAt,
		})
		.from(Posts)
		.innerJoin(Users, eq(Posts.userId, Users.id))
		.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
		.where(eq(Organizations.domain, domain))
		.orderBy(desc(Posts.createdAt))
		.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
		.limit(10);

	return result;
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