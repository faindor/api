import { z } from "zod";

export const createCommentSchema = z.object({
	content: z.string().min(1),
});

export type UpdateCommentParams = {
	id: number;
	content: string;
	postId: number;
	userId: number;
};

export type CreateCommentParams = {
	userId: number;
	postId: number;
	content: string;
};
