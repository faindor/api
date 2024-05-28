import type { Hono } from "hono";

import auth from "@modules/auth";

export const applyRoutes = (app: Hono) => {
	app.route("/auth", auth);
};
