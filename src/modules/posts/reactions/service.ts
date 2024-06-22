import db from "@shared/db";
import { Reactions } from "@shared/db/tables/reactions";
import { CouldNotCreateError, CouldNotDeleteError } from "@shared/types/errors";
import { and, eq } from "drizzle-orm";
import type { ReactPostParams } from "./types/request";

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
