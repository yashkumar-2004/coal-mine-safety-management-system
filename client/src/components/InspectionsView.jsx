import { useState } from "react";
import { ClipboardCheck, Filter, Plus, Search, Trash2, X } from "./Icons.jsx";
import { createInspection, deleteInspection } from "../lib/api.js";

const DEFAULT_CHECKLIST_TEMPLATES = {
  "Mine Safety & Ventilation": [
    { rule_code: "DGMS-VENT-01", item: "Underground Return Airway Methane (CH4) Concentration check", status: "compliant", score: 100, severity: "Critical", notes: "Airway velocity 0.45 m/s, methane level at 0.4% within limits." },
    { rule_code: "CMR-STRATA-03", item: "Roof tell-tale extensometer & resin support bolt tensioning", status: "compliant", score: 100, severity: "High", notes: "Sag recorded 2.1mm, well below 5mm critical limit." },
    { rule_code: "CMR-OHS-06", item: "Shift worker PPE (Cap lamps, safety boots, self-rescuers)", status: "compliant", score: 100, severity: "Medium", notes: "100% compliance checked at pithead muster point." },
  ],
  "Air Quality & Environment": [
    { rule_code: "MOEFCC-AIR-02", item: "Haul road water mist cannon deployment & PM10/PM2.5 monitoring", status: "compliant", score: 90, severity: "High", notes: "Continuous misting operational. PM10 within 100 ug/m3 standard." },
    { rule_code: "CPCB-WATER-04", item: "Sedimentation pond effluent pH and suspended solids discharge", status: "compliant", score: 95, severity: "High", notes: "Discharge pH 7.2, settling tanks clear." },
  ],
  "Overburden & Strata": [
    { rule_code: "DGMS-OB-05", item: "Overburden bench slope stability and factor of safety survey", status: "compliant", score: 90, severity: "High", notes: "Slope angle 27 degrees verified by laser rangefinder." },
    { rule_code: "DGMS-RETURN-07", item: "Statutory monthly safety committee report filing", status: "compliant", score: 100, severity: "Low", notes: "Form II filed on time." },
  ],
};

export function InspectionsView({ inspections, mines, onRefresh }) {
  const [search, setSearch] = useState("");
  const [mineFilter, setMineFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isConductModalOpen, setIsConductModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    mine_id: mines[0]?.id || "",
    inspector_name: "Vikramaditya Verma",
    inspection_date: new Date().toISOString().split("T")[0],
    shift: "Morning",
    category: "Mine Safety & Ventilation",
    summary: "",
    recommendations: "",
    auto_create_violations: true,
  });

  const [checklist, setChecklist] = useState(
    DEFAULT_CHECKLIST_TEMPLATES["Mine Safety & Ventilation"]
  );

  const handleCategoryChange = (newCategory) => {
    setFormData((prev) => ({ ...prev, category: newCategory }));
    setChecklist(
      DEFAULT_CHECKLIST_TEMPLATES[newCategory] || [
        { rule_code: "DGMS-VENT-01", item: "General Safety Check", status: "compliant", score: 100, severity: "High", notes: "" },
      ]
    );
  };

  const handleChecklistStatusChange = (index, newStatus) => {
    const updated = [...checklist];
    updated[index].status = newStatus;
    updated[index].score = newStatus === "compliant" ? 100 : newStatus === "partial" ? 50 : 0;
    setChecklist(updated);
  };

  const handleChecklistNotesChange = (index, notes) => {
    const updated = [...checklist];
    updated[index].notes = notes;
    setChecklist(updated);
  };

  const calculateDynamicScore = () => {
    if (checklist.length === 0) return 100;
    const total = checklist.reduce((acc, item) => acc + (Number(item.score) || 0), 0);
    return Math.round(total / checklist.length);
  };

  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch =
      !search ||
      insp.inspection_number.toLowerCase().includes(search.toLowerCase()) ||
      insp.mine_name?.toLowerCase().includes(search.toLowerCase()) ||
      insp.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
      insp.summary?.toLowerCase().includes(search.toLowerCase());

    const matchesMine = !mineFilter || String(insp.mine_id) === String(mineFilter);
    const matchesCategory = categoryFilter === "ALL" || insp.category === categoryFilter;

    return matchesSearch && matchesMine && matchesCategory;
  });

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createInspection({
        ...formData,
        mine_id: Number(formData.mine_id),
        findings: checklist,
      });
      setIsConductModalOpen(false);
      onRefresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this inspection record?")) {
      try {
        await deleteInspection(id);
        if (selectedInspection?.id === id) setSelectedInspection(null);
        onRefresh();
      } catch (err) {
        alert("Failed to delete inspection: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Digital Audits &amp; Field Inspections
          </h1>
          <p className="text-sm text-slate-500">
            DGMS statutory checklists, shift inspections, and automated compliance scoring
          </p>
        </div>
        <button
          onClick={() => setIsConductModalOpen(true)}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Conduct Field Inspection</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inspections by report #, mine, or inspector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Mine:</span>
          </div>
          <select
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none max-w-[160px] truncate"
          >
            <option value="">All Mines</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Mine Safety &amp; Ventilation">Mine Safety</option>
            <option value="Air Quality &amp; Environment">Air Quality</option>
            <option value="Overburden &amp; Strata">Overburden &amp; Strata</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">Report Code</th>
                <th className="py-3 px-4 font-semibold">Mine Site</th>
                <th className="py-3 px-4 font-semibold">Audit Category</th>
                <th className="py-3 px-4 font-semibold">Inspector</th>
                <th className="py-3 px-4 font-semibold">Date &amp; Shift</th>
                <th className="py-3 px-4 font-semibold">Findings</th>
                <th className="py-3 px-4 font-semibold">Score</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No inspection records found.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((insp) => {
                  const score = Number(insp.score);
                  const findingsCount = Array.isArray(insp.findings) ? insp.findings.length : 0;
                  const nonCompliantCount = Array.isArray(insp.findings)
                    ? insp.findings.filter((f) => f.status === "non_compliant").length
                    : 0;

                  return (
                    <tr
                      key={insp.id}
                      onClick={() => setSelectedInspection(insp)}
                      className="cursor-pointer hover:bg-slate-50/80 transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">{insp.inspection_number}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{insp.mine_name}</td>
                      <td className="py-3 px-4 text-slate-600">{insp.category}</td>
                      <td className="py-3 px-4 text-slate-600">{insp.inspector_name}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {insp.inspection_date} ({insp.shift})
                      </td>
                      <td className="py-3 px-4">
                        {nonCompliantCount > 0 ? (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-800">
                            {nonCompliantCount} Non-Compliant
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800">
                            {findingsCount} Items Passed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-2 py-0.5 font-bold ${
                            score >= 90
                              ? "bg-emerald-100 text-emerald-800"
                              : score >= 75
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => handleDelete(insp.id, e)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Delete inspection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conduct Field Inspection Modal */}
      {isConductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Conduct Field Compliance Inspection</h3>
              </div>
              <button onClick={() => setIsConductModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInspection} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-semibold text-slate-700">Target Mine Site</label>
                  <select
                    value={formData.mine_id}
                    onChange={(e) => setFormData({ ...formData, mine_id: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    {mines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Inspector Name</label>
                  <input
                    type="text"
                    required
                    value={formData.inspector_name}
                    onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Inspection Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="Morning">Morning Shift (06:00 - 14:00)</option>
                    <option value="Afternoon">Afternoon Shift (14:00 - 22:00)</option>
                    <option value="Night">Night Shift (22:00 - 06:00)</option>
                    <option value="General">General Working Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Statutory Audit Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                >
                  <option value="Mine Safety &amp; Ventilation">Mine Safety &amp; Ventilation (DGMS)</option>
                  <option value="Air Quality &amp; Environment">Air Quality &amp; Environment (MoEFCC)</option>
                  <option value="Overburden &amp; Strata">Overburden &amp; Strata Control (CMR 2017)</option>
                </select>
              </div>

              {/* Dynamic Checklist Items */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Checklist Assessment Items</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Live Score:</span>
                    <span
                      className={`rounded px-2 py-0.5 font-bold ${
                        calculateDynamicScore() >= 90
                          ? "bg-emerald-100 text-emerald-800"
                          : calculateDynamicScore() >= 75
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {calculateDynamicScore()}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {item.rule_code}
                          </span>
                          <span className="font-semibold text-slate-900">{item.item}</span>
                        </div>

                        {/* Status Radio options */}
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${idx}`}
                              checked={item.status === "compliant"}
                              onChange={() => handleChecklistStatusChange(idx, "compliant")}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-emerald-700 font-medium">Pass (100%)</span>
                          </label>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${idx}`}
                              checked={item.status === "partial"}
                              onChange={() => handleChecklistStatusChange(idx, "partial")}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-amber-700 font-medium">Partial (50%)</span>
                          </label>
                          <label className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${idx}`}
                              checked={item.status === "non_compliant"}
                              onChange={() => handleChecklistStatusChange(idx, "non_compliant")}
                              className="text-rose-600 focus:ring-rose-500"
                            />
                            <span className="text-rose-700 font-bold">Fail (0%)</span>
                          </label>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Inspector observations and telemetry evidence notes..."
                        value={item.notes}
                        onChange={(e) => handleChecklistNotesChange(idx, e.target.value)}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Executive Audit Summary</label>
                <textarea
                  rows="2"
                  placeholder="Summary of statutory findings during the shift inspection..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Directives &amp; Corrective Actions</label>
                <textarea
                  rows="2"
                  placeholder="Immediate recommendations and action requirements for mine management..."
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 rounded-lg bg-amber-50/70 p-3 border border-amber-200">
                <input
                  type="checkbox"
                  id="auto_violations"
                  checked={formData.auto_create_violations}
                  onChange={(e) => setFormData({ ...formData, auto_create_violations: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="auto_violations" className="font-semibold text-amber-900 cursor-pointer">
                  Automatically create active Violations &amp; CAPA items for failed (non-compliant) checklist findings
                </label>
              </div>

              <div className="mt-5 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsConductModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting Audit..." : "Submit Inspection Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">
                  {selectedInspection.inspection_number}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedInspection.category} Audit Report
                </h3>
                <p className="text-xs text-slate-500">
                  Mine: <strong>{selectedInspection.mine_name}</strong> • Inspector: {selectedInspection.inspector_name} • Date: {selectedInspection.inspection_date}
                </p>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Overall Compliance Rating</span>
                  <span className="text-xs text-slate-400">{selectedInspection.shift} Shift Assessment</span>
                </div>
                <div
                  className={`rounded-lg px-3 py-1 text-lg font-bold ${
                    Number(selectedInspection.score) >= 90
                      ? "bg-emerald-100 text-emerald-800"
                      : Number(selectedInspection.score) >= 75
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedInspection.score}%
                </div>
              </div>

              {selectedInspection.summary && (
                <div>
                  <h4 className="font-bold text-slate-900">Executive Summary</h4>
                  <p className="mt-1 text-slate-700 leading-relaxed">{selectedInspection.summary}</p>
                </div>
              )}

              {/* Findings */}
              {Array.isArray(selectedInspection.findings) && selectedInspection.findings.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900">Checklist Findings &amp; Telemetry Details</h4>
                  <div className="mt-2 space-y-2">
                    {selectedInspection.findings.map((f, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {f.rule_code && (
                              <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-bold">
                                {f.rule_code}
                              </span>
                            )}
                            <span className="font-semibold text-slate-900">{f.item}</span>
                          </div>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              f.status === "compliant"
                                ? "bg-emerald-100 text-emerald-800"
                                : f.status === "partial"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {f.status.replace("_", " ")}
                          </span>
                        </div>
                        {f.notes && <p className="mt-1.5 text-slate-600 text-[11px]">{f.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.recommendations && (
                <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                  <h4 className="font-bold text-amber-900">Statutory Recommendations</h4>
                  <p className="mt-1 text-amber-800 leading-relaxed">{selectedInspection.recommendations}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedInspection(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
