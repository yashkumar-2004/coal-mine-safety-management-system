import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock, Factory, RefreshCw, ShieldAlert, ShieldCheck, Zap } from "./Icons.jsx";

export function DashboardView({ analytics, onNavigate, onSimulateTelemetry, isSimulating, onRefresh }) {
  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading governance analytics...</span>
        </div>
      </div>
    );
  }

  const { mines, violations, inspections, categories, telemetrySummary, urgentActions, recentInspections } = analytics;

  const complianceScore = Number(mines?.avg_compliance_score ?? 100);
  const scoreColor =
    complianceScore >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    complianceScore >= 75 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-rose-600 bg-rose-50 border-rose-200";

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Coal Mine Governance &amp; Compliance Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Statutory monitoring under Directorate General of Mines Safety (DGMS) &amp; MoEFCC Standards
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onSimulateTelemetry}
            disabled={isSimulating}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 transition cursor-pointer"
          >
            <Zap className={`h-3.5 w-3.5 text-amber-600 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Simulating Feed..." : "Simulate Live Sensor Feed"}</span>
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Compliance Index */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              National Compliance Index
            </span>
            <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${scoreColor}`}>
              {complianceScore}%
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{complianceScore}%</span>
            <span className="text-xs text-slate-500">across {mines?.total_mines} coalfields</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                complianceScore >= 90 ? "bg-emerald-500" : complianceScore >= 75 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>

        {/* Active Coal Mines */}
        <div
          onClick={() => onNavigate("mines")}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monitored Mines
            </span>
            <Factory className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{mines?.total_mines ?? 0}</span>
            <span className="text-xs font-medium text-emerald-600">
              ({mines?.active_mines ?? 0} Active, {mines?.high_risk_mines ?? 0} High Risk)
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Total capacity: <strong className="text-slate-700">{mines?.total_capacity_mtpa} MTPA</strong>
          </p>
        </div>

        {/* Open Violations & CAPA */}
        <div
          onClick={() => onNavigate("violations")}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Violations
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{violations?.open_violations ?? 0}</span>
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-700">
              {violations?.critical_violations ?? 0} Critical
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {violations?.high_violations ?? 0} High, {violations?.medium_violations ?? 0} Medium, {violations?.resolved_violations ?? 0} Resolved
          </p>
        </div>

        {/* Live Telemetry Health */}
        <div
          onClick={() => onNavigate("telemetry")}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live Sensor Telemetry
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {telemetrySummary?.totalMonitored ?? 0}
            </span>
            <span className="text-xs text-slate-500">pit sensor arrays active</span>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs">
            {telemetrySummary?.criticalCount > 0 ? (
              <span className="font-bold text-rose-600">
                {telemetrySummary.criticalCount} Critical Gas/Dust Alert!
              </span>
            ) : telemetrySummary?.warningCount > 0 ? (
              <span className="font-semibold text-amber-600">
                {telemetrySummary.warningCount} Sensor Warning Active
              </span>
            ) : (
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> All sensors normal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Hazard / Telemetry Monitor Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-semibold text-slate-900">
                Real-Time Pit Environmental &amp; Gas Telemetry
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Continuous monitoring of Methane (CH4), Carbon Monoxide (CO), Particulates (PM10/2.5), and Water pH
            </p>
          </div>
          <button
            onClick={() => onNavigate("telemetry")}
            className="flex items-center space-x-1 text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            <span>View Full Sensor Grid</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(telemetrySummary?.latestSensors || []).slice(0, 5).map((sensor) => {
            const isCritical = sensor.status === "CRITICAL_ALERT";
            const isWarning = sensor.status === "WARNING";
            return (
              <div
                key={sensor.id}
                className={`rounded-lg border p-3 text-xs transition ${
                  isCritical
                    ? "border-rose-300 bg-rose-50/70"
                    : isWarning
                    ? "border-amber-300 bg-amber-50/70"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="truncate text-slate-800" title={sensor.mine_name}>
                    {sensor.mine_name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      isCritical
                        ? "bg-rose-200 text-rose-800"
                        : isWarning
                        ? "bg-amber-200 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Methane (CH4):</span>
                    <strong className={sensor.methane_ch4 > 0.75 ? "text-rose-600 font-bold" : "text-slate-900"}>
                      {sensor.methane_ch4}% vol
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CO Level:</span>
                    <strong className={sensor.carbon_monoxide_co > 30 ? "text-amber-600 font-bold" : "text-slate-900"}>
                      {sensor.carbon_monoxide_co} ppm
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dust (PM10):</span>
                    <strong className={sensor.pm10 > 100 ? "text-amber-600 font-bold" : "text-slate-900"}>
                      {sensor.pm10} µg/m³
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Urgent Action Items + Statutory Category Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Urgent Action Items (2 cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              <h2 className="text-base font-semibold text-slate-900">
                High-Priority Action Items &amp; Statutory Breaches
              </h2>
            </div>
            <button
              onClick={() => onNavigate("violations")}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              View all ({violations?.open_violations ?? 0})
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {(urgentActions || []).length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No open high-priority violations. All mines meeting statutory norms.
              </p>
            ) : (
              urgentActions.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            item.severity === "Critical"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{item.violation_code}</span>
                        <span className="text-xs font-semibold text-slate-700">{item.mine_name}</span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-slate-900">{item.title}</h4>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{item.description}</p>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "OPEN"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : item.status === "CAPA_PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  {item.due_date && (
                    <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>Due by: <strong>{item.due_date}</strong></span>
                      {item.assigned_to && <span>• Assigned: <strong>{item.assigned_to}</strong></span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Compliance Breakdown (1 col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Statutory Categories
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Issue distribution across DGMS and MoEFCC regulatory areas
          </p>

          <div className="mt-4 space-y-3">
            {(categories || []).map((cat) => (
              <div key={cat.category} className="text-xs">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>{cat.category}</span>
                  <span className="font-semibold text-slate-900">
                    {cat.open_issues} open / {cat.total_issues} total
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      cat.critical_count > 0 ? "bg-rose-500" : cat.open_issues > 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (cat.total_issues > 0 ? (cat.open_issues / cat.total_issues) * 100 : 0))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <h4 className="font-semibold text-slate-900">Statutory Frameworks Enforced:</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
              <li>Coal Mines Regulations (CMR) 2017</li>
              <li>DGMS Safety Circulars &amp; Directives</li>
              <li>MoEFCC National Ambient Air Standards</li>
              <li>CPCB Mine Pit Effluent Guidelines</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Inspections Stream */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Recent Field Inspections &amp; Audit Logs
            </h2>
          </div>
          <button
            onClick={() => onNavigate("inspections")}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            View All Inspections ({inspections?.total_inspections ?? 0})
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Report #</th>
                <th className="py-2.5 px-3 font-semibold">Mine Site</th>
                <th className="py-2.5 px-3 font-semibold">Audit Category</th>
                <th className="py-2.5 px-3 font-semibold">Inspector</th>
                <th className="py-2.5 px-3 font-semibold">Date &amp; Shift</th>
                <th className="py-2.5 px-3 font-semibold text-right">Audit Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentInspections || []).map((insp) => (
                <tr key={insp.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{insp.inspection_number}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{insp.mine_name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{insp.category}</td>
                  <td className="py-2.5 px-3 text-slate-600">{insp.inspector_name}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {insp.inspection_date} ({insp.shift})
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-bold ${
                        Number(insp.score) >= 90
                          ? "bg-emerald-100 text-emerald-800"
                          : Number(insp.score) >= 75
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {insp.score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
