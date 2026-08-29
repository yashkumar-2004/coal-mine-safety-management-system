import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { analyticsRouter } from "./routes/analytics.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { inspectionsRouter } from "./routes/inspections.js";
import { minesRouter } from "./routes/mines.js";
import { regulationsRouter } from "./routes/regulations.js";
import { telemetryRouter } from "./routes/telemetry.js";
import { violationsRouter } from "./routes/violations.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  // Mount API domain routes
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/mines", minesRouter);
  app.use("/api/regulations", regulationsRouter);
  app.use("/api/inspections", inspectionsRouter);
  app.use("/api/violations", violationsRouter);
  app.use("/api/telemetry", telemetryRouter);
  app.use("/api/analytics", analyticsRouter);

  // 404 handler for API routes
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error("Unhandled API error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
