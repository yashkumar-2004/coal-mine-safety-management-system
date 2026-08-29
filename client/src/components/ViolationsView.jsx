import { useState } from "react";
import { CheckCircle2, Clock, Filter, Plus, Search, Trash2, X } from "./Icons.jsx";
import { createViolation, deleteViolation, updateViolation } from "../lib/api.js";

function getInitialDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

export function ViolationsView({ violations, mines, regulations, onRefresh }) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mineFilter, setMineFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    mine_id: mines[0]?.id || "",
    regulation_id: regulations[0]?.id || "",
    title: "",
    category: "Mine Safety & Ventilation",
    severity: "High",
    status: "OPEN",
    reported_date: new Date().toISOString().split("T")[0],
    due_date: getInitialDueDate(),
    description: "",
    corrective_action: "",
    preventive_action: "",
    assigned_to: "",
  });

  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "RESOLVED",
    resolution_notes: "",
    resolved_by: "Compliance Officer",
  });

  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.violation_code.toLowerCase().includes(search.toLowerCase()) ||
      v.mine_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || v.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    const matchesMine = !mineFilter || String(v.mine_id) === String(mineFilter);

    return matchesSearch && matchesSeverity && matchesStatus && matchesMine;
  });

  const handleCreateViolation = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createViolation({
        ...formData,
        mine_id: Number(formData.mine_id),
        regulation_id: formData.regulation_id ? Number(formData.regulation_id) : null,
      });
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedViolation) return;
    setIsSubmitting(true);

    try {
      await updateViolation(selectedViolation.id, statusUpdateData);
      setIsStatusModalOpen(false);
      setSelectedViolation(null);
      onRefresh();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this violation record?")) {
      try {
        await deleteViolation(id);
        if (selectedViolation?.id === id) setSelectedViolation(null);
        onRefresh();
      } catch (err) {
        alert("Failed to delete violation: " + err.message);
      }
    }
  };

  const openStatusModal = (v, e) => {
    e?.stopPropagation();
    setSelectedViolation(v);
    setStatusUpdateData({
      status: v.status === "OPEN" ? "CAPA_PENDING" : v.status === "CAPA_PENDING" ? "RESOLVED" : "VERIFIED",
      resolution_notes: v.resolution_notes || "",
      resolved_by: "Compliance Officer",
    });
    setIsStatusModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Violations &amp; Corrective Action (CAPA) Registry
          </h1>
          <p className="text-sm text-slate-500">
            Statutory non-compliance logging, root cause tracking, and remediation workflows
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Log Compliance Violation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search violations by code, title, mine name, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="CAPA_PENDING">CAPA Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="VERIFIED">Verified</option>
          </select>

          <select
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none max-w-[150px] truncate"
          >
            <option value="">All Mines</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Violations Cards Grid */}
      <div className="space-y-3">
        {filteredViolations.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No compliance violations found matching your filter criteria.
          </div>
        ) : (
          filteredViolations.map((v) => {
            const isResolved = v.status === "RESOLVED" || v.status === "VERIFIED";
            const isCritical = v.severity === "Critical";

            return (
              <div
                key={v.id}
                onClick={() => setSelectedViolation(v)}
                className={`cursor-pointer rounded-xl border p-4 shadow-xs transition hover:shadow-md ${
                  isResolved
                    ? "border-slate-200 bg-white opacity-85"
                    : isCritical
                    ? "border-rose-300 bg-rose-50/20 hover:border-rose-400"
                    : "border-slate-200 bg-white hover:border-amber-400"
                }`}
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-bold ${
                          v.severity === "Critical"
                            ? "bg-rose-100 text-rose-800"
                            : v.severity === "High"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {v.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">{v.violation_code}</span>
                      <span className="text-xs font-semibold text-slate-500">• {v.mine_name}</span>
                      {v.regulation_code && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                          {v.regulation_code}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-slate-900">{v.title}</h3>
                  </div>

                  {/* Status & Action button */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        v.status === "OPEN"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : v.status === "CAPA_PENDING"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : v.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {v.status.replace("_", " ")}
                    </span>

                    <button
                      onClick={(e) => openStatusModal(v, e)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Update Status
                    </button>

                    <button
                      onClick={(e) => handleDelete(v.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{v.description}</p>

                {/* Remediation & Meta Footer */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span>Reported: <strong>{v.reported_date}</strong></span>
                    {v.due_date && (
                      <span className="flex items-center gap-1 text-rose-600 font-medium">
                        <Clock className="h-3 w-3" /> Due: {v.due_date}
                      </span>
                    )}
                    {v.assigned_to && <span>Assigned: <strong>{v.assigned_to}</strong></span>}
                  </div>
                  {v.resolved_at && (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Resolved by {v.resolved_by} on {v.resolved_at.split("T")[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Violation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Log Non-Compliance Violation</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateViolation} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Coal Mine Site</label>
                  <select
                    value={formData.mine_id}
                    onChange={(e) => setFormData({ ...formData, mine_id: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    {mines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Statutory Regulation Link</label>
                  <select
                    value={formData.regulation_id}
                    onChange={(e) => setFormData({ ...formData, regulation_id: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500 truncate"
                  >
                    <option value="">None / Custom</option>
                    {regulations.map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.code}] {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Violation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Methane concentration elevation in Return Airway 4"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="Mine Safety &amp; Ventilation">Mine Safety &amp; Ventilation</option>
                    <option value="Air Quality">Air Quality</option>
                    <option value="Water Management">Water Management</option>
                    <option value="Strata Control">Strata Control</option>
                    <option value="Overburden &amp; Waste">Overburden &amp; Waste</option>
                    <option value="Worker Health &amp; Welfare">Worker Health &amp; Welfare</option>
                    <option value="Statutory Returns">Statutory Returns</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Breach Description &amp; Findings</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Detailed description of statutory non-compliance observed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Assigned Official / Manager</label>
                  <input
                    type="text"
                    placeholder="e.g. Mine Manager A. K. Mukherjee"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Remediation Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Corrective Action (CAPA Mandate)</label>
                <textarea
                  rows="2"
                  placeholder="Mandatory steps required to rectify the hazard..."
                  value={formData.corrective_action}
                  onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-5 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Logging..." : "Log Violation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update / Resolution Modal */}
      {isStatusModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Update Violation Lifecycle Status</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs border border-slate-200">
              <span className="font-mono font-bold text-amber-700">{selectedViolation.violation_code}</span>
              <h4 className="mt-1 font-semibold text-slate-900">{selectedViolation.title}</h4>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Target Lifecycle Status</label>
                <select
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                >
                  <option value="OPEN">OPEN (Unaddressed)</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="CAPA_PENDING">CAPA PENDING (Remediation in progress)</option>
                  <option value="RESOLVED">RESOLVED (Remediation completed)</option>
                  <option value="VERIFIED">VERIFIED (Audited &amp; closed by DGMS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Action / Resolution Remarks</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the verification results or remediation action taken..."
                  value={statusUpdateData.resolution_notes}
                  onChange={(e) =>
                    setStatusUpdateData({ ...statusUpdateData, resolution_notes: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Verified By</label>
                <input
                  type="text"
                  required
                  value={statusUpdateData.resolved_by}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, resolved_by: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-5 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
