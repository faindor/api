import { Hono } from "hono";
import { createUser } from "./service";
import type { CreateUserPayload } from "./types/request";

const userApp = new Hono();

userApp.post("/", async (c) => {
	const payload = await c.req.json<CreateUserPayload>();
	const userCreated = await createUser(payload);
	return c.json(userCreated);
});

export default userApp;
