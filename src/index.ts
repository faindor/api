import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import postsApp from "@modules/posts";
import usersApp from "@modules/users";

const app = new Hono();
app.use(cors());
app.use(prettyJSON());

app.route("/users", usersApp);
app.route("/posts", postsApp);

export default app;
