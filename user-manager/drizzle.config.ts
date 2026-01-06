import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./db",
  dialect: "sqlite",
  dbCredentials: {
    url: "./db/sqlite.db",
  },
  verbose: true,
  strict: true
})
