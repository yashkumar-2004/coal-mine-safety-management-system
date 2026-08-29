import { Router } from "express";
import { pool } from "../db/pool.js";

export const inspectionsRouter = Router();

// GET all inspections with filters
inspectionsRouter.get("/", async (req, res) => {
  try {
    const { mine_id, status, category, search } = req.query;

    let query = `
      SELECT i.*, m.name as mine_name, m.code as mine_code, m.type as mine_type, m.coalfield
      FROM inspections i
      JOIN mines m ON i.mine_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (mine_id) {
      params.push(mine_id);
      query += ` AND i.mine_id = $${params.length}`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }

    if (category && category !== "ALL") {
      params.push(category);
      query += ` AND i.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (i.inspection_number ILIKE $${params.length} OR i.inspector_name ILIKE $${params.length} OR i.summary ILIKE $${params.length} OR m.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY i.inspection_date DESC, i.id DESC`;

    const result = await pool.query(query, params);
    res.json({ inspections: result.rows });
  } catch (err) {
    console.error("Fetch inspections error:", err);
    res.status(500).json({ error: "Failed to fetch inspections" });
  }
});

// GET single inspection by ID
inspectionsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, m.name as mine_name, m.code as mine_code, m.coalfield, m.state, m.operator
       FROM inspections i
       JOIN mines m ON i.mine_id = m.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inspection record not found" });
    }

    res.json({ inspection: result.rows[0] });
  } catch (err) {
    console.error("Fetch inspection error:", err);
    res.status(500).json({ error: "Failed to fetch inspection" });
  }
});

// POST submit new inspection
inspectionsRouter.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      mine_id,
      inspector_id,
      inspector_name,
      inspection_date = new Date().toISOString().split("T")[0],
      shift = "General",
      category,
      findings = [],
      summary,
      recommendations,
      auto_create_violations = true,
    } = req.body;

    if (!mine_id || !inspector_name || !category) {
      return res.status(400).json({ error: "mine_id, inspector_name, and category are required" });
    }

    await client.query("BEGIN");

    // Calculate score based on findings if available
    let calculatedScore = 100.0;
    if (Array.isArray(findings) && findings.length > 0) {
      let totalPoints = 0;
      let earnedPoints = 0;
      for (const item of findings) {
        totalPoints += 100;
        if (item.status === "compliant") {
          earnedPoints += item.score !== undefined ? Number(item.score) : 100;
        } else if (item.status === "partial") {
          earnedPoints += item.score !== undefined ? Number(item.score) : 50;
        } else {
          earnedPoints += 0;
        }
      }
      calculatedScore = totalPoints > 0 ? Number(((earnedPoints / totalPoints) * 100).toFixed(1)) : 100.0;
    }

    const countRes = await client.query("SELECT COUNT(*) FROM inspections");
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const inspection_number = `INS-${new Date().getFullYear()}-${String(count).padStart(4, "0")}`;

    const insertInspRes = await client.query(
      `INSERT INTO inspections (inspection_number, mine_id, inspector_id, inspector_name, inspection_date, shift, category, score, status, summary, findings, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'COMPLETED', $9, $10, $11)
       RETURNING *`,
      [
        inspection_number,
        mine_id,
        inspector_id || null,
        inspector_name,
        inspection_date,
        shift,
        category,
        calculatedScore,
        summary,
        JSON.stringify(findings),
        recommendations,
      ]
    );

    const createdInspection = insertInspRes.rows[0];

    // Automatically create violations for non_compliant findings
    const generatedViolations = [];
    if (auto_create_violations && Array.isArray(findings)) {
      for (const finding of findings) {
        if (finding.status === "non_compliant") {
          const vCountRes = await client.query("SELECT COUNT(*) FROM violations");
          const vCount = parseInt(vCountRes.rows[0].count, 10) + 1;
          const violation_code = `VIO-${new Date().getFullYear()}-${String(vCount).padStart(4, "0")}`;

          // Find regulation if rule_code provided
          let regulation_id = null;
          if (finding.rule_code) {
            const regRes = await client.query(
              "SELECT id FROM compliance_regulations WHERE code = $1",
              [finding.rule_code]
            );
            if (regRes.rows.length > 0) {
              regulation_id = regRes.rows[0].id;
            }
          }

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7);

          const vRes = await client.query(
            `INSERT INTO violations (violation_code, mine_id, regulation_id, inspection_id, title, category, severity, status, reported_date, due_date, description, corrective_action)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', $8, $9, $10, $11)
             RETURNING *`,
            [
              violation_code,
              mine_id,
              regulation_id,
              createdInspection.id,
              finding.item || `Compliance Breach in ${category}`,
              category,
              finding.severity || "High",
              inspection_date,
              dueDate.toISOString().split("T")[0],
              finding.notes || `Non-compliance identified during inspection ${inspection_number}`,
              recommendations || "Corrective action plan required from mine manager",
            ]
          );
          generatedViolations.push(vRes.rows[0]);
        }
      }
    }

    // Update mine compliance score to reflect recent inspection average
    await client.query(
      `UPDATE mines
       SET compliance_score = (
         SELECT ROUND(AVG(score)::numeric, 1)
         FROM (
           SELECT score FROM inspections WHERE mine_id = $1 ORDER BY inspection_date DESC LIMIT 5
         ) sub
       )
       WHERE id = $1`,
      [mine_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      inspection: createdInspection,
      generatedViolations,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create inspection error:", err);
    res.status(500).json({ error: "Failed to submit inspection" });
  } finally {
    client.release();
  }
});

// DELETE inspection
inspectionsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM inspections WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inspection not found" });
    }
    res.json({ message: "Inspection deleted successfully", id });
  } catch (err) {
    console.error("Delete inspection error:", err);
    res.status(500).json({ error: "Failed to delete inspection" });
  }
});
