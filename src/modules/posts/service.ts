import { desc, eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Posts } from "@shared/db/tables/posts";
import { Users } from "@shared/db/tables/users";
import { CouldNotCreateError, CouldNotUpdateError } from "@shared/types/errors";
import type { CreatePostParams, UpdatePostParams } from "./types/request";

export const getPostById = async (id: number) => {
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

export const getLatestsPostsByUserId = async (userId: number, page = 1) => {
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
		.where(eq(Users.id, userId))
		.orderBy(desc(Posts.createdAt))
		.offset((page - 1) * 10) // Get 10 posts per page, skip the other ones
		.limit(10);

	return result;
};

export const getLatestsPostsByDomain = async (domain: string, page = 1) => {
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

export const createPost = async (post: CreatePostParams) => {
	const result = await db
		.insert(Posts)
		.values({
			content: post.content,
			userId: post.userId,
		})
		.returning();

	if (!result.length) {
		throw new CouldNotCreateError(
			`Failed to create post with content: ${post.content} for user: ${post.userId}`,
		);
	}

	return result[0];
};

export const updatePost = async (post: UpdatePostParams) => {
	const result = await db
		.update(Posts)
		.set({
			content: post.content,
		})
		.where(eq(Posts.id, post.id))
		.returning();

	if (!result.length) {
		throw new CouldNotUpdateError(`Failed to update post with id: ${post.id}`);
	}

	return result[0];
};
