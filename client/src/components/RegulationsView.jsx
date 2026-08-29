import { useState } from "react";
import { Filter, Plus, Search, X } from "./Icons.jsx";
import { createRegulation } from "../lib/api.js";

export function RegulationsView({ regulations, onRefresh }) {
  const [search, setSearch] = useState("");
  const [bodyFilter, setBodyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    governing_body: "DGMS",
    category: "Mine Safety & Ventilation",
    description: "",
    threshold_limit: "",
    severity_level: "High",
    penalty_clause: "",
    inspection_frequency: "Monthly",
  });

  const filteredRegulations = regulations.filter((reg) => {
    const matchesSearch =
      !search ||
      reg.title.toLowerCase().includes(search.toLowerCase()) ||
      reg.code.toLowerCase().includes(search.toLowerCase()) ||
      reg.description.toLowerCase().includes(search.toLowerCase());

    const matchesBody = bodyFilter === "ALL" || reg.governing_body === bodyFilter;
    const matchesCategory = categoryFilter === "ALL" || reg.category === categoryFilter;

    return matchesSearch && matchesBody && matchesCategory;
  });

  const handleCreateRegulation = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createRegulation(formData);
      setIsAddModalOpen(false);
      setFormData({
        code: "",
        title: "",
        governing_body: "DGMS",
        category: "Mine Safety & Ventilation",
        description: "",
        threshold_limit: "",
        severity_level: "High",
        penalty_clause: "",
        inspection_frequency: "Monthly",
      });
      onRefresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Statutory Rulebook &amp; Compliance Norms
          </h1>
          <p className="text-sm text-slate-500">
            Official statutory regulations from DGMS, Coal Mines Regulations (CMR 2017), MoEFCC, and CPCB
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Statutory Rule</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search regulations by title, code, or clause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Body:</span>
          </div>
          <select
            value={bodyFilter}
            onChange={(e) => setBodyFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Governing Bodies</option>
            <option value="DGMS">DGMS</option>
            <option value="MoEFCC">MoEFCC</option>
            <option value="CMR 2017">CMR 2017</option>
            <option value="CPCB">CPCB</option>
            <option value="Mines Act 1952">Mines Act 1952</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Air Quality">Air Quality</option>
            <option value="Mine Safety &amp; Ventilation">Mine Safety &amp; Ventilation</option>
            <option value="Water Management">Water Management</option>
            <option value="Strata Control">Strata Control</option>
            <option value="Overburden &amp; Waste">Overburden &amp; Waste</option>
            <option value="Worker Health &amp; Welfare">Worker Health &amp; Welfare</option>
            <option value="Statutory Returns">Statutory Returns</option>
          </select>
        </div>
      </div>

      {/* Regulations Table / Cards */}
      <div className="space-y-4">
        {filteredRegulations.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No statutory regulations matching your filter criteria.
          </div>
        ) : (
          filteredRegulations.map((reg) => (
            <div
              key={reg.id}
              onClick={() => setSelectedReg(reg)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-amber-400 hover:shadow-sm"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    {reg.code}
                  </span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    {reg.governing_body}
                  </span>
                  <span className="text-xs font-medium text-slate-500">• {reg.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      reg.severity_level === "Critical"
                        ? "bg-rose-100 text-rose-800"
                        : reg.severity_level === "High"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {reg.severity_level} Severity
                  </span>
                  <span className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    Freq: {reg.inspection_frequency}
                  </span>
                </div>
              </div>

              <h3 className="mt-2 text-base font-bold text-slate-900">{reg.title}</h3>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">{reg.description}</p>

              {reg.threshold_limit && (
                <div className="mt-3 inline-flex items-center space-x-1.5 rounded bg-slate-50 px-2.5 py-1 text-xs text-slate-700 border border-slate-200">
                  <span className="font-semibold text-slate-900">Statutory Threshold:</span>
                  <span>{reg.threshold_limit}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Regulation Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-600">{selectedReg.code}</span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedReg.title}</h3>
              </div>
              <button onClick={() => setSelectedReg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Governing Body</span>
                  <strong className="text-slate-800 text-sm">{selectedReg.governing_body}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Category</span>
                  <strong className="text-slate-800 text-sm">{selectedReg.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Inspection Cycle</span>
                  <strong className="text-slate-800 text-sm">{selectedReg.inspection_frequency}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">Regulatory Requirement &amp; Description</h4>
                <p className="mt-1 leading-relaxed text-slate-700">{selectedReg.description}</p>
              </div>

              {selectedReg.threshold_limit && (
                <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200">
                  <h4 className="font-semibold text-amber-900">Permissible Statutory Threshold / Limit</h4>
                  <p className="mt-1 font-mono text-amber-800">{selectedReg.threshold_limit}</p>
                </div>
              )}

              {selectedReg.penalty_clause && (
                <div className="rounded-lg bg-rose-50/60 p-3 border border-rose-200">
                  <h4 className="font-semibold text-rose-900">Statutory Non-Compliance Penalty / Action</h4>
                  <p className="mt-1 text-rose-800">{selectedReg.penalty_clause}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReg(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Regulation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Statutory Regulation Rule</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRegulation} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Rule Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DGMS-MINE-08"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Governing Body</label>
                  <select
                    value={formData.governing_body}
                    onChange={(e) => setFormData({ ...formData, governing_body: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="DGMS">DGMS</option>
                    <option value="MoEFCC">MoEFCC</option>
                    <option value="CMR 2017">CMR 2017</option>
                    <option value="CPCB">CPCB</option>
                    <option value="PESO">PESO</option>
                    <option value="Mines Act 1952">Mines Act 1952</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haulage Road Dust Mist Suppression Norm"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="Air Quality">Air Quality</option>
                    <option value="Mine Safety &amp; Ventilation">Mine Safety &amp; Ventilation</option>
                    <option value="Water Management">Water Management</option>
                    <option value="Strata Control">Strata Control</option>
                    <option value="Overburden &amp; Waste">Overburden &amp; Waste</option>
                    <option value="Worker Health &amp; Welfare">Worker Health &amp; Welfare</option>
                    <option value="Statutory Returns">Statutory Returns</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Severity Level</label>
                  <select
                    value={formData.severity_level}
                    onChange={(e) => setFormData({ ...formData, severity_level: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Statutory Description / Clause</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed regulatory mandate..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Threshold Limit</label>
                <input
                  type="text"
                  placeholder="e.g. PM10 <= 100 µg/m³; Water pH 6.5 - 8.5"
                  value={formData.threshold_limit}
                  onChange={(e) => setFormData({ ...formData, threshold_limit: e.target.value })}
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
                  {isSubmitting ? "Saving..." : "Save Regulation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
