import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error", err);
});
