import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import authApp from "@modules/auth";
import organizationApp from "@modules/organizations";
import postsApp from "@modules/posts";

const app = new Hono();
app.use(cors());
app.use(prettyJSON());

app.route("/auth", authApp);
app.route("/organizations", organizationApp);
app.route("/posts", postsApp);

export default app;
