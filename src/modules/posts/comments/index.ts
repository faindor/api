import { jwt } from "@shared/middleware/jwt";
import { NotFoundError } from "@shared/types/errors";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getStatusCode } from "@shared/utils/error";
import { schemaValidator } from "@shared/utils/schemaValidator";
import { Hono } from "hono";
import {
	createComment,
	getCommentById,
	getLatestsCommentsByPostId,
	softDeleteComment,
	updateComment,
} from "./service";
import { createCommentSchema } from "./types/request";

const commentsApp = new Hono();

commentsApp.get("/:postId/comments", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("postId"),
			route: c.req.path,
		});

		const page = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.query("page"),
			route: c.req.path,
		});

		const comments = await getLatestsCommentsByPostId(postId, page);

		return c.json(comments);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

commentsApp.post("/:postId/comments", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("postId"),
			route: c.req.path,
		});

		const loggedUser = c.get("loggedUser");

		const { content } = schemaValidator({
			schema: createCommentSchema,
			value: await c.req.json(),
			route: c.req.path,
		});
		const createdComment = await createComment({
			content: content,
			postId: postId,
			userId: loggedUser.id,
		});

		return c.json(createdComment);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

commentsApp.patch("/:postId/comments/:id", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("postId"),
			route: c.req.path,
		});

		const commentId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("id"),
			route: c.req.path,
		});

		const loggedUser = c.get("loggedUser");

		const { content } = schemaValidator({
			schema: createCommentSchema,
			value: await c.req.json(),
			route: c.req.path,
		});

		const comment = await getCommentById(commentId);
		if (!comment) {
			throw new NotFoundError(`Comment not found with id: ${commentId}`);
		}

		const updatedComment = await updateComment({
			id: commentId,
			content: content,
			postId: postId,
			userId: loggedUser.id,
		});

		return c.json(updatedComment);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

commentsApp.delete("/:postId/comments/:id", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("postId"),
			route: c.req.path,
		});

		const commentId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("id"),
			route: c.req.path,
		});

		const deletedComment = await softDeleteComment({ id: commentId, postId });

		return c.json(deletedComment);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

export default commentsApp;
