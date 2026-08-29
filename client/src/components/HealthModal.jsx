import { Activity, CheckCircle2, RefreshCw, XCircle } from "./Icons.jsx";

export function HealthModal({ health, error, onRefresh, isChecking }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System &amp; Database Health Diagnostics
        </h1>
        <p className="text-sm text-slate-500">
          Infrastructure health verification, backend API status, and PostgreSQL connection pool status
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">API Health Status Check</h2>
              <p className="text-xs text-slate-500">Endpoint: GET /api/health</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isChecking}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Checking..." : "Recheck Health"}</span>
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-rose-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Could not reach the backend API</h4>
                <p className="mt-1 text-xs">{error}</p>
                <p className="mt-2 text-xs text-rose-700 font-medium">
                  Ensure the Express API server is running on port 4000 (cd server &amp;&amp; npm run dev).
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {health && !error ? (
          <div className="mt-6 space-y-6">
            {/* Health Matrix */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-400 block font-medium">Service Name</span>
                <strong className="mt-1 block text-sm font-bold text-slate-900 font-mono">
                  {health.service}
                </strong>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Online
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-400 block font-medium">PostgreSQL Database</span>
                <strong className="mt-1 block text-sm font-bold text-slate-900 font-mono">
                  {health.database}
                </strong>
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${
                    health.database === "connected" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {health.database === "connected" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Connected &amp; Synced
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" /> Disconnected
                    </>
                  )}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-400 block font-medium">API Process Uptime</span>
                <strong className="mt-1 block text-sm font-bold text-slate-900 font-mono">
                  {health.uptimeSeconds ?? 0}s
                </strong>
                <span className="mt-1 text-[11px] text-slate-500">Node.js Express runtime</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-400 block font-medium">Last Timestamp</span>
                <strong className="mt-1 block text-xs font-bold text-slate-900 font-mono truncate" title={health.timestamp}>
                  {health.timestamp}
                </strong>
                <span className="mt-1 text-[11px] text-slate-500">ISO 8601 UTC</span>
              </div>
            </div>

            {/* Database Entity Row Counts */}
            {health.counts && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Database Table Row Counts
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400 block">Registered Mines</span>
                    <strong className="text-lg font-bold text-slate-900">{health.counts.mines}</strong>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400 block">Logged Violations</span>
                    <strong className="text-lg font-bold text-slate-900">{health.counts.violations}</strong>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400 block">Field Inspections</span>
                    <strong className="text-lg font-bold text-slate-900">{health.counts.inspections}</strong>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <span className="text-xs text-slate-400 block">Statutory Regulations</span>
                    <strong className="text-lg font-bold text-slate-900">{health.counts.regulations}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
