import { Hono } from "hono";

import { findUserById } from "@modules/auth/service";
import { jwt } from "@shared/middleware/jwt";
import {
	AuthorizationError,
	InvalidPayloadError,
	NotFoundError,
} from "@shared/types/errors";
import { UserRoles } from "@shared/types/roles";
import {
	createPost,
	findPostById,
	findLatestsPostsByDomain,
	updatePost,
} from "./service";
import type { CreatePostPayload, UpdatePostPayload } from "./types/request";

const postsApp = new Hono();

postsApp.get("/latests", jwt, async (c) => {
	const loggedUser = await findUserById(c.get("userId"));
	if (!loggedUser) {
		throw new AuthorizationError(
			`User not found inside JWT with id: ${c.get("userId")}`,
		);
	}

	const page = Number(c.req.param("page")) || 1;
	if (page < 1) {
		throw new InvalidPayloadError("The page must be greater than 0");
	}

	const posts = await findLatestsPostsByDomain(
		loggedUser.organization.domain,
		page,
	);

	return c.json(posts);
});

postsApp.post("/", jwt, async (c) => {
	try {
		const payload = await c.req.json<CreatePostPayload>();

		if (!payload.content) {
			throw new Error("Content is required to create a post");
		}

		const loggedUser = await findUserById(c.get("userId"));
		if (!loggedUser) {
			throw new AuthorizationError(
				`User not found inside JWT with id: ${c.get("userId")}`,
			);
		}

		// Check if the user is allowed to create a post for another user
		if (payload.userId) {
			const payloadUser = await findUserById(payload.userId);
			if (!payloadUser) {
				throw new AuthorizationError(
					`User not found inside payload with id: ${c.get("userId")}`,
				);
			}

			if (
				loggedUser.role !== UserRoles.APP_ADMIN &&
				payloadUser.id !== loggedUser.id
			) {
				throw new AuthorizationError(
					"You are not allowed to create a post for another user",
				);
			}
		}

		const post = await createPost(payload, loggedUser.id);

		return c.json(post);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

postsApp.patch("/:id", jwt, async (c) => {
	try {
		const rawId = c.req.param("id");
		const parsedId = Number(rawId);
		if (!parsedId) {
			throw new InvalidPayloadError(`Invalid post id: ${rawId}`);
		}

		const payload = await c.req.json<UpdatePostPayload>();

		if (!payload.content) {
			throw new Error("Content is required to update a post");
		}

		const loggedUser = await findUserById(c.get("userId"));
		if (!loggedUser) {
			throw new AuthorizationError(
				`User not found inside JWT with id: ${c.get("userId")}`,
			);
		}

		const existingPost = await findPostById(parsedId);
		if (!existingPost) {
			throw new NotFoundError(`Post not found with id: ${parsedId}`);
		}

		// Check if the user is allowed to update the post
		if (
			loggedUser.role !== UserRoles.APP_ADMIN &&
			existingPost.userId !== loggedUser.id
		) {
			throw new AuthorizationError(
				`You are not allowed to update post with id: ${existingPost.id}`,
			);
		}

		const post = await updatePost(existingPost.id, payload);

		return c.json(post);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

export default postsApp;