import { Hono } from "hono";

import { applyRoutes } from "./applyRoutes";

const app = new Hono();

applyRoutes(app);

export default app;
