import { jwt } from "@shared/middleware/jwt";
import { positiveNumberSchema } from "@shared/types/schemas";
import { getStatusCode } from "@shared/utils/error";
import { schemaValidator } from "@shared/utils/schemaValidator";
import { Hono } from "hono";
import { reactPost, unreactPost } from "./service";

const reactionsApp = new Hono();

reactionsApp.post("/:postId/react", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("postId"),
			route: c.req.path,
		});

		const loggedUser = c.get("loggedUser");

		await reactPost({ postId: postId, userId: loggedUser.id });

		return c.json({ success: true });
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

reactionsApp.post("/:postId/unreact", jwt, async (c) => {
	try {
		const postId = schemaValidator({
			schema: positiveNumberSchema,
			value: c.req.param("postId"),
			route: c.req.path,
		});

		const loggedUser = c.get("loggedUser");

		await unreactPost({ postId: postId, userId: loggedUser.id });

		return c.json({ success: true });
	} catch (error) {
		return c.json({ error }, { status: getStatusCode(error) });
	}
});

export default reactionsApp;
