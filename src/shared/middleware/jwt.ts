import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const jwt = createMiddleware(async (c, next) => {
	const authorizationHeader = c.req.header("Authorization");
	if (!authorizationHeader) {
		return c.json(
			{ error: "No authorization header provided" },
			{ status: 401 },
		);
	}

	// Get the token
	const [, token] = authorizationHeader.split(" ");
	if (!token) {
		return c.json({ error: "No token provided" }, { status: 401 });
	}

	try {
		const payload = await verify(token, process.env.JWT_SECRET);
		c.set("jwtPayload", payload);
	} catch (error) {
		return c.json({ error: "Invalid token" }, { status: 401 });
	}

	await next();
});
