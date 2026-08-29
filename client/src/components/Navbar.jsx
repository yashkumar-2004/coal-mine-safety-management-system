import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Flame,
  Layers,
  LogOut,
  Radio,
  User,
} from "./Icons.jsx";

export function Navbar({
  activeTab,
  setActiveTab,
  health,
  currentRole,
  setCurrentRole,
  alertCount,
  currentUser,
  onLogout,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Overview", icon: Layers },
    { id: "mines", label: "Mines & Sites", icon: Building2 },
    { id: "regulations", label: "Rulebook & Norms", icon: FileText },
    { id: "inspections", label: "Audits & Inspections", icon: CheckCircle2 },
    { id: "violations", label: "Violations & CAPA", icon: AlertTriangle, badge: alertCount },
    { id: "telemetry", label: "Live Telemetry", icon: Radio, pulse: true },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "health", label: "System Health", icon: Activity },
  ];

  const roles = [
    { id: "admin", label: "Admin (DGMS HQ)" },
    { id: "compliance_officer", label: "Compliance Officer" },
    { id: "mine_inspector", label: "Mine Inspector" },
    { id: "mine_manager", label: "Mine Manager" },
    { id: "auditor", label: "Statutory Auditor" },
  ];

  const userName = currentUser?.name || "Arjun Sharma";
  const userEmail = currentUser?.email || "inspector@coalguard.in";
  const userRole = currentUser?.role || "Mine Inspector";
  const userOrg = currentUser?.organization || "Directorate General of Mines Safety (DGMS)";

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-inner font-black">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">COALGUARD</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
                AI Smart Governance
              </span>
            </div>
            <p className="text-xs text-slate-400">DGMS &amp; MoEFCC Compliance Monitoring Platform</p>
          </div>
        </div>

        {/* Right side status, role switcher & profile menu */}
        <div className="flex items-center space-x-3">
          {/* DB Health Status Pill */}
          <button
            onClick={() => setActiveTab("health")}
            className="flex items-center space-x-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300 hover:border-slate-600 transition cursor-pointer"
            title="Click to view API &amp; DB diagnostics"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                health?.database === "connected" ? "bg-emerald-400 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="hidden md:inline font-mono">
              DB: {health?.database === "connected" ? "Online" : "Offline"}
            </span>
          </button>

          {/* Active Role Switcher */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-medium"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/90 pl-1.5 pr-2.5 py-1 text-xs hover:border-slate-600 transition cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                {getInitials(userName)}
              </div>
              <div className="text-left hidden lg:block">
                <span className="block font-semibold text-white text-[11px] leading-tight truncate max-w-[110px]">
                  {userName}
                </span>
                <span className="block text-[10px] text-amber-400 leading-tight">
                  {userRole}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl z-50 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold text-sm">
                      {getInitials(userName)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-white truncate">{userName}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 rounded-lg bg-slate-800/80 p-2 text-[11px] text-slate-300">
                    <span className="text-slate-400 block text-[10px]">Statutory Organization</span>
                    <strong className="text-slate-200 font-medium truncate block">{userOrg}</strong>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 text-slate-300">
                    <span>Role Access:</span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-400 text-[11px]">
                      {userRole}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-2 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="flex space-x-1 overflow-x-auto border-t border-slate-800/80 py-1.5 no-scrollbar text-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${tab.pulse && isActive ? "animate-pulse text-amber-400" : ""}`} />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="ml-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 text-xs font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
