import { Activity, CheckCircle2, Flame, ShieldCheck } from "../Icons.jsx";

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Left Branding Area (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/80 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-white">COALGUARD</span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                AI Smart Governance
              </span>
            </div>
            <p className="text-xs text-slate-400">DGMS &amp; MoEFCC Compliance Monitoring Platform</p>
          </div>
        </div>

        {/* Center Content / Value Proposition */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center space-x-2 rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1 text-xs text-amber-400 backdrop-blur-xs mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Coal Governance Network Active</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
            Smart Compliance. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Safer Mines.
            </span>
          </h1>

          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Centralized digital statutory oversight for Indian coalfields. Streamline shift safety audits,
            track hazardous gas telemetry in real time, and automate Corrective &amp; Preventive Actions (CAPA) under CMR 2017 &amp; MoEFCC norms.
          </p>

          {/* Key Feature Badges */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center space-x-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">DGMS Statutory Compliance</span>
                <span className="text-slate-400">Digital field checklists, strata monitoring &amp; penalty reduction</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Continuous Sensor Telemetry</span>
                <span className="text-slate-400">Live Methane (CH4), Carbon Monoxide, particulate dust &amp; pH monitoring</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Unified CAPA Lifecycle</span>
                <span className="text-slate-400">Automated violation logging, root-cause assignment &amp; resolution audits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 text-xs text-slate-500 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Ministry of Coal • DGMS Approved</span>
          <span className="font-mono text-[11px] text-slate-400">v1.0.0 Enterprise</span>
        </div>
      </div>

      {/* Right Form Container (Mobile & Desktop) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-slate-900/90 relative overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center space-x-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white">COALGUARD</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                AI Smart Governance
              </span>
            </div>
            <p className="text-[11px] text-slate-400">DGMS &amp; MoEFCC Compliance Platform</p>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
