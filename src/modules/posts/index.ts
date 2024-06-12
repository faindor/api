import { Hono } from "hono";

import { getUserById } from "@modules/users/service";
import { jwt } from "@shared/middleware/jwt";
import { schemaValidator } from "@shared/schemaValidator";
import {
	AuthorizationError,
	InvalidPayloadError,
	NotFoundError,
} from "@shared/types/errors";
import { UserRoles } from "@shared/types/roles";
import { idSchema } from "@shared/types/schemas";
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

		const page = Number(c.req.query("page")) || 1;
		if (page < 1) {
			throw new InvalidPayloadError("The page must be greater than 0");
		}

		const posts = await getLatestsPostsByDomain(loggedUser.domain, page);

		return c.json(posts);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

postsApp.get("/:userId/latests", jwt, async (c) => {
	try {
		const loggedUser = c.get("loggedUser");

		const rawUserId = c.req.param("userId");
		const parsedUserId = Number(rawUserId);
		if (!parsedUserId) {
			throw new InvalidPayloadError(`Invalid user id: ${parsedUserId}`);
		}

		const userParam = await getUserById(parsedUserId);
		if (!userParam) {
			throw new NotFoundError(`User not found with id: ${parsedUserId}`);
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

		const page = Number(c.req.query("page")) || 1;
		if (page < 1) {
			throw new InvalidPayloadError("The page must be greater than 0");
		}

		const posts = await getLatestsPostsByUserId(userParam.id, page);

		return c.json(posts);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

postsApp.post("/", jwt, async (c) => {
	try {
		const { content } = schemaValidator({
			schema: createPostSchema,
			value: c.req.json(),
			route: "/posts",
		});

		const loggedUser = c.get("loggedUser");

		const post = await createPost({
			content: content,
			userId: loggedUser.id,
		});

		return c.json(post);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

postsApp.patch("/:id", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: idSchema,
			value: c.req.param("id"),
			route: "/posts/:id",
		});

		const { content } = schemaValidator({
			schema: updatePostSchema,
			value: c.req.json(),
			route: "/posts/:id",
		});

		const existingPost = await getPostById(postId);
		if (!existingPost) {
			throw new NotFoundError(`Post not found with id: ${postId}`);
		}

		const updatedPost = await updatePost({ id: existingPost.id, content });

		return c.json(updatedPost);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

export default postsApp;
