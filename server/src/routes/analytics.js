import { Router } from "express";
import { pool } from "../db/pool.js";

export const analyticsRouter = Router();

analyticsRouter.get("/dashboard", async (_req, res) => {
  try {
    // 1. Mines Summary
    const minesRes = await pool.query(`
      SELECT
        COUNT(*)::int AS total_mines,
        COUNT(*) FILTER (WHERE status = 'Active')::int AS active_mines,
        COUNT(*) FILTER (WHERE status = 'High Risk')::int AS high_risk_mines,
        COUNT(*) FILTER (WHERE status = 'Under Maintenance')::int AS maintenance_mines,
        COALESCE(SUM(capacity_mtpa), 0)::numeric AS total_capacity_mtpa,
        ROUND(COALESCE(AVG(compliance_score), 100), 1)::numeric AS avg_compliance_score
      FROM mines
    `);

    // 2. Violations Breakdown
    const violationsRes = await pool.query(`
      SELECT
        COUNT(*)::int AS total_violations,
        COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS open_violations,
        COUNT(*) FILTER (WHERE severity = 'Critical' AND status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS critical_violations,
        COUNT(*) FILTER (WHERE severity = 'High' AND status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS high_violations,
        COUNT(*) FILTER (WHERE severity = 'Medium' AND status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS medium_violations,
        COUNT(*) FILTER (WHERE severity = 'Low' AND status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS low_violations,
        COUNT(*) FILTER (WHERE status = 'RESOLVED' OR status = 'VERIFIED')::int AS resolved_violations
      FROM violations
    `);

    // 3. Inspections Summary
    const inspectionsRes = await pool.query(`
      SELECT
        COUNT(*)::int AS total_inspections,
        ROUND(COALESCE(AVG(score), 100), 1)::numeric AS avg_inspection_score,
        COUNT(*) FILTER (WHERE inspection_date >= CURRENT_DATE - INTERVAL '30 days')::int AS inspections_last_30d
      FROM inspections
    `);

    // 4. Category-Wise Compliance / Violations Distribution
    const categoryStatsRes = await pool.query(`
      SELECT
        category,
        COUNT(*)::int AS total_issues,
        COUNT(*) FILTER (WHERE status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING'))::int AS open_issues,
        COUNT(*) FILTER (WHERE severity = 'Critical')::int AS critical_count
      FROM violations
      GROUP BY category
      ORDER BY open_issues DESC, total_issues DESC
    `);

    // 5. Recent Telemetry Alerts
    const telemetryAlertsRes = await pool.query(`
      SELECT DISTINCT ON (st.mine_id)
        st.id, st.mine_id, st.status, st.methane_ch4, st.carbon_monoxide_co, st.pm10, st.pm25, st.recorded_at, st.breach_details,
        m.name as mine_name, m.code as mine_code, m.type as mine_type
      FROM sensor_telemetry st
      JOIN mines m ON st.mine_id = m.id
      ORDER BY st.mine_id, st.recorded_at DESC
    `);

    const latestSensorStatus = telemetryAlertsRes.rows;
    const warningSensors = latestSensorStatus.filter((s) => s.status === "WARNING").length;
    const criticalSensors = latestSensorStatus.filter((s) => s.status === "CRITICAL_ALERT").length;

    // 6. Recent high-priority action items
    const urgentActionRes = await pool.query(`
      SELECT v.*, m.name as mine_name, m.code as mine_code
      FROM violations v
      JOIN mines m ON v.mine_id = m.id
      WHERE v.status IN ('OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING')
      ORDER BY CASE v.severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, v.reported_date DESC
      LIMIT 5
    `);

    // 7. Recent Inspections list
    const recentInspectionsRes = await pool.query(`
      SELECT i.*, m.name as mine_name, m.code as mine_code
      FROM inspections i
      JOIN mines m ON i.mine_id = m.id
      ORDER BY i.inspection_date DESC, i.id DESC
      LIMIT 5
    `);

    res.json({
      mines: minesRes.rows[0],
      violations: violationsRes.rows[0],
      inspections: inspectionsRes.rows[0],
      categories: categoryStatsRes.rows,
      telemetrySummary: {
        totalMonitored: latestSensorStatus.length,
        warningCount: warningSensors,
        criticalCount: criticalSensors,
        latestSensors: latestSensorStatus,
      },
      urgentActions: urgentActionRes.rows,
      recentInspections: recentInspectionsRes.rows,
    });
  } catch (err) {
    console.error("Dashboard analytics error:", err);
    res.status(500).json({ error: "Failed to generate dashboard analytics" });
  }
});
