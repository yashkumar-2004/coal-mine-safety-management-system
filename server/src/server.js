import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initDatabase } from "./db/migrate.js";

const app = createApp();

async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.warn("Database auto-init warning (will continue):", err.message);
  }

  app.listen(env.port, () => {
    console.log(`Coal Mine Compliance API listening on http://localhost:${env.port}`);
  });
}

start();
