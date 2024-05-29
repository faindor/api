import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import auth from "@modules/auth";

const app = new Hono();
app.use(cors());
app.use(prettyJSON());

app.route("/auth", auth);

export default app;
