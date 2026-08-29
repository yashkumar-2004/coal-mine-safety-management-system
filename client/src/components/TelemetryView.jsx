import { useEffect, useRef, useState } from "react";
import { Activity, Droplets, Flame, Pause, Play, Plus, Radio, RefreshCw, Wind, X, Zap } from "./Icons.jsx";
import { getTelemetryHistory, ingestTelemetry, simulateTelemetry } from "../lib/api.js";

export function TelemetryView({ telemetry, mines, onRefresh }) {
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [history, setHistory] = useState([]);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const [formData, setFormData] = useState({
    mine_id: mines[0]?.id || "",
    sensor_code: "SNS-TEST-01",
    location_name: "Underground Active Working Face",
    methane_ch4: 0.45,
    carbon_monoxide_co: 15.0,
    pm25: 42.0,
    pm10: 85.0,
    ambient_noise_db: 68.0,
    water_ph: 7.2,
    temperature_c: 28.5,
    humidity_pct: 75.0,
  });

  const loadHistory = async () => {
    try {
      const data = await getTelemetryHistory({ limit: 30 });
      setHistory(data.history || []);
    } catch (err) {
      console.error("Load telemetry history error:", err);
    }
  };

  // Fetch telemetry history on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        const data = await getTelemetryHistory({ limit: 30 });
        if (!cancelled) setHistory(data.history || []);
      } catch (err) {
        console.error("Load telemetry history error:", err);
      }
    }
    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-stream interval effect with constant dependency array
  useEffect(() => {
    let interval = null;
    if (isAutoStreaming) {
      interval = setInterval(async () => {
        try {
          await simulateTelemetry();
          if (onRefreshRef.current) onRefreshRef.current();
          const data = await getTelemetryHistory({ limit: 30 });
          setHistory(data.history || []);
        } catch (err) {
          console.error("Auto stream error:", err);
        }
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoStreaming]);

  const handleManualIngest = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await ingestTelemetry({
        ...formData,
        mine_id: Number(formData.mine_id),
        methane_ch4: Number(formData.methane_ch4),
        carbon_monoxide_co: Number(formData.carbon_monoxide_co),
        pm25: Number(formData.pm25),
        pm10: Number(formData.pm10),
        ambient_noise_db: Number(formData.ambient_noise_db),
        water_ph: Number(formData.water_ph),
        temperature_c: Number(formData.temperature_c),
        humidity_pct: Number(formData.humidity_pct),
      });
      setIsIngestModalOpen(false);
      if (onRefreshRef.current) onRefreshRef.current();
      loadHistory();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSingleSimulation = async () => {
    try {
      await simulateTelemetry();
      if (onRefreshRef.current) onRefreshRef.current();
      loadHistory();
    } catch (err) {
      alert("Simulation failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="h-6 w-6 text-amber-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Live Pit Environmental &amp; Gas Telemetry
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Real-time sensory telemetry tracking Methane (CH4), CO, particulate dust, noise, and pit effluent water pH
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoStreaming(!isAutoStreaming)}
            className={`inline-flex items-center space-x-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer ${
              isAutoStreaming
                ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isAutoStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isAutoStreaming ? "Pause Live Stream" : "Start Live Stream"}</span>
          </button>

          <button
            onClick={triggerSingleSimulation}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span>Trigger Pulse</span>
          </button>

          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Manual Sensor Ingest</span>
          </button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {telemetry.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-slate-500">
            No sensor telemetry records available. Click &quot;Trigger Pulse&quot; to generate telemetry.
          </div>
        ) : (
          telemetry.map((sensor) => {
            const isCritical = sensor.status === "CRITICAL_ALERT";
            const isWarning = sensor.status === "WARNING";

            return (
              <div
                key={sensor.id}
                className={`rounded-xl border p-5 shadow-xs transition ${
                  isCritical
                    ? "border-rose-300 bg-rose-50/40 shadow-rose-100"
                    : isWarning
                    ? "border-amber-300 bg-amber-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{sensor.sensor_code}</span>
                    <h3 className="mt-0.5 text-base font-bold text-slate-900">{sensor.mine_name}</h3>
                    <p className="text-xs text-slate-500">{sensor.location_name}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isCritical
                        ? "bg-rose-200 text-rose-900 animate-pulse"
                        : isWarning
                        ? "bg-amber-200 text-amber-900"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>

                {/* Sensor Readings Matrix */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                  {/* Methane */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-600" /> Methane (CH4)
                      </span>
                      <span className="text-[10px] text-slate-400">&lt;0.75%</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span
                        className={`text-base font-bold ${
                          sensor.methane_ch4 > 0.75 ? "text-rose-600" : "text-slate-900"
                        }`}
                      >
                        {sensor.methane_ch4}% vol
                      </span>
                    </div>
                  </div>

                  {/* Carbon Monoxide */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Wind className="h-3 w-3 text-blue-600" /> Carbon Monoxide
                      </span>
                      <span className="text-[10px] text-slate-400">&lt;50 ppm</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span
                        className={`text-base font-bold ${
                          sensor.carbon_monoxide_co > 30 ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {sensor.carbon_monoxide_co} ppm
                      </span>
                    </div>
                  </div>

                  {/* PM10 Dust */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Particulates (PM10)</span>
                      <span className="text-[10px] text-slate-400">&lt;100</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span
                        className={`text-base font-bold ${
                          sensor.pm10 > 100 ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {sensor.pm10} µg/m³
                      </span>
                    </div>
                  </div>

                  {/* Water pH */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-cyan-600" /> Effluent pH
                      </span>
                      <span className="text-[10px] text-slate-400">6.5 - 8.5</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-900">{sensor.water_ph} pH</span>
                    </div>
                  </div>
                </div>

                {/* Breach Details if any */}
                {Array.isArray(sensor.breach_details) && sensor.breach_details.length > 0 && (
                  <div className="mt-3 rounded-lg bg-rose-100/70 p-2.5 text-[11px] text-rose-900 border border-rose-200">
                    <strong className="block font-bold">Statutory Threshold Alarm:</strong>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {sensor.breach_details.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                  <span>Temp: {sensor.temperature_c}°C • Humidity: {sensor.humidity_pct}%</span>
                  <span>Recorded: {new Date(sensor.recorded_at).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Historical Telemetry Stream Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Telemetry Ingest Stream</h3>
          </div>
          <button
            onClick={loadHistory}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reload Stream</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Mine Site</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">CH4 (%)</th>
                <th className="py-2.5 px-3 font-semibold">CO (ppm)</th>
                <th className="py-2.5 px-3 font-semibold">PM10</th>
                <th className="py-2.5 px-3 font-semibold">Water pH</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.slice(0, 10).map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-slate-500">
                    {new Date(h.recorded_at).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">{h.mine_name}</td>
                  <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">{h.location_name}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-800">{h.methane_ch4}%</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{h.carbon_monoxide_co}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{h.pm10}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{h.water_ph}</td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        h.status === "CRITICAL_ALERT"
                          ? "bg-rose-100 text-rose-800"
                          : h.status === "WARNING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Sensor Ingest Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Manual Sensor Reading Ingest</h3>
              <button onClick={() => setIsIngestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleManualIngest} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Mine Site</label>
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
                  <label className="block font-semibold text-slate-700">Sensor Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sensor_code}
                    onChange={(e) => setFormData({ ...formData, sensor_code: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Sensor Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Underground Return Airway East Heading"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Methane CH4 (% vol)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.methane_ch4}
                    onChange={(e) => setFormData({ ...formData, methane_ch4: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Carbon Monoxide (CO ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbon_monoxide_co}
                    onChange={(e) => setFormData({ ...formData, carbon_monoxide_co: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">PM10 (µg/m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pm10}
                    onChange={(e) => setFormData({ ...formData, pm10: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Water Discharge pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.water_ph}
                    onChange={(e) => setFormData({ ...formData, water_ph: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end space-x-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Ingesting..." : "Ingest Telemetry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
