import { Router } from "express";
import { pool } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database = "disconnected";
  let counts = null;

  try {
    const check = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM mines) AS mines_count,
        (SELECT COUNT(*) FROM violations) AS violations_count,
        (SELECT COUNT(*) FROM inspections) AS inspections_count,
        (SELECT COUNT(*) FROM compliance_regulations) AS regulations_count
    `);
    database = "connected";
    counts = {
      mines: parseInt(check.rows[0].mines_count, 10),
      violations: parseInt(check.rows[0].violations_count, 10),
      inspections: parseInt(check.rows[0].inspections_count, 10),
      regulations: parseInt(check.rows[0].regulations_count, 10),
    };
  } catch {
    database = "disconnected";
  }

  res.json({
    status: "ok",
    service: "coal-mine-compliance-api",
    timestamp: new Date().toISOString(),
    database,
    uptimeSeconds: Math.floor(process.uptime()),
    counts: counts ?? undefined,
  });
});
