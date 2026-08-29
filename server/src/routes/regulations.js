import { Router } from "express";
import { pool } from "../db/pool.js";

export const regulationsRouter = Router();

// GET all compliance regulations with optional search & filter
regulationsRouter.get("/", async (req, res) => {
  try {
    const { search, category, governing_body, severity_level } = req.query;

    let query = "SELECT * FROM compliance_regulations WHERE is_active = TRUE";
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR code ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    if (category && category !== "ALL") {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (governing_body && governing_body !== "ALL") {
      params.push(governing_body);
      query += ` AND governing_body = $${params.length}`;
    }

    if (severity_level && severity_level !== "ALL") {
      params.push(severity_level);
      query += ` AND severity_level = $${params.length}`;
    }

    query += " ORDER BY code ASC";

    const result = await pool.query(query, params);
    res.json({ regulations: result.rows });
  } catch (err) {
    console.error("Fetch regulations error:", err);
    res.status(500).json({ error: "Failed to fetch regulations" });
  }
});

// GET single regulation by ID
regulationsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM compliance_regulations WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    res.json({ regulation: result.rows[0] });
  } catch (err) {
    console.error("Fetch regulation detail error:", err);
    res.status(500).json({ error: "Failed to fetch regulation details" });
  }
});

// POST create regulation
regulationsRouter.post("/", async (req, res) => {
  try {
    const {
      code,
      title,
      governing_body,
      category,
      description,
      threshold_limit,
      severity_level = "High",
      penalty_clause,
      inspection_frequency = "Monthly",
    } = req.body;

    if (!code || !title || !governing_body || !category || !description) {
      return res.status(400).json({
        error: "Code, title, governing_body, category, and description are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO compliance_regulations (code, title, governing_body, category, description, threshold_limit, severity_level, penalty_clause, inspection_frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        code.trim().toUpperCase(),
        title.trim(),
        governing_body.trim(),
        category.trim(),
        description.trim(),
        threshold_limit,
        severity_level,
        penalty_clause,
        inspection_frequency,
      ]
    );

    res.status(201).json({ regulation: result.rows[0] });
  } catch (err) {
    console.error("Create regulation error:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Regulation code already exists" });
    }
    res.status(500).json({ error: "Failed to create regulation" });
  }
});

// PUT update regulation
regulationsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      governing_body,
      category,
      description,
      threshold_limit,
      severity_level,
      penalty_clause,
      inspection_frequency,
      is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE compliance_regulations
       SET title = COALESCE($1, title),
           governing_body = COALESCE($2, governing_body),
           category = COALESCE($3, category),
           description = COALESCE($4, description),
           threshold_limit = COALESCE($5, threshold_limit),
           severity_level = COALESCE($6, severity_level),
           penalty_clause = COALESCE($7, penalty_clause),
           inspection_frequency = COALESCE($8, inspection_frequency),
           is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [
        title,
        governing_body,
        category,
        description,
        threshold_limit,
        severity_level,
        penalty_clause,
        inspection_frequency,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Regulation not found" });
    }

    res.json({ regulation: result.rows[0] });
  } catch (err) {
    console.error("Update regulation error:", err);
    res.status(500).json({ error: "Failed to update regulation" });
  }
});
