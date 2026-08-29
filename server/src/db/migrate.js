import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";
import { getSeedData } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDatabase() {
  console.log("Checking and initializing database schema...");
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  await pool.query(schemaSql);
  console.log("Database schema successfully verified.");

  // Check if seeding is needed
  const userCheck = await pool.query("SELECT COUNT(*) FROM users");
  const userCount = parseInt(userCheck.rows[0].count, 10);

  if (userCount === 0) {
    console.log("Seeding initial Coal Mine compliance data...");
    const { users, mines, regulations } = await getSeedData();

    // 1. Insert Users
    const userMap = {};
    for (const u of users) {
      const res = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, organization, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, role, email, name`,
        [u.name, u.email, u.password_hash, u.role, u.organization, u.phone]
      );
      userMap[u.role] = res.rows[0];
    }
    console.log(`Inserted ${users.length} initial users.`);

    // 2. Insert Mines
    const mineMap = {};
    for (const m of mines) {
      const res = await pool.query(
        `INSERT INTO mines (code, name, type, coalfield, state, operator, capacity_mtpa, area_sq_km, status, safety_rating, coordinates, compliance_score, manager_name, contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id, code, name`,
        [
          m.code,
          m.name,
          m.type,
          m.coalfield,
          m.state,
          m.operator,
          m.capacity_mtpa,
          m.area_sq_km,
          m.status,
          m.safety_rating,
          JSON.stringify(m.coordinates),
          m.compliance_score,
          m.manager_name,
          m.contact_phone,
        ]
      );
      mineMap[m.code] = res.rows[0];
    }
    console.log(`Inserted ${mines.length} coal mine sites.`);

    // 3. Insert Regulations
    const regMap = {};
    for (const r of regulations) {
      const res = await pool.query(
        `INSERT INTO compliance_regulations (code, title, governing_body, category, description, threshold_limit, severity_level, penalty_clause, inspection_frequency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, code, title, category, severity_level`,
        [
          r.code,
          r.title,
          r.governing_body,
          r.category,
          r.description,
          r.threshold_limit,
          r.severity_level,
          r.penalty_clause,
          r.inspection_frequency,
        ]
      );
      regMap[r.code] = res.rows[0];
    }
    console.log(`Inserted ${regulations.length} compliance regulations.`);

    // 4. Insert Sample Inspections
    const inspector = userMap["mine_inspector"] || { id: 1, name: "Vikramaditya Verma" };

    const sampleInspections = [
      {
        inspection_number: "INS-2026-JH01",
        mine_id: mineMap["MINE-JH-01"]?.id,
        inspector_id: inspector.id,
        inspector_name: inspector.name,
        inspection_date: "2026-08-20",
        shift: "Morning",
        category: "Mine Safety & Ventilation",
        score: 74.0,
        status: "COMPLETED",
        summary: "Routine DGMS Underground ventilation and toxic gas audit in Deep Seam Pit #4.",
        findings: [
          {
            rule_code: "DGMS-VENT-01",
            item: "Methane Sensor Calibration & Air Velocity in Return Airway",
            status: "non_compliant",
            score: 50,
            notes: "Return airway methane level momentarily spiked to 1.15%, exceeding 0.75% limit. Auxiliary fan #2 required impeller replacement.",
          },
          {
            rule_code: "CMR-STRATA-03",
            item: "Tell-tale extensometer & resin bolt inspection",
            status: "compliant",
            score: 95,
            notes: "Roof supports stable, tell-tale sag reading at 2.8mm within permissible 5mm envelope.",
          },
          {
            rule_code: "CMR-OHS-06",
            item: "Self-rescuer and cap-lamp compliance for shift workers",
            status: "compliant",
            score: 100,
            notes: "All 142 shift workers equipped with calibrated self-rescuers and helmets.",
          },
        ],
        recommendations: "Immediate overhaul of auxiliary ventilation fan #2 and continuous methanometer data telemetry linking with central control room.",
      },
      {
        inspection_number: "INS-2026-CG02",
        mine_id: mineMap["MINE-CG-02"]?.id,
        inspector_id: inspector.id,
        inspector_name: inspector.name,
        inspection_date: "2026-08-22",
        shift: "General",
        category: "Air Quality & Environment",
        score: 92.5,
        status: "COMPLETED",
        summary: "MoEFCC quarterly environmental audit at Gevra Mega Opencast Project.",
        findings: [
          {
            rule_code: "MOEFCC-AIR-02",
            item: "Haul road water mist cannon deployment and CAAQMS particulate check",
            status: "compliant",
            score: 90,
            notes: "Water mist cannons active along 12km main haul route. PM10 averaged 84 µg/m³ (limit 100).",
          },
          {
            rule_code: "CPCB-WATER-04",
            item: "Sedimentation pond discharge water pH and TSS analysis",
            status: "compliant",
            score: 95,
            notes: "Discharge pH is 7.4, TSS at 42 mg/L, all well within statutory norms.",
          },
          {
            rule_code: "DGMS-OB-05",
            item: "Overburden bench slope angle audit",
            status: "compliant",
            score: 92,
            notes: "Bench slope angle verified at 26.5 degrees via drone LiDAR survey.",
          },
        ],
        recommendations: "Maintain current sprinkler schedule during peak afternoon dry hours.",
      },
      {
        inspection_number: "INS-2026-MP03",
        mine_id: mineMap["MINE-MP-03"]?.id,
        inspector_id: inspector.id,
        inspector_name: inspector.name,
        inspection_date: "2026-08-24",
        shift: "Afternoon",
        category: "Overburden & Water Management",
        score: 88.0,
        status: "COMPLETED",
        summary: "Monsoon readiness and Overburden dump stability audit at Jayant Block-B.",
        findings: [
          {
            rule_code: "DGMS-OB-05",
            item: "OB dump toe drain and garland drain clearing",
            status: "compliant",
            score: 85,
            notes: "Garland drains clear; minor silt accumulation in sector 3 toe drain.",
          },
          {
            rule_code: "CPCB-WATER-04",
            item: "Oil-water separator efficiency at Heavy Earth Moving Machinery (HEMM) workshop",
            status: "compliant",
            score: 90,
            notes: "Oil traps operational; skimmer maintenance up to date.",
          },
        ],
        recommendations: "Desilt sector 3 toe drain before monsoon intensification.",
      },
    ];

    const inspectionMap = {};
    for (const insp of sampleInspections) {
      if (insp.mine_id) {
        const res = await pool.query(
          `INSERT INTO inspections (inspection_number, mine_id, inspector_id, inspector_name, inspection_date, shift, category, score, status, summary, findings, recommendations)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING id, inspection_number`,
          [
            insp.inspection_number,
            insp.mine_id,
            insp.inspector_id,
            insp.inspector_name,
            insp.inspection_date,
            insp.shift,
            insp.category,
            insp.score,
            insp.status,
            insp.summary,
            JSON.stringify(insp.findings),
            insp.recommendations,
          ]
        );
        inspectionMap[insp.inspection_number] = res.rows[0];
      }
    }
    console.log(`Inserted sample inspections.`);

    // 5. Insert Violations
    const sampleViolations = [
      {
        violation_code: "VIO-2026-001",
        mine_id: mineMap["MINE-JH-01"]?.id,
        regulation_id: regMap["DGMS-VENT-01"]?.id,
        inspection_id: inspectionMap["INS-2026-JH01"]?.id,
        title: "Auxiliary Fan Failure Causing Return Air Methane Elevation (1.15%)",
        category: "Mine Safety & Ventilation",
        severity: "Critical",
        status: "CAPA_PENDING",
        reported_date: "2026-08-20",
        due_date: "2026-08-28",
        description: "Underground Seam #4 auxiliary fan #2 experienced motor fault, reducing airway velocity below 0.3 m/s and causing CH4 concentration to touch 1.15% in return airway.",
        corrective_action: "De-energize non-flameproof machinery, evacuate panel, and install standby 55kW auxiliary fan unit.",
        preventive_action: "Implement dual-redundant power backup for underground ventilation fans and automated telemetry cut-off interlock.",
        assigned_to: "A. K. Mukherjee (Mine Manager)",
      },
      {
        violation_code: "VIO-2026-002",
        mine_id: mineMap["MINE-WB-04"]?.id,
        regulation_id: regMap["CMR-STRATA-03"]?.id,
        inspection_id: null,
        title: "Strata Support Tell-Tale Sag Alert at Incline Panel 3",
        category: "Strata Control",
        severity: "High",
        status: "UNDER_INVESTIGATION",
        reported_date: "2026-08-23",
        due_date: "2026-08-30",
        description: "Borehole extensometer #14 detected 4.2mm roof sag in heading 6 over 48 hours following blasting in adjacent seam.",
        corrective_action: "Install supplementary steel W-straps and high-tensile 22mm resin bolts at 1m spacing.",
        preventive_action: "Review blast vibration velocity and reduce maximum instantaneous charge weight.",
        assigned_to: "Debashis Banerjee (ECL Strata Specialist)",
      },
      {
        violation_code: "VIO-2026-003",
        mine_id: mineMap["MINE-CG-02"]?.id,
        regulation_id: regMap["MOEFCC-AIR-02"]?.id,
        inspection_id: null,
        title: "Crusher Hopper Fog Nozzle Malfunction - Fugitive Dust Spike",
        category: "Air Quality",
        severity: "Medium",
        status: "RESOLVED",
        reported_date: "2026-08-18",
        due_date: "2026-08-22",
        description: "Primary crusher hopper dry fog suppression line nozzle clogged by silt, leading to localized PM10 reading of 124 µg/m³.",
        corrective_action: "Replaced 6 spray nozzles and cleaned inline water filter mesh.",
        preventive_action: "Weekly backflush protocol added to mechanical shift routine.",
        assigned_to: "Suresh Chandra Patel (Mine Manager)",
        resolved_at: "2026-08-21T10:00:00Z",
        resolved_by: "Vikramaditya Verma (Inspector)",
        resolution_notes: "Post-maintenance verification confirmed PM10 reduced to 48 µg/m³. Sprinklers fully functional.",
      },
      {
        violation_code: "VIO-2026-004",
        mine_id: mineMap["MINE-OD-05"]?.id,
        regulation_id: regMap["DGMS-RETURN-07"]?.id,
        inspection_id: null,
        title: "Delayed Form II DGMS Safety Committee Monthly Filing",
        category: "Statutory Returns",
        severity: "Low",
        status: "OPEN",
        reported_date: "2026-08-15",
        due_date: "2026-08-25",
        description: "July monthly safety committee minutes and machinery inspection summary not uploaded by deadline (10th of August).",
        corrective_action: "Collate safety committee minutes and submit through DGMS portal immediately.",
        preventive_action: "Assign designated safety nodal officer with automated email alert 5 days prior to statutory due dates.",
        assigned_to: "P. K. Pradhan (MCL Safety Officer)",
      },
    ];

    for (const v of sampleViolations) {
      if (v.mine_id) {
        await pool.query(
          `INSERT INTO violations (violation_code, mine_id, regulation_id, inspection_id, title, category, severity, status, reported_date, due_date, description, corrective_action, preventive_action, assigned_to, resolved_at, resolved_by, resolution_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            v.violation_code,
            v.mine_id,
            v.regulation_id,
            v.inspection_id,
            v.title,
            v.category,
            v.severity,
            v.status,
            v.reported_date,
            v.due_date,
            v.description,
            v.corrective_action,
            v.preventive_action,
            v.assigned_to,
            v.resolved_at || null,
            v.resolved_by || null,
            v.resolution_notes || null,
          ]
        );
      }
    }
    console.log(`Inserted sample violations.`);

    // 6. Insert Sensor Telemetry Data
    const telemetryReadings = [
      {
        mine_id: mineMap["MINE-JH-01"]?.id,
        sensor_code: "SNS-JH01-UG-01",
        location_name: "Underground Deep Seam #4 Return Airway",
        methane_ch4: 0.82,
        carbon_monoxide_co: 22.4,
        pm25: 45.2,
        pm10: 88.0,
        ambient_noise_db: 68.5,
        water_ph: 7.2,
        temperature_c: 31.5,
        humidity_pct: 82.0,
        status: "WARNING",
        breach_details: ["Methane CH4 (0.82%) elevated above standard return limit 0.75%"],
      },
      {
        mine_id: mineMap["MINE-CG-02"]?.id,
        sensor_code: "SNS-CG02-HAUL-01",
        location_name: "Gevra Main Haulage Corridor Sector-4",
        methane_ch4: 0.01,
        carbon_monoxide_co: 4.5,
        pm25: 38.5,
        pm10: 76.2,
        ambient_noise_db: 72.0,
        water_ph: 7.4,
        temperature_c: 28.0,
        humidity_pct: 65.0,
        status: "NORMAL",
        breach_details: [],
      },
      {
        mine_id: mineMap["MINE-MP-03"]?.id,
        sensor_code: "SNS-MP03-CHP-01",
        location_name: "Jayant Coal Handling & Crushing Facility",
        methane_ch4: 0.02,
        carbon_monoxide_co: 6.2,
        pm25: 52.0,
        pm10: 94.5,
        ambient_noise_db: 74.2,
        water_ph: 7.1,
        temperature_c: 29.5,
        humidity_pct: 68.0,
        status: "NORMAL",
        breach_details: [],
      },
      {
        mine_id: mineMap["MINE-WB-04"]?.id,
        sensor_code: "SNS-WB04-STRATA-02",
        location_name: "Sripur Incline Heading 6 Working Face",
        methane_ch4: 0.45,
        carbon_monoxide_co: 15.0,
        pm25: 41.0,
        pm10: 82.0,
        ambient_noise_db: 65.0,
        water_ph: 6.9,
        temperature_c: 30.2,
        humidity_pct: 79.0,
        status: "NORMAL",
        breach_details: [],
      },
      {
        mine_id: mineMap["MINE-OD-05"]?.id,
        sensor_code: "SNS-OD05-ETP-01",
        location_name: "Bhubaneswari Mine Pit Water Treatment Discharge",
        methane_ch4: 0.00,
        carbon_monoxide_co: 1.2,
        pm25: 28.0,
        pm10: 58.0,
        ambient_noise_db: 58.0,
        water_ph: 7.6,
        temperature_c: 26.5,
        humidity_pct: 70.0,
        status: "NORMAL",
        breach_details: [],
      },
    ];

    for (const t of telemetryReadings) {
      if (t.mine_id) {
        await pool.query(
          `INSERT INTO sensor_telemetry (mine_id, sensor_code, location_name, methane_ch4, carbon_monoxide_co, pm25, pm10, ambient_noise_db, water_ph, temperature_c, humidity_pct, status, breach_details)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            t.mine_id,
            t.sensor_code,
            t.location_name,
            t.methane_ch4,
            t.carbon_monoxide_co,
            t.pm25,
            t.pm10,
            t.ambient_noise_db,
            t.water_ph,
            t.temperature_c,
            t.humidity_pct,
            t.status,
            JSON.stringify(t.breach_details),
          ]
        );
      }
    }
    console.log(`Inserted sensor telemetry records.`);
  } else {
    console.log(`Database already populated (${userCount} users found).`);
  }
}

// Allow standalone execution: node src/db/migrate.js
if (process.argv[1] && process.argv[1].endsWith("migrate.js")) {
  initDatabase()
    .then(() => {
      console.log("Database migration & seed complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Database migration error:", err);
      process.exit(1);
    });
}
