import { useState } from "react";
import { Download, Printer } from "./Icons.jsx";

export function ReportsView({ analytics, mines, violations }) {
  const [reportDate] = useState(
    new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      title: "Statutory Coal Mine Compliance & Governance Audit Report",
      generatedAt: new Date().toISOString(),
      governingBodies: ["DGMS", "MoEFCC", "CMR 2017", "CPCB"],
      analytics,
      mines,
      violations,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coal-mine-compliance-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Statutory Compliance &amp; Governance Audit Report
          </h1>
          <p className="text-sm text-slate-500">
            Executive regulatory compliance summary for DGMS, MoEFCC, and Ministry of Coal
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                STATUTORY GOVERNANCE REPORT
              </span>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                COAL MINE COMPLIANCE &amp; SAFETY AUDIT SUMMARY
              </h2>
              <p className="text-xs text-slate-500">
                Directorate General of Mines Safety (DGMS) • Ministry of Environment, Forest &amp; Climate Change
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Generated: <strong>{reportDate}</strong></p>
              <p>Status: <strong className="text-emerald-600">OFFICIALLY COMPILED</strong></p>
              <p>Cycle: <strong>Q3 - 2026 Audit</strong></p>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs text-slate-500 block">National Compliance Index</span>
            <span className="mt-1 text-2xl font-black text-emerald-700">
              {analytics?.mines?.avg_compliance_score ?? 100}%
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs text-slate-500 block">Total Monitored Capacity</span>
            <span className="mt-1 text-2xl font-black text-slate-900">
              {analytics?.mines?.total_capacity_mtpa ?? 0} MTPA
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs text-slate-500 block">Total Active Mines</span>
            <span className="mt-1 text-2xl font-black text-slate-900">
              {analytics?.mines?.total_mines ?? 0}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs text-slate-500 block">Active Critical Breaches</span>
            <span className="mt-1 text-2xl font-black text-rose-600">
              {analytics?.violations?.critical_violations ?? 0}
            </span>
          </div>
        </div>

        {/* Mines Breakdown Table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Mine Site Compliance &amp; Risk Performance
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Mine Code</th>
                  <th className="py-2.5 px-3">Mine Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Coalfield / State</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">DGMS Tier</th>
                  <th className="py-2.5 px-3 text-right">Compliance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mines.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{m.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{m.type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.coalfield}, {m.state}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.operator}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Tier-{m.safety_rating}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{m.compliance_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Statutory Action Items (CAPA) */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Pending Corrective &amp; Preventive Actions (CAPA)
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Mine</th>
                  <th className="py-2.5 px-3">Non-Compliance Issue</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {violations
                  .filter((v) => v.status !== "RESOLVED" && v.status !== "VERIFIED")
                  .map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">{v.violation_code}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{v.mine_name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{v.title}</td>
                      <td className="py-2.5 px-3 font-bold text-rose-700">{v.severity}</td>
                      <td className="py-2.5 px-3 text-slate-800">{v.status}</td>
                      <td className="py-2.5 px-3 text-slate-600">{v.due_date || "Immediate"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Declaration */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p className="leading-relaxed">
            This digital report is automatically consolidated from field inspection records, digital mine checklists,
            and CAAQMS sensor telemetry under Section 22 of the Mines Act 1952 and Coal Mines Regulations (CMR) 2017.
          </p>
          <div className="mt-6 flex justify-between items-end">
            <div>
              <p className="font-bold text-slate-800">DGMS Regional Controller / Nodal Officer</p>
              <p className="text-[11px] text-slate-400">Electronic Compliance Verification Seal</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono font-bold text-emerald-800 text-[11px]">
                AUTHENTICATED • GOVERNANCE AUDIT ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
