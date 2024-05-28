import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { applyRoutes } from "./applyRoutes";

const app = new Hono();
app.use(cors());
app.use(prettyJSON());

applyRoutes(app);

export default app;
