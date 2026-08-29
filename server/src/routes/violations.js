import { Router } from "express";
import { pool } from "../db/pool.js";

export const violationsRouter = Router();

// GET all violations with search & filter
violationsRouter.get("/", async (req, res) => {
  try {
    const { mine_id, status, severity, category, search } = req.query;

    let query = `
      SELECT v.*, m.name as mine_name, m.code as mine_code, m.coalfield, m.state,
             r.title as regulation_title, r.code as regulation_code, r.governing_body
      FROM violations v
      JOIN mines m ON v.mine_id = m.id
      LEFT JOIN compliance_regulations r ON v.regulation_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (mine_id) {
      params.push(mine_id);
      query += ` AND v.mine_id = $${params.length}`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND v.status = $${params.length}`;
    }

    if (severity && severity !== "ALL") {
      params.push(severity);
      query += ` AND v.severity = $${params.length}`;
    }

    if (category && category !== "ALL") {
      params.push(category);
      query += ` AND v.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (v.title ILIKE $${params.length} OR v.violation_code ILIKE $${params.length} OR v.description ILIKE $${params.length} OR m.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY CASE v.severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, v.reported_date DESC, v.id DESC`;

    const result = await pool.query(query, params);
    res.json({ violations: result.rows });
  } catch (err) {
    console.error("Fetch violations error:", err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
});

// GET single violation by ID
violationsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT v.*, m.name as mine_name, m.code as mine_code, m.coalfield, m.operator,
              r.title as regulation_title, r.code as regulation_code, r.governing_body, r.threshold_limit, r.penalty_clause,
              i.inspection_number, i.inspector_name
       FROM violations v
       JOIN mines m ON v.mine_id = m.id
       LEFT JOIN compliance_regulations r ON v.regulation_id = r.id
       LEFT JOIN inspections i ON v.inspection_id = i.id
       WHERE v.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Violation not found" });
    }

    res.json({ violation: result.rows[0] });
  } catch (err) {
    console.error("Fetch violation detail error:", err);
    res.status(500).json({ error: "Failed to fetch violation" });
  }
});

// POST create violation
violationsRouter.post("/", async (req, res) => {
  try {
    const {
      mine_id,
      regulation_id,
      inspection_id,
      title,
      category,
      severity = "High",
      status = "OPEN",
      reported_date = new Date().toISOString().split("T")[0],
      due_date,
      description,
      corrective_action,
      preventive_action,
      assigned_to,
    } = req.body;

    if (!mine_id || !title || !category || !description) {
      return res.status(400).json({ error: "mine_id, title, category, and description are required" });
    }

    const countRes = await pool.query("SELECT COUNT(*) FROM violations");
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const violation_code = `VIO-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;

    const result = await pool.query(
      `INSERT INTO violations (violation_code, mine_id, regulation_id, inspection_id, title, category, severity, status, reported_date, due_date, description, corrective_action, preventive_action, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        violation_code,
        mine_id,
        regulation_id || null,
        inspection_id || null,
        title,
        category,
        severity,
        status,
        reported_date,
        due_date || null,
        description,
        corrective_action,
        preventive_action,
        assigned_to,
      ]
    );

    res.status(201).json({ violation: result.rows[0] });
  } catch (err) {
    console.error("Create violation error:", err);
    res.status(500).json({ error: "Failed to create violation" });
  }
});

// PUT update violation status / resolution / CAPA
violationsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      severity,
      corrective_action,
      preventive_action,
      assigned_to,
      due_date,
      resolved_by,
      resolution_notes,
    } = req.body;

    let resolved_at_clause = "";
    const params = [
      status,
      severity,
      corrective_action,
      preventive_action,
      assigned_to,
      due_date,
      resolved_by,
      resolution_notes,
      id,
    ];

    if (status === "RESOLVED" || status === "VERIFIED") {
      resolved_at_clause = ", resolved_at = COALESCE(resolved_at, CURRENT_TIMESTAMP)";
    } else if (status === "OPEN" || status === "UNDER_INVESTIGATION") {
      resolved_at_clause = ", resolved_at = NULL, resolved_by = NULL";
    }

    const result = await pool.query(
      `UPDATE violations
       SET status = COALESCE($1, status),
           severity = COALESCE($2, severity),
           corrective_action = COALESCE($3, corrective_action),
           preventive_action = COALESCE($4, preventive_action),
           assigned_to = COALESCE($5, assigned_to),
           due_date = COALESCE($6, due_date),
           resolved_by = COALESCE($7, resolved_by),
           resolution_notes = COALESCE($8, resolution_notes),
           updated_at = CURRENT_TIMESTAMP
           ${resolved_at_clause}
       WHERE id = $9
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Violation not found" });
    }

    res.json({ violation: result.rows[0] });
  } catch (err) {
    console.error("Update violation error:", err);
    res.status(500).json({ error: "Failed to update violation" });
  }
});

// DELETE violation
violationsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM violations WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Violation not found" });
    }
    res.json({ message: "Violation deleted successfully", id });
  } catch (err) {
    console.error("Delete violation error:", err);
    res.status(500).json({ error: "Failed to delete violation" });
  }
});
