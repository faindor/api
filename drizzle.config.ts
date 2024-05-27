import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/shared/db/schema/*",
	out: "./src/shared/db/migrations",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
