import { Hono } from "hono";
import { sign } from "hono/jwt";

import { jwt } from "@shared/middleware/jwt";
import { InvalidPayloadError } from "@shared/types/errors";
import type { LoginPayload, RegisterPayload } from "./types/request";
import { findUserById, createUser, findUserByCredentials } from "./service";

const authApp = new Hono();

authApp.get("/me", jwt, async (c) => {
	const user = await findUserById(c.get("userId"));
	return c.json(user);
});

authApp.get("/:id", jwt, async (c) => {
	const rawUserId = c.req.param("id");
	const parsedUserId = Number(rawUserId);
	if (!parsedUserId) {
		return c.json(
			{ error: new Error(`Invalid user id: ${rawUserId}`) },
			{ status: 400 },
		);
	}

	const user = await findUserById(parsedUserId);
	return c.json(user);
});

authApp.post("/login", async (c) => {
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
				userDomain: user.organization.domain,
			},
			Bun.env.JWT_SECRET,
		);

		return c.json({ token });
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 401 });
	}
});

authApp.post("/register", async (c) => {
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
		return c.json({ error }, { status: 401 });
	}
});

export default authApp;
