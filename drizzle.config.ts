import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/config/db/schema/*",
  out: "./src/config/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
});