import type { Hono } from "hono";

import userApp from "@modules/user";

export const applyRoutes = (app: Hono) => {
	app.route("/users", userApp);
};
