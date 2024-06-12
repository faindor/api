import { Hono } from "hono";
import { sign } from "hono/jwt";

import { jwt } from "@shared/middleware/jwt";
import { schemaValidator } from "@shared/schemaValidator";
import {
	createUser,
	getPublicUserInfoById,
	getUserByCredentials,
} from "./service";
import { loginSchema, registerSchema, userIdSchema } from "./types/request";

const usersApp = new Hono();

usersApp.get("/:id", jwt, async (c) => {
	try {
		const userId = schemaValidator({
			schema: userIdSchema,
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
		const { email, password } = schemaValidator({
			schema: loginSchema,
			value: c.req.json(),
			route: "/users/login",
		});

		const user = await getUserByCredentials({ email, password });

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
		const { name, email, password } = schemaValidator({
			schema: registerSchema,
			value: c.req.json(),
			route: "/users/register",
		});

		const createdUser = await createUser({ name, email, password });

		return c.json(createdUser);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: 400 });
	}
});

export default usersApp;
