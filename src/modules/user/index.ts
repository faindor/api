import { Hono } from "hono";
import { createUser, getUserById } from "./service";

const userApp = new Hono();

userApp.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const user = await getUserById(id);
	return c.json(user);
});

userApp.post("/", async (c) => {
	const user = await c.req.json();
	const userCreated = await createUser(user);
	return c.json(userCreated);
});

export default userApp;
