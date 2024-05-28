import { Hono } from "hono";
import { sign } from "hono/jwt";

import { createUser, getUserByCredentials } from "./service";
import type { LoginPayload, RegisterPayload } from "./types/request";

const auth = new Hono();

auth.post("/login", async (c) => {
	const payload = await c.req.json<LoginPayload>();

	const user = await getUserByCredentials(payload.email, payload.password);
	if (!user) {
		return c.json({ error: "Invalid credentials" }, { status: 401 });
	}

	// Create token with the user's organization domain
	const token = await sign(
		{
			domain: user.organization?.domain,
		},
		process.env.JWT_SECRET,
	);

	return c.json({ token }, { status: 200 });
});

auth.post("/register", async (c) => {
	const payload = await c.req.json<RegisterPayload>();
	const userCreated = await createUser(payload);
	return c.json(userCreated);
});

export default auth;
