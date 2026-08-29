import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Zap } from "../Icons.jsx";

export function LoginView({ onLogin, onNavigate }) {
  const [email, setEmail] = useState("inspector@coalguard.in");
  const [password, setPassword] = useState("inspector123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your work email.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    // Mock frontend auth simulation
    setTimeout(() => {
      setIsLoading(false);
      const mockUser = {
        name: email === "inspector@coalguard.in" ? "Arjun Sharma" : email.split("@")[0].replace(".", " "),
        email: email,
        role: email.includes("admin") ? "Administrator" : email.includes("manager") ? "Mine Manager" : "Mine Inspector",
        organization: "Directorate General of Mines Safety (DGMS)",
        rememberMe,
        token: "mock-jwt-token-" + Date.now(),
      };
      onLogin(mockUser);
    }, 400);
  };

  const handleQuickDemo = (roleName, demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to CoalGuard</h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Enter your statutory credentials to access the compliance governance portal
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
        {/* Email Field */}
        <div>
          <label className="block font-semibold text-slate-300">Work Email Address</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              placeholder="e.g. inspector@coalguard.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-slate-300">Password</label>
            <button
              type="button"
              onClick={() => onNavigate("forgot-password")}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer transition"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950"
            />
            <span className="text-slate-300 font-medium">Remember my session</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 transition shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          {isLoading ? "Authenticating..." : "Sign In to Governance Portal"}
        </button>
      </form>

      {/* Quick Demo Credentials Assistant */}
      <div className="mt-6 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> Quick Demo Role Switch:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => handleQuickDemo("Inspector", "inspector@coalguard.in", "inspector123")}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition text-left cursor-pointer truncate"
          >
            <strong className="block text-white">Arjun Sharma</strong>
            <span>Mine Inspector</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("Compliance", "compliance@coalguard.in", "compliance123")}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition text-left cursor-pointer truncate"
          >
            <strong className="block text-white">Priya Sundaram</strong>
            <span>Compliance Officer</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
        Don&apos;t have an enterprise account?{" "}
        <button
          type="button"
          onClick={() => onNavigate("signup")}
          className="font-bold text-amber-400 hover:text-amber-300 cursor-pointer ml-1 underline-offset-2 hover:underline"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
