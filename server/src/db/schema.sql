-- Coal Mine Compliance & Governance System Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'mine_inspector',
  organization VARCHAR(255) DEFAULT 'Coal India Ltd / DGMS',
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mines (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Opencast', 'Underground', 'Mixed'
  coalfield VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  operator VARCHAR(255) NOT NULL,
  capacity_mtpa NUMERIC(10, 2) DEFAULT 0.00,
  area_sq_km NUMERIC(10, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Under Maintenance', 'High Risk', 'Inactive'
  safety_rating VARCHAR(10) DEFAULT 'A', -- 'A', 'B', 'C', 'D'
  coordinates JSONB DEFAULT '{"lat": 23.7957, "lng": 86.4304}'::jsonb,
  compliance_score NUMERIC(5, 2) DEFAULT 100.00,
  manager_name VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_regulations (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  governing_body VARCHAR(100) NOT NULL, -- 'DGMS', 'MoEFCC', 'CMR 2017', 'CPCB', 'PESO', 'Mines Act 1952'
  category VARCHAR(100) NOT NULL, -- 'Air Quality', 'Mine Safety & Ventilation', 'Water Management', 'Strata Control', 'Overburden & Waste', 'Worker Health & Welfare', 'Statutory Returns'
  description TEXT NOT NULL,
  threshold_limit VARCHAR(255),
  severity_level VARCHAR(50) DEFAULT 'High', -- 'Low', 'Medium', 'High', 'Critical'
  penalty_clause TEXT,
  inspection_frequency VARCHAR(50) DEFAULT 'Monthly', -- 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  inspection_number VARCHAR(50) UNIQUE NOT NULL,
  mine_id INTEGER REFERENCES mines(id) ON DELETE CASCADE,
  inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  inspector_name VARCHAR(255) NOT NULL,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift VARCHAR(50) DEFAULT 'General', -- 'Morning', 'Afternoon', 'Night', 'General'
  category VARCHAR(100) NOT NULL,
  score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  status VARCHAR(50) DEFAULT 'COMPLETED', -- 'COMPLETED', 'IN_PROGRESS', 'PENDING_REVIEW', 'SCHEDULED'
  summary TEXT,
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  violation_code VARCHAR(50) UNIQUE NOT NULL,
  mine_id INTEGER REFERENCES mines(id) ON DELETE CASCADE,
  regulation_id INTEGER REFERENCES compliance_regulations(id) ON DELETE SET NULL,
  inspection_id INTEGER REFERENCES inspections(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL DEFAULT 'High', -- 'Low', 'Medium', 'High', 'Critical'
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'UNDER_INVESTIGATION', 'CAPA_PENDING', 'RESOLVED', 'VERIFIED'
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  description TEXT NOT NULL,
  corrective_action TEXT,
  preventive_action TEXT,
  assigned_to VARCHAR(255),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(255),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_telemetry (
  id SERIAL PRIMARY KEY,
  mine_id INTEGER REFERENCES mines(id) ON DELETE CASCADE,
  sensor_code VARCHAR(50) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  methane_ch4 NUMERIC(6, 3) DEFAULT 0.000, -- % vol (Danger > 1.25%)
  carbon_monoxide_co NUMERIC(6, 2) DEFAULT 0.00, -- ppm (Danger > 50 ppm)
  pm25 NUMERIC(6, 2) DEFAULT 0.00, -- ug/m3 (Limit <= 60 ug/m3)
  pm10 NUMERIC(6, 2) DEFAULT 0.00, -- ug/m3 (Limit <= 100 ug/m3)
  ambient_noise_db NUMERIC(6, 2) DEFAULT 0.00, -- dB (Limit <= 75 dB)
  water_ph NUMERIC(4, 2) DEFAULT 7.00, -- pH (Limit 6.5 - 8.5)
  temperature_c NUMERIC(5, 2) DEFAULT 25.00, -- Deg C
  humidity_pct NUMERIC(5, 2) DEFAULT 60.00, -- %
  status VARCHAR(50) DEFAULT 'NORMAL', -- 'NORMAL', 'WARNING', 'CRITICAL_ALERT'
  breach_details JSONB DEFAULT '[]'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mines_status ON mines(status);
CREATE INDEX IF NOT EXISTS idx_inspections_mine_id ON inspections(mine_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_violations_mine_id ON violations(mine_id);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity);
CREATE INDEX IF NOT EXISTS idx_sensor_mine_recorded ON sensor_telemetry(mine_id, recorded_at DESC);
