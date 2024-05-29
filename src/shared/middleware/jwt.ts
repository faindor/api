import { AuthorizationError } from "@shared/types/errors";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const jwt = createMiddleware<{
	Variables: {
		userId: number;
		userDomain: string;
	};
}>(async (c, next) => {
	const authorizationHeader = c.req.header("Authorization");
	if (!authorizationHeader) {
		return c.json(
			{ error: new AuthorizationError("No authorization header provided") },
			{ status: 401 },
		);
	}

	// Get the token
	const [, token] = authorizationHeader.split(" ");
	if (!token) {
		return c.json(
			{ error: new AuthorizationError("No token provided") },
			{ status: 401 },
		);
	}

	try {
		const payload = await verify(token, Bun.env.JWT_SECRET);
		c.set("userId", payload.userId as number);
		c.set("userDomain", payload.userDomain as string);
	} catch (error) {
		return c.json(
			{ error: new AuthorizationError("Invalid token") },
			{ status: 401 },
		);
	}

	await next();
});
