import { Router } from "express";
import { pool } from "../db/pool.js";

export const telemetryRouter = Router();

// Evaluation helper for sensor breach detection
function evaluateSensorBreaches({
  methane_ch4 = 0,
  carbon_monoxide_co = 0,
  pm25 = 0,
  pm10 = 0,
  ambient_noise_db = 0,
  water_ph = 7.0,
  temperature_c = 25,
}) {
  const breaches = [];
  let status = "NORMAL";

  // Methane CH4: Normal < 0.75%, Warning 0.75-1.25%, Critical > 1.25%
  if (methane_ch4 > 1.25) {
    breaches.push(`CRITICAL: Methane CH4 (${methane_ch4}%) exceeds maximum statutory threshold 1.25%`);
    status = "CRITICAL_ALERT";
  } else if (methane_ch4 > 0.75) {
    breaches.push(`WARNING: Methane CH4 (${methane_ch4}%) exceeds return airway threshold 0.75%`);
    if (status !== "CRITICAL_ALERT") status = "WARNING";
  }

  // Carbon Monoxide CO: Normal < 30 ppm, Warning 30-50 ppm, Critical > 50 ppm
  if (carbon_monoxide_co > 50) {
    breaches.push(`CRITICAL: Carbon Monoxide (${carbon_monoxide_co} ppm) exceeds safe limit 50 ppm`);
    status = "CRITICAL_ALERT";
  } else if (carbon_monoxide_co > 30) {
    breaches.push(`WARNING: Carbon Monoxide (${carbon_monoxide_co} ppm) elevated`);
    if (status !== "CRITICAL_ALERT") status = "WARNING";
  }

  // Particulate Matter PM10 (limit 100) & PM2.5 (limit 60)
  if (pm10 > 150 || pm25 > 90) {
    breaches.push(`CRITICAL: Heavy dust pollution (PM10: ${pm10} µg/m³, PM2.5: ${pm25} µg/m³)`);
    status = "CRITICAL_ALERT";
  } else if (pm10 > 100 || pm25 > 60) {
    breaches.push(`WARNING: Ambient dust exceeds MoEFCC standards (PM10: ${pm10} µg/m³)`);
    if (status !== "CRITICAL_ALERT") status = "WARNING";
  }

  // Ambient Noise: Limit 75 dB
  if (ambient_noise_db > 85) {
    breaches.push(`CRITICAL: Extreme acoustic hazard (${ambient_noise_db} dB)`);
    status = "CRITICAL_ALERT";
  } else if (ambient_noise_db > 75) {
    breaches.push(`WARNING: Ambient noise exceeds 75 dB (${ambient_noise_db} dB)`);
    if (status !== "CRITICAL_ALERT") status = "WARNING";
  }

  // Water pH: 6.5 - 8.5
  if (water_ph < 5.5 || water_ph > 9.5) {
    breaches.push(`CRITICAL: Severe acidic/alkaline effluent discharge (pH ${water_ph})`);
    status = "CRITICAL_ALERT";
  } else if (water_ph < 6.5 || water_ph > 8.5) {
    breaches.push(`WARNING: Effluent discharge pH out of range (${water_ph})`);
    if (status !== "CRITICAL_ALERT") status = "WARNING";
  }

  return { status, breaches };
}

// GET latest telemetry readings across all active mines
telemetryRouter.get("/", async (req, res) => {
  try {
    const { mine_id } = req.query;

    let query = `
      SELECT DISTINCT ON (st.mine_id)
        st.*, m.name as mine_name, m.code as mine_code, m.type as mine_type, m.coalfield
      FROM sensor_telemetry st
      JOIN mines m ON st.mine_id = m.id
    `;
    const params = [];

    if (mine_id) {
      params.push(mine_id);
      query += ` WHERE st.mine_id = $${params.length}`;
    }

    query += ` ORDER BY st.mine_id, st.recorded_at DESC`;

    const result = await pool.query(query, params);
    res.json({ telemetry: result.rows });
  } catch (err) {
    console.error("Fetch telemetry error:", err);
    res.status(500).json({ error: "Failed to fetch telemetry" });
  }
});

// GET historical telemetry logs
telemetryRouter.get("/history", async (req, res) => {
  try {
    const { mine_id, limit = 50 } = req.query;

    let query = `
      SELECT st.*, m.name as mine_name, m.code as mine_code
      FROM sensor_telemetry st
      JOIN mines m ON st.mine_id = m.id
    `;
    const params = [];

    if (mine_id) {
      params.push(mine_id);
      query += ` WHERE st.mine_id = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY st.recorded_at DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json({ history: result.rows });
  } catch (err) {
    console.error("Fetch telemetry history error:", err);
    res.status(500).json({ error: "Failed to fetch telemetry history" });
  }
});

// POST ingest single telemetry reading
telemetryRouter.post("/", async (req, res) => {
  try {
    const {
      mine_id,
      sensor_code,
      location_name,
      methane_ch4 = 0,
      carbon_monoxide_co = 0,
      pm25 = 0,
      pm10 = 0,
      ambient_noise_db = 0,
      water_ph = 7.0,
      temperature_c = 25,
      humidity_pct = 60,
    } = req.body;

    if (!mine_id || !sensor_code || !location_name) {
      return res.status(400).json({ error: "mine_id, sensor_code, and location_name are required" });
    }

    const { status, breaches } = evaluateSensorBreaches({
      methane_ch4: Number(methane_ch4),
      carbon_monoxide_co: Number(carbon_monoxide_co),
      pm25: Number(pm25),
      pm10: Number(pm10),
      ambient_noise_db: Number(ambient_noise_db),
      water_ph: Number(water_ph),
      temperature_c: Number(temperature_c),
    });

    const result = await pool.query(
      `INSERT INTO sensor_telemetry (mine_id, sensor_code, location_name, methane_ch4, carbon_monoxide_co, pm25, pm10, ambient_noise_db, water_ph, temperature_c, humidity_pct, status, breach_details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        mine_id,
        sensor_code,
        location_name,
        methane_ch4,
        carbon_monoxide_co,
        pm25,
        pm10,
        ambient_noise_db,
        water_ph,
        temperature_c,
        humidity_pct,
        status,
        JSON.stringify(breaches),
      ]
    );

    res.status(201).json({ reading: result.rows[0], breaches, status });
  } catch (err) {
    console.error("Ingest telemetry error:", err);
    res.status(500).json({ error: "Failed to ingest telemetry" });
  }
});

// POST simulate fresh telemetry tick for all mines (Live Streaming Simulation)
telemetryRouter.post("/simulate", async (_req, res) => {
  try {
    const minesRes = await pool.query("SELECT id, code, name, type FROM mines WHERE status != 'Inactive'");
    const inserted = [];

    for (const mine of minesRes.rows) {
      const isUnderground = mine.type === "Underground";
      
      // Random realistic fluctuations
      const methane_ch4 = isUnderground
        ? Number((Math.random() * 0.9 + 0.1).toFixed(2))
        : Number((Math.random() * 0.05).toFixed(2));
      const carbon_monoxide_co = isUnderground
        ? Number((Math.random() * 25 + 5).toFixed(1))
        : Number((Math.random() * 8 + 1).toFixed(1));
      const pm10 = Number((Math.random() * 50 + 55).toFixed(1));
      const pm25 = Number((pm10 * 0.5 + Math.random() * 10).toFixed(1));
      const ambient_noise_db = Number((Math.random() * 20 + 60).toFixed(1));
      const water_ph = Number((Math.random() * 1.6 + 6.6).toFixed(1));
      const temperature_c = Number((Math.random() * 8 + 26).toFixed(1));
      const humidity_pct = Number((Math.random() * 25 + 65).toFixed(1));

      const { status, breaches } = evaluateSensorBreaches({
        methane_ch4,
        carbon_monoxide_co,
        pm25,
        pm10,
        ambient_noise_db,
        water_ph,
        temperature_c,
      });

      const sensor_code = `SNS-${mine.code.replace("MINE-", "")}-${isUnderground ? "UG" : "OC"}-01`;
      const location_name = isUnderground
        ? `${mine.name} - Underground Active Panel`
        : `${mine.name} - Haul Road & Crusher Zone`;

      const insertRes = await pool.query(
        `INSERT INTO sensor_telemetry (mine_id, sensor_code, location_name, methane_ch4, carbon_monoxide_co, pm25, pm10, ambient_noise_db, water_ph, temperature_c, humidity_pct, status, breach_details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          mine.id,
          sensor_code,
          location_name,
          methane_ch4,
          carbon_monoxide_co,
          pm25,
          pm10,
          ambient_noise_db,
          water_ph,
          temperature_c,
          humidity_pct,
          status,
          JSON.stringify(breaches),
        ]
      );

      inserted.push({
        ...insertRes.rows[0],
        mine_name: mine.name,
        mine_code: mine.code,
      });
    }

    res.json({
      message: `Simulated fresh sensor telemetry for ${inserted.length} coal mines`,
      telemetry: inserted,
    });
  } catch (err) {
    console.error("Simulation error:", err);
    res.status(500).json({ error: "Failed to simulate telemetry" });
  }
});
