import { useState } from "react";
import { AlertTriangle, CheckCircle2, Filter, MapPin, Plus, Search, X } from "./Icons.jsx";
import { createMine, getMineById } from "../lib/api.js";

export function MinesView({ mines, onRefresh }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMineDetail, setSelectedMineDetail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "Opencast",
    coalfield: "",
    state: "Jharkhand",
    operator: "Coal India Limited (CIL)",
    capacity_mtpa: 5.0,
    area_sq_km: 12.0,
    status: "Active",
    safety_rating: "A",
    manager_name: "",
    contact_phone: "",
  });

  const filteredMines = mines.filter((mine) => {
    const matchesSearch =
      !search ||
      mine.name.toLowerCase().includes(search.toLowerCase()) ||
      mine.code.toLowerCase().includes(search.toLowerCase()) ||
      mine.coalfield.toLowerCase().includes(search.toLowerCase()) ||
      mine.operator.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || mine.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || mine.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenDetail = async (mineId) => {
    try {
      const data = await getMineById(mineId);
      setSelectedMineDetail(data);
    } catch (err) {
      alert("Failed to load mine details: " + err.message);
    }
  };

  const handleCreateMine = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await createMine({
        ...formData,
        capacity_mtpa: Number(formData.capacity_mtpa),
        area_sq_km: Number(formData.area_sq_km),
      });
      setIsAddModalOpen(false);
      setFormData({
        code: "",
        name: "",
        type: "Opencast",
        coalfield: "",
        state: "Jharkhand",
        operator: "Coal India Limited (CIL)",
        capacity_mtpa: 5.0,
        area_sq_km: 12.0,
        status: "Active",
        safety_rating: "A",
        manager_name: "",
        contact_phone: "",
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
            Coal Mining Sites &amp; Assets Directory
          </h1>
          <p className="text-sm text-slate-500">
            Registry of active opencast and underground coal mines under statutory oversight
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Register Mine Site</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by mine name, code, operator, or coalfield..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Opencast">Opencast</option>
            <option value="Underground">Underground</option>
            <option value="Mixed">Mixed</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="High Risk">High Risk</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Mines Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredMines.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-500">
            No coal mines matching your search criteria.
          </div>
        ) : (
          filteredMines.map((mine) => {
            const score = Number(mine.compliance_score ?? 100);
            const isHighRisk = mine.status === "High Risk";
            return (
              <div
                key={mine.id}
                onClick={() => handleOpenDetail(mine.id)}
                className={`group cursor-pointer rounded-xl border p-5 shadow-xs transition hover:shadow-md ${
                  isHighRisk
                    ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
                    : "border-slate-200 bg-white hover:border-amber-400"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-500">{mine.code}</span>
                    <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                      {mine.name}
                    </h3>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      mine.safety_rating === "A"
                        ? "bg-emerald-100 text-emerald-800"
                        : mine.safety_rating === "B"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    DGMS Tier-{mine.safety_rating}
                  </span>
                </div>

                <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    {mine.coalfield}, {mine.state}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Operator: <strong className="text-slate-700">{mine.operator}</strong>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block">Type</span>
                    <span className="font-semibold text-slate-800">{mine.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Capacity</span>
                    <span className="font-semibold text-slate-800">{mine.capacity_mtpa} MTPA</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Compliance</span>
                    <span
                      className={`font-bold ${
                        score >= 90 ? "text-emerald-600" : score >= 75 ? "text-amber-600" : "text-rose-600"
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                </div>

                {mine.open_violations_count > 0 ? (
                  <div className="mt-3 flex items-center justify-between rounded-md bg-rose-100/60 px-2.5 py-1 text-xs text-rose-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      {mine.open_violations_count} Active Violations
                    </span>
                    {mine.critical_violations_count > 0 && (
                      <span className="font-bold text-rose-700">({mine.critical_violations_count} Critical)</span>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Statutory Compliant</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Mine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Register New Coal Mine Site</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateMine} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Mine Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MINE-JH-06"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Mine Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  >
                    <option value="Opencast">Opencast</option>
                    <option value="Underground">Underground</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Mine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kusmunda Mega Opencast Project"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Coalfield</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Korba Coalfield"
                    value={formData.coalfield}
                    onChange={(e) => setFormData({ ...formData, coalfield: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chhattisgarh"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Operating Subsidiary / Co</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SECL / CIL"
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Production Capacity (MTPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capacity_mtpa}
                    onChange={(e) => setFormData({ ...formData, capacity_mtpa: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. K. R. Sharma"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9xxxx xxxxx"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
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
                  {isSubmitting ? "Registering..." : "Save Mine Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mine Detail Modal */}
      {selectedMineDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-amber-600">
                    {selectedMineDetail.mine.code}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      selectedMineDetail.mine.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {selectedMineDetail.mine.status}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedMineDetail.mine.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedMineDetail.mine.coalfield} • {selectedMineDetail.mine.state} • Operator: {selectedMineDetail.mine.operator}
                </p>
              </div>
              <button
                onClick={() => setSelectedMineDetail(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block">Mining Method</span>
                <strong className="text-slate-800 text-sm">{selectedMineDetail.mine.type}</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block">Annual Capacity</span>
                <strong className="text-slate-800 text-sm">{selectedMineDetail.mine.capacity_mtpa} MTPA</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block">DGMS Safety Tier</span>
                <strong className="text-slate-800 text-sm">Rating {selectedMineDetail.mine.safety_rating}</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-400 block">Compliance Index</span>
                <strong className="text-emerald-600 text-sm font-bold">
                  {selectedMineDetail.mine.compliance_score}%
                </strong>
              </div>
            </div>

            {/* Violations in this mine */}
            <div className="mt-6">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Active Violations ({selectedMineDetail.violations.length})
              </h4>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {selectedMineDetail.violations.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No recorded violations for this mine.</p>
                ) : (
                  selectedMineDetail.violations.map((v) => (
                    <div key={v.id} className="rounded-lg border border-slate-200 p-2.5 text-xs bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{v.title}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            v.severity === "Critical" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {v.severity} • {v.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 text-[11px]">{v.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Telemetry Readings */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-900">Latest Environmental &amp; Gas Telemetry</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="py-2 px-2.5">Location</th>
                      <th className="py-2 px-2.5">CH4 (%)</th>
                      <th className="py-2 px-2.5">CO (ppm)</th>
                      <th className="py-2 px-2.5">PM10</th>
                      <th className="py-2 px-2.5">Noise dB</th>
                      <th className="py-2 px-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedMineDetail.telemetry.slice(0, 4).map((t) => (
                      <tr key={t.id}>
                        <td className="py-1.5 px-2.5 text-slate-700 truncate max-w-[150px]">{t.location_name}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-slate-900">{t.methane_ch4}%</td>
                        <td className="py-1.5 px-2.5 text-slate-700">{t.carbon_monoxide_co}</td>
                        <td className="py-1.5 px-2.5 text-slate-700">{t.pm10}</td>
                        <td className="py-1.5 px-2.5 text-slate-700">{t.ambient_noise_db}</td>
                        <td className="py-1.5 px-2.5">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              t.status === "NORMAL" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedMineDetail(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
