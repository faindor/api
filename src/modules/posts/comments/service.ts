import db from "@shared/db";
import { Comments } from "@shared/db/tables/comments";
import { CouldNotCreateError, CouldNotUpdateError } from "@shared/types/errors";
import { eq } from "drizzle-orm";
import type { CreateCommentParams, UpdateCommentParams } from "./types/request";

export const getCommentById = async (id: number) => {
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
};

export const createComment = async (comment: CreateCommentParams) => {
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
};

export const updateComment = async (comment: UpdateCommentParams) => {
	const result = await db
		.update(Comments)
		.set({
			content: comment.content,
			updatedAt: new Date(),
		})
		.where(eq(Comments.id, comment.id))
		.returning();

	if (!result.length) {
		throw new CouldNotUpdateError(
			`Failed to update comment with id: ${comment.id}`,
		);
	}

	return result[0];
};
