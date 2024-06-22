import { Hono } from "hono";

import { getUserById } from "@modules/users/service";
import { jwt } from "@shared/middleware/jwt";
import { AuthorizationError, NotFoundError } from "@shared/types/errors";
import { UserRoles } from "@shared/types/roles";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getStatusCode } from "@shared/utils/error";
import { schemaValidator } from "@shared/utils/schemaValidator";
import reactionsApp from "./reactions";
import {
	createPost,
	getLatestsPostsByDomain,
	getLatestsPostsByUserId,
	getPostById,
	updatePost,
} from "./service";
import { createPostSchema, updatePostSchema } from "./types/request";

const postsApp = new Hono();

postsApp.get("/latests", jwt, async (c) => {
	try {
		const loggedUser = c.get("loggedUser");

		const page = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.query("page"),
			route: c.req.path,
		});

		const posts = await getLatestsPostsByDomain(loggedUser.domain, page);

		return c.json(posts);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

postsApp.get("/:userId/latests", jwt, async (c) => {
	try {
		const loggedUser = c.get("loggedUser");

		const userId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("id"),
			route: c.req.path,
		});

		const userParam = await getUserById(userId);
		if (!userParam) {
			throw new NotFoundError(`User not found with id: ${userId}`);
		}

		// A user cannot get posts from another organization (unless they are admin)
		if (
			userParam.organization.domain !== loggedUser.domain &&
			loggedUser.role !== UserRoles.APP_ADMIN
		) {
			throw new AuthorizationError(
				"You are not allowed to get posts of an user from another organization",
			);
		}

		const page = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.query("page"),
			route: c.req.path,
		});

		const posts = await getLatestsPostsByUserId(userParam.id, page);

		return c.json(posts);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

postsApp.post("/", jwt, async (c) => {
	try {
		const { content } = schemaValidator({
			schema: createPostSchema,
			value: await c.req.json(),
			route: c.req.path,
		});

		const loggedUser = c.get("loggedUser");

		const post = await createPost({
			content: content,
			userId: loggedUser.id,
		});

		return c.json(post);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

postsApp.patch("/:id", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("id"),
			route: c.req.path,
		});

		const { content } = schemaValidator({
			schema: updatePostSchema,
			value: await c.req.json(),
			route: c.req.path,
		});

		const existingPost = await getPostById(postId);
		if (!existingPost) {
			throw new NotFoundError(`Post not found with id: ${postId}`);
		}

		const updatedPost = await updatePost({ id: existingPost.id, content });

		return c.json(updatedPost);
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

postsApp.route("/", reactionsApp);

export default postsApp;
