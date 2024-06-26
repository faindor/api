import { AuthorizationError } from "@shared/types/errors";
import { getStatusCode } from "@shared/utils/error";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

interface JWTMiddleware {
	Variables: {
		loggedUser: {
			id: number;
			role: string;
			domain: string;
		};
	};
}

export const jwt = createMiddleware<JWTMiddleware>(async (c, next) => {
	try {
		const authorizationHeader = c.req.header("Authorization");
		if (!authorizationHeader) {
			throw new AuthorizationError(
				"No authorization header provided",
				c.req.path,
			);
		}

		// Get the token
		const [, token] = authorizationHeader.split(" ");
		if (!token) {
			throw new AuthorizationError("No token provided", c.req.path);
		}

		// Verify and validate the token
		const payload = await verify(token, Bun.env.JWT_SECRET);

		if (!payload.userId || !payload.userDomain || !payload.userRole) {
			throw new AuthorizationError("Invalid token", c.req.path);
		}

		// Set the user's token info in the context
		c.set("loggedUser", {
			id: payload.userId as number,
			role: payload.userRole as string,
			domain: payload.userDomain as string,
		});
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}

	await next();
});
