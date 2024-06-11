import { Hono } from "hono";
import { sign } from "hono/jwt";

import { jwt } from "@shared/middleware/jwt";
import { schemaValidator } from "@shared/schemaValidator";
import { InvalidPayloadError } from "@shared/types/errors";
import {
	createUser,
	findUserByCredentials,
	getPublicUserInfoById,
} from "./service";
import {
	type LoginPayload,
	type RegisterPayload,
	getUserSchema,
} from "./types/request";

const usersApp = new Hono();

usersApp.get("/:id", jwt, async (c) => {
	try {
		const userId = schemaValidator({
			schema: getUserSchema,
			value: c.req.param("id"),
			route: "/users/:id",
		});

		const user = await getPublicUserInfoById(userId);
		return c.json(user);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

usersApp.post("/login", async (c) => {
	try {
		const payload = await c.req.json<LoginPayload>();

		if (!payload.email || !payload.password) {
			throw new InvalidPayloadError("Email and password are required to login");
		}

		const user = await findUserByCredentials(payload.email, payload.password);

		// Create token with the user's id and organization's domain
		const token = await sign(
			{
				userId: user.id,
				userRole: user.role,
				userDomain: user.organization.domain,
			},
			Bun.env.JWT_SECRET,
		);

		return c.json({ token });
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

usersApp.post("/register", async (c) => {
	try {
		const payload = await c.req.json<RegisterPayload>();

		if (!payload.name || !payload.email || !payload.password) {
			throw new InvalidPayloadError(
				"Email and password are required to register",
			);
		}

		const userCreated = await createUser(payload);

		return c.json(userCreated);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

export default usersApp;
