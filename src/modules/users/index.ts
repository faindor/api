import { Hono } from "hono";
import { sign } from "hono/jwt";

import { jwt } from "@shared/middleware/jwt";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getStatusCode } from "@shared/utils/error";
import { schemaValidator } from "@shared/utils/schemaValidator";
import {
	createUser,
	getPublicUserInfoById,
	getUserByCredentials,
} from "./service";
import { loginSchema, registerSchema } from "./types/request";

const usersApp = new Hono();

usersApp.get("/:id", jwt, async (c) => {
	try {
		const userId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("id"),
			route: c.req.path,
		});

		const user = await getPublicUserInfoById(userId);
		return c.json(user);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

usersApp.post("/login", async (c) => {
	try {
		const { email, password } = schemaValidator({
			schema: loginSchema,
			value: await c.req.json(),
			route: c.req.path,
		});

		const user = await getUserByCredentials({ email, password });

		// Create token with the user's id and organization's domain
		const token = await sign(
			{
				iat: new Date().getTime(),
				userId: user.id,
				userRole: user.role,
				userDomain: user.organization.domain,
			},
			Bun.env.JWT_SECRET,
		);

		return c.json({ token });
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

usersApp.post("/register", async (c) => {
	try {
		const { name, email, password } = schemaValidator({
			schema: registerSchema,
			value: await c.req.json(),
			route: c.req.path,
		});

		const createdUser = await createUser({ name, email, password });

		return c.json(createdUser);
	} catch (error) {
		console.error(error);
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

export default usersApp;
