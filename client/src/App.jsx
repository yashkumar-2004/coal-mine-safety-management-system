import { useCallback, useEffect, useState } from "react";
import { AuthContainer } from "./components/Auth/AuthContainer.jsx";
import { DashboardView } from "./components/DashboardView.jsx";
import { HealthModal } from "./components/HealthModal.jsx";
import { InspectionsView } from "./components/InspectionsView.jsx";
import { MinesView } from "./components/MinesView.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { RegulationsView } from "./components/RegulationsView.jsx";
import { ReportsView } from "./components/ReportsView.jsx";
import { TelemetryView } from "./components/TelemetryView.jsx";
import { ViolationsView } from "./components/ViolationsView.jsx";
import {
  getDashboardAnalytics,
  getHealth,
  getInspections,
  getMines,
  getRegulations,
  getTelemetry,
  getViolations,
  simulateTelemetry,
} from "./lib/api.js";

// Helper to normalize role keys for internal switcher
function normalizeRole(role) {
  if (!role) return "mine_inspector";
  const lower = role.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("compliance")) return "compliance_officer";
  if (lower.includes("inspector")) return "mine_inspector";
  if (lower.includes("manager")) return "mine_manager";
  if (lower.includes("auditor")) return "auditor";
  return "mine_inspector";
}

function getInitialUser() {
  try {
    const stored = localStorage.getItem("coal_auth_user");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error("Failed to parse stored auth user:", err);
  }
  return null;
}

function App() {
  // Auth state (Frontend mock auth)
  const [currentUser, setCurrentUser] = useState(getInitialUser);

  // Active tab & role states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentRole, setCurrentRole] = useState(() =>
    normalizeRole(currentUser?.role)
  );

  // Health state (preserved from platform scaffold)
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Domain data states
  const [analytics, setAnalytics] = useState(null);
  const [mines, setMines] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [violations, setViolations] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch health check
  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const data = await getHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Fetch all domain data
  const loadAllData = useCallback(async () => {
    try {
      const [analyticsData, minesData, regsData, inspsData, violsData, teleData] =
        await Promise.all([
          getDashboardAnalytics().catch(() => null),
          getMines().catch(() => ({ mines: [] })),
          getRegulations().catch(() => ({ regulations: [] })),
          getInspections().catch(() => ({ inspections: [] })),
          getViolations().catch(() => ({ violations: [] })),
          getTelemetry().catch(() => ({ telemetry: [] })),
        ]);

      if (analyticsData) setAnalytics(analyticsData);
      if (minesData?.mines) setMines(minesData.mines);
      if (regsData?.regulations) setRegulations(regsData.regulations);
      if (inspsData?.inspections) setInspections(inspsData.inspections);
      if (violsData?.violations) setViolations(violsData.violations);
      if (teleData?.telemetry) setTelemetry(teleData.telemetry);
    } catch (err) {
      console.error("Error loading platform data:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsCheckingHealth(true);
      try {
        const data = await getHealth();
        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsCheckingHealth(false);
      }

      try {
        const [analyticsData, minesData, regsData, inspsData, violsData, teleData] =
          await Promise.all([
            getDashboardAnalytics().catch(() => null),
            getMines().catch(() => ({ mines: [] })),
            getRegulations().catch(() => ({ regulations: [] })),
            getInspections().catch(() => ({ inspections: [] })),
            getViolations().catch(() => ({ violations: [] })),
            getTelemetry().catch(() => ({ telemetry: [] })),
          ]);

        if (!cancelled) {
          if (analyticsData) setAnalytics(analyticsData);
          if (minesData?.mines) setMines(minesData.mines);
          if (regsData?.regulations) setRegulations(regsData.regulations);
          if (inspsData?.inspections) setInspections(inspsData.inspections);
          if (violsData?.violations) setViolations(violsData.violations);
          if (teleData?.telemetry) setTelemetry(teleData.telemetry);
        }
      } catch (err) {
        console.error("Error loading platform data:", err);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Login action handler
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setCurrentRole(normalizeRole(userData.role));
    try {
      localStorage.setItem("coal_auth_user", JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem("coal_token", userData.token);
      }
    } catch (err) {
      console.error("Error saving auth state:", err);
    }
    // Refresh platform data upon login
    loadAllData();
  };

  // Logout action handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("coal_auth_user");
      localStorage.removeItem("coal_token");
    } catch (err) {
      console.error("Error clearing auth state:", err);
    }
  };

  // Handler for simulating sensor readings
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await simulateTelemetry();
      await loadAllData();
    } catch (err) {
      alert("Telemetry simulation failed: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // If user is not authenticated, display Authentication flow
  if (!currentUser) {
    return <AuthContainer onLogin={handleLogin} />;
  }

  const criticalViolationsCount = violations.filter(
    (v) => v.severity === "Critical" && (v.status === "OPEN" || v.status === "CAPA_PENDING")
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        alertCount={criticalViolationsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Error notification banner if API connection fails */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between">
            <div>
              <strong>API Offline:</strong> Could not connect to backend server ({error}). Ensure the server is running on port 4000.
            </div>
            <button
              onClick={checkHealth}
              className="rounded bg-red-100 px-2 py-1 font-semibold text-red-900 hover:bg-red-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab View Router */}
        {activeTab === "dashboard" && (
          <DashboardView
            analytics={analytics}
            onNavigate={setActiveTab}
            onSimulateTelemetry={handleSimulate}
            isSimulating={isSimulating}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "mines" && (
          <MinesView mines={mines} onRefresh={loadAllData} />
        )}

        {activeTab === "regulations" && (
          <RegulationsView regulations={regulations} onRefresh={loadAllData} />
        )}

        {activeTab === "inspections" && (
          <InspectionsView inspections={inspections} mines={mines} onRefresh={loadAllData} />
        )}

        {activeTab === "violations" && (
          <ViolationsView
            violations={violations}
            mines={mines}
            regulations={regulations}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "telemetry" && (
          <TelemetryView telemetry={telemetry} mines={mines} onRefresh={loadAllData} />
        )}

        {activeTab === "reports" && (
          <ReportsView analytics={analytics} mines={mines} violations={violations} />
        )}

        {activeTab === "health" && (
          <HealthModal
            health={health}
            error={error}
            onRefresh={checkHealth}
            isChecking={isCheckingHealth}
          />
        )}
      </main>

      {/* Platform Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Coal Mine Smart Governance &amp; Compliance Monitoring Platform • Phase 1
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            API: {health?.status === "ok" ? "Online" : "Connecting..."} | DB: {health?.database}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
