import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "../Icons.jsx";

export function ForgotPasswordView({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your work email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid work email address.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 450);
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Reset instructions sent</h3>
        <p className="mt-2 text-xs text-slate-300">
          Check your email (<strong className="text-white">{email}</strong>) for further instructions to reset your statutory access password.
        </p>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => onNavigate("reset-password")}
            className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer transition shadow-lg shadow-amber-500/20"
          >
            Enter New Password (Demo Flow)
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <button
        type="button"
        onClick={() => onNavigate("login")}
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 mb-4 transition cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Sign In</span>
      </button>

      <div>
        <div className="flex items-center space-x-2">
          <KeyRound className="h-5 w-5 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset your password</h2>
        </div>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          Enter your work email and we&apos;ll send instructions to reset your password.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-300">Work Email</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              placeholder="e.g. inspector@coalguard.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 transition shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          {isLoading ? "Sending Instructions..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
        Remember your password?{" "}
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="font-bold text-amber-400 hover:text-amber-300 cursor-pointer ml-1 underline-offset-2 hover:underline"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
