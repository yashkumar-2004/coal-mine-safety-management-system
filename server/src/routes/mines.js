import { Router } from "express";
import { pool } from "../db/pool.js";

export const minesRouter = Router();

// GET all mines with optional query parameters
minesRouter.get("/", async (req, res) => {
  try {
    const { search, type, status, state } = req.query;

    let query = `
      SELECT m.*,
        (SELECT COUNT(*) FROM violations v WHERE v.mine_id = m.id AND v.status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS open_violations_count,
        (SELECT COUNT(*) FROM violations v WHERE v.mine_id = m.id AND v.severity = 'Critical' AND v.status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS critical_violations_count,
        (SELECT json_build_object(
            'methane_ch4', st.methane_ch4,
            'carbon_monoxide_co', st.carbon_monoxide_co,
            'pm10', st.pm10,
            'pm25', st.pm25,
            'status', st.status,
            'recorded_at', st.recorded_at
          )
         FROM sensor_telemetry st
         WHERE st.mine_id = m.id
         ORDER BY st.recorded_at DESC
         LIMIT 1
        ) AS latest_telemetry
      FROM mines m
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (m.name ILIKE $${params.length} OR m.code ILIKE $${params.length} OR m.coalfield ILIKE $${params.length} OR m.operator ILIKE $${params.length})`;
    }

    if (type && type !== "ALL") {
      params.push(type);
      query += ` AND m.type = $${params.length}`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND m.status = $${params.length}`;
    }

    if (state && state !== "ALL") {
      params.push(state);
      query += ` AND m.state = $${params.length}`;
    }

    query += ` ORDER BY m.id ASC`;

    const result = await pool.query(query, params);
    res.json({ mines: result.rows });
  } catch (err) {
    console.error("Fetch mines error:", err);
    res.status(500).json({ error: "Failed to fetch coal mines" });
  }
});

// GET single mine by ID with full details
minesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const mineRes = await pool.query("SELECT * FROM mines WHERE id = $1", [id]);
    if (mineRes.rows.length === 0) {
      return res.status(404).json({ error: "Mine not found" });
    }

    const mine = mineRes.rows[0];

    // Fetch active violations
    const violationsRes = await pool.query(
      `SELECT v.*, r.title as regulation_title, r.code as regulation_code
       FROM violations v
       LEFT JOIN compliance_regulations r ON v.regulation_id = r.id
       WHERE v.mine_id = $1
       ORDER BY v.created_at DESC`,
      [id]
    );

    // Fetch recent inspections
    const inspectionsRes = await pool.query(
      `SELECT * FROM inspections WHERE mine_id = $1 ORDER BY inspection_date DESC LIMIT 10`,
      [id]
    );

    // Fetch recent telemetry readings
    const telemetryRes = await pool.query(
      `SELECT * FROM sensor_telemetry WHERE mine_id = $1 ORDER BY recorded_at DESC LIMIT 20`,
      [id]
    );

    res.json({
      mine,
      violations: violationsRes.rows,
      inspections: inspectionsRes.rows,
      telemetry: telemetryRes.rows,
    });
  } catch (err) {
    console.error("Fetch mine detail error:", err);
    res.status(500).json({ error: "Failed to fetch mine details" });
  }
});

// POST create a new mine
minesRouter.post("/", async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      coalfield,
      state,
      operator,
      capacity_mtpa = 0,
      area_sq_km = 0,
      status = "Active",
      safety_rating = "A",
      coordinates = { lat: 23.7, lng: 86.4 },
      manager_name,
      contact_phone,
    } = req.body;

    if (!code || !name || !type || !coalfield || !state || !operator) {
      return res.status(400).json({ error: "Code, name, type, coalfield, state, and operator are required" });
    }

    const result = await pool.query(
      `INSERT INTO mines (code, name, type, coalfield, state, operator, capacity_mtpa, area_sq_km, status, safety_rating, coordinates, manager_name, contact_phone, compliance_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 100.00)
       RETURNING *`,
      [
        code.trim().toUpperCase(),
        name.trim(),
        type,
        coalfield.trim(),
        state.trim(),
        operator.trim(),
        capacity_mtpa,
        area_sq_km,
        status,
        safety_rating,
        JSON.stringify(coordinates),
        manager_name,
        contact_phone,
      ]
    );

    res.status(201).json({ mine: result.rows[0] });
  } catch (err) {
    console.error("Create mine error:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Mine code already exists" });
    }
    res.status(500).json({ error: "Failed to create mine" });
  }
});

// PUT update mine
minesRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      coalfield,
      state,
      operator,
      capacity_mtpa,
      area_sq_km,
      status,
      safety_rating,
      compliance_score,
      manager_name,
      contact_phone,
    } = req.body;

    const result = await pool.query(
      `UPDATE mines
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           coalfield = COALESCE($3, coalfield),
           state = COALESCE($4, state),
           operator = COALESCE($5, operator),
           capacity_mtpa = COALESCE($6, capacity_mtpa),
           area_sq_km = COALESCE($7, area_sq_km),
           status = COALESCE($8, status),
           safety_rating = COALESCE($9, safety_rating),
           compliance_score = COALESCE($10, compliance_score),
           manager_name = COALESCE($11, manager_name),
           contact_phone = COALESCE($12, contact_phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        name,
        type,
        coalfield,
        state,
        operator,
        capacity_mtpa,
        area_sq_km,
        status,
        safety_rating,
        compliance_score,
        manager_name,
        contact_phone,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mine not found" });
    }

    res.json({ mine: result.rows[0] });
  } catch (err) {
    console.error("Update mine error:", err);
    res.status(500).json({ error: "Failed to update mine" });
  }
});

// DELETE mine
minesRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM mines WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mine not found" });
    }
    res.json({ message: "Mine deleted successfully", id });
  } catch (err) {
    console.error("Delete mine error:", err);
    res.status(500).json({ error: "Failed to delete mine" });
  }
});
