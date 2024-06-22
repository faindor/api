import { and, count, desc, eq } from "drizzle-orm";

import db from "@shared/db";
import { Organizations } from "@shared/db/tables/organizations";
import { Posts } from "@shared/db/tables/posts";
import { Reactions } from "@shared/db/tables/reactions";
import { Users } from "@shared/db/tables/users";
import {
	CouldNotCreateError,
	CouldNotDeleteError,
	CouldNotUpdateError,
} from "@shared/types/errors";
import type {
	CreatePostParams,
	ReactPostParams,
	UpdatePostParams,
} from "./types/request";

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
			reactionsCount: count(Reactions.id),
			createdAt: Posts.createdAt,
			updatedAt: Posts.updatedAt,
			deletedAt: Posts.deletedAt,
		})
		.from(Posts)
		.innerJoin(Users, eq(Posts.userId, Users.id))
		.leftJoin(Reactions, eq(Posts.id, Reactions.postId))
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
			reactionsCount: count(Reactions.id),
			createdAt: Posts.createdAt,
			updatedAt: Posts.updatedAt,
			deletedAt: Posts.deletedAt,
		})
		.from(Posts)
		.innerJoin(Users, eq(Posts.userId, Users.id))
		.innerJoin(Organizations, eq(Users.organizationId, Organizations.id))
		.leftJoin(Reactions, eq(Posts.id, Reactions.postId))
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

export const reactPost = async (reaction: ReactPostParams) => {
	const result = await db
		.insert(Reactions)
		.values({
			userId: reaction.userId,
			postId: reaction.postId,
		})
		.returning();

	if (!result.length) {
		throw new CouldNotCreateError(
			`Failed to create reaction for post with id: ${reaction.postId} and user with id: ${reaction.userId}`,
		);
	}

	return result[0];
};

export const unreactPost = async (reaction: ReactPostParams) => {
	const result = await db
		.delete(Reactions)
		.where(
			and(
				eq(Reactions.userId, reaction.userId),
				eq(Reactions.postId, reaction.postId),
			),
		)
		.returning();

	if (!result.length) {
		throw new CouldNotDeleteError(
			`Failed to delete reaction for post with id: ${reaction.postId} and user with id: ${reaction.userId}`,
		);
	}

	return result[0];
};

export const updatePost = async (post: UpdatePostParams) => {
	const result = await db
		.update(Posts)
		.set({
			content: post.content,
			updatedAt: new Date(),
		})
		.where(eq(Posts.id, post.id))
		.returning();

	if (!result.length) {
		throw new CouldNotUpdateError(`Failed to update post with id: ${post.id}`);
	}

	return result[0];
};
