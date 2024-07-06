import db from "@shared/db";
import { Comments } from "@shared/db/tables/comments";
import {
	CouldNotCreateError,
	CouldNotDeleteError,
	CouldNotUpdateError,
} from "@shared/types/errors";
import { and, desc, eq } from "drizzle-orm";
import type {
	CreateCommentParams,
	DeleteCommentParams,
	UpdateCommentParams,
} from "./types/request";
import { Users } from "@shared/db/tables/users";
import { Posts } from "@shared/db/tables/posts";
import { parseDBError } from "@shared/utils/error";

export const getCommentById = async (id: number) => {
	try {
		const result = await db
			.select({
				id: Comments.id,
				content: Comments.content,
				postId: Comments.postId,
				userId: Comments.userId,
				createdAt: Comments.createdAt,
				updatedAt: Comments.updatedAt,
				deletedAt: Comments.deletedAt,
			})
			.from(Comments)
			.where(eq(Comments.id, id));

		if (!result.length) return null;

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};

export const getLatestsCommentsByPostId = async (postId: number, page = 1) => {
	try {
		const result = await db
			.select({
				id: Comments.id,
				content: Comments.content,
				postId: Comments.postId,
				user: {
					id: Users.id,
					name: Users.name,
					email: Users.email,
				},
				createdAt: Comments.createdAt,
				updatedAt: Comments.updatedAt,
			})
			.from(Comments)
			.innerJoin(Posts, eq(Comments.postId, Posts.id))
			.innerJoin(Users, eq(Comments.userId, Users.id))
			.where(eq(Posts.id, postId))
			.orderBy(desc(Comments.createdAt))
			.offset((page - 1) * 10) // Get 10 comments per page, skip the other ones
			.limit(10);

		return result;
	} catch (error) {
		throw parseDBError(error);
	}
};

export const createComment = async (comment: CreateCommentParams) => {
	try {
		const result = await db
			.insert(Comments)
			.values({
				content: comment.content,
				postId: comment.postId,
				userId: comment.userId,
			})
			.returning();

		if (!result.length) {
			throw new CouldNotCreateError(
				`Failed to create comment with content: ${comment.content} for user: ${comment.userId}`,
			);
		}

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};

export const updateComment = async (comment: UpdateCommentParams) => {
	try {
		const result = await db
			.update(Comments)
			.set({
				content: comment.content,
				updatedAt: new Date(),
			})
			.where(
				and(eq(Comments.id, comment.id), eq(Comments.postId, comment.postId)),
			)
			.returning();

		if (!result.length) {
			throw new CouldNotUpdateError(
				`Failed to update comment with id: ${comment.id}`,
			);
		}

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};

export const softDeleteComment = async (comment: DeleteCommentParams) => {
	try {
		const result = await db
			.update(Comments)
			.set({
				deletedAt: new Date(),
			})
			.where(
				and(eq(Comments.id, comment.id), eq(Comments.postId, comment.postId)),
			)
			.returning();

		if (!result.length) {
			throw new CouldNotDeleteError(
				`Failed to delete comment with id: ${comment.id}`,
			);
		}

		return result[0];
	} catch (error) {
		throw parseDBError(error);
	}
};
