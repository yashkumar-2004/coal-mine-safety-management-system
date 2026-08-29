# AI-Based Smart Governance and Compliance Monitoring System for Coal Mines

A comprehensive full-stack platform for coal-mine compliance and smart governance under Directorate General of Mines Safety (DGMS), Coal Mines Regulations (CMR 2017), and MoEFCC statutory standards.

## Architecture & Layout

```
client/   React 19 + Vite + Tailwind CSS + Lucide Icons
server/   Node.js (ESM) + Express + PostgreSQL 16
```

## Phase 1 Feature Implementations

1. **Database Schema & Seeding**:
   - PostgreSQL schema with tables: `users`, `mines`, `compliance_regulations`, `inspections`, `violations`, `sensor_telemetry`, `audit_logs`.
   - Comprehensive seed dataset with realistic Indian coalfields (Jharia, Korba, Singrauli, Raniganj, Talcher), statutory standards, and initial audit logs.

2. **Core Domain APIs**:
   - `GET /api/health` — API liveness & PostgreSQL database diagnostics
   - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/users` — Role-based access control (Admin, Compliance Officer, Mine Inspector, Mine Manager, Auditor)
   - `GET|POST /api/mines`, `GET|PUT|DELETE /api/mines/:id` — Opencast & Underground mine registry and risk rating
   - `GET|POST /api/regulations`, `GET|PUT /api/regulations/:id` — DGMS & MoEFCC statutory rulebook & threshold limits
   - `GET|POST|DELETE /api/inspections` — Digital field audits with scoring and automatic violation generator
   - `GET|POST|PUT|DELETE /api/violations` — Violations & Corrective and Preventive Action (CAPA) tracking
   - `GET|POST /api/telemetry`, `POST /api/telemetry/simulate` — Real-time Methane (CH4), CO, particulate dust, noise, and water pH sensor telemetry
   - `GET /api/analytics/dashboard` — Consolidated governance KPIs, National Compliance Index, and category distributions

3. **Smart Governance Frontend Dashboard**:
   - **Executive Overview**: National Compliance Index, active mine status, critical alerts, real-time sensor cards.
   - **Mines & Sites Directory**: Filterable directory with risk tiers, MTPA capacity, and mine telemetry profiles.
   - **Statutory Rulebook**: DGMS, CMR 2017, MoEFCC, and CPCB regulation browser.
   - **Digital Audits & Inspections**: Interactive field audit checklist with live scoring and automatic non-compliance violation creation.
   - **Violations & CAPA Registry**: Lifecycle status workflow (`OPEN` -> `CAPA_PENDING` -> `RESOLVED` -> `VERIFIED`).
   - **Live Sensor Telemetry**: Continuous real-time sensor streams with live simulation toggle and statutory threshold alarms.
   - **Reports & Export**: Printable statutory compliance audit report with JSON export.
   - **System Health**: Preserved diagnostics displaying API status, database latency, and table row counts.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)

## Configuration

Secrets and hostnames come from environment files. Do not hardcode credentials.

1. Copy `.env.example` to `.env` at the repo root (used by Docker Compose).
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`.
3. Copy `client/.env.example` to `client/.env`.

`DATABASE_URL` shape:

```
postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
```

## Database

Start PostgreSQL with Docker from the repo root:

```bash
cp .env.example .env
docker compose up -d
```

Initialize/seed database tables:

```bash
cd server
npm run db:init
```

## Run

Terminal 1 — API (default http://localhost:4000):

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Terminal 2 — UI (default http://localhost:5173):

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

- `GET /api/health` — process liveness & database metrics
- The client home page provides full navigation across governance, compliance audits, violations, and real-time telemetry.
