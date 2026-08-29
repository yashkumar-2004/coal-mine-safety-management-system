import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, Lock } from "../Icons.jsx";

export function ResetPasswordView({ onNavigate }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const allReqsMet = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (!allReqsMet) {
      setError("Please satisfy all password security requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
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
      <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Password updated successfully</h3>
        <p className="mt-2 text-xs text-slate-300">
          Your statutory security credentials have been updated. You may now sign in with your new password.
        </p>
        <button
          onClick={() => onNavigate("login")}
          className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer transition shadow-lg shadow-amber-500/20"
        >
          Return to Login
        </button>
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
        <h2 className="text-2xl font-bold tracking-tight text-white">Create New Password</h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Set a secure statutory password for your CoalGuard account
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
        {/* New Password */}
        <div>
          <label className="block font-semibold text-slate-300">New Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block font-semibold text-slate-300">Confirm New Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type={showConfirm ? "text" : "password"}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Visual Password Requirements */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px] space-y-1.5">
          <span className="block font-semibold text-slate-300 text-xs mb-1">
            Password Requirements:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <div className={`flex items-center space-x-1.5 ${hasMinLength ? "text-emerald-400" : "text-slate-400"}`}>
              <Check className={`h-3.5 w-3.5 ${hasMinLength ? "text-emerald-400" : "text-slate-600"}`} />
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasUppercase ? "text-emerald-400" : "text-slate-400"}`}>
              <Check className={`h-3.5 w-3.5 ${hasUppercase ? "text-emerald-400" : "text-slate-600"}`} />
              <span>1 uppercase letter</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasNumber ? "text-emerald-400" : "text-slate-400"}`}>
              <Check className={`h-3.5 w-3.5 ${hasNumber ? "text-emerald-400" : "text-slate-600"}`} />
              <span>1 numeric digit</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasSpecial ? "text-emerald-400" : "text-slate-400"}`}>
              <Check className={`h-3.5 w-3.5 ${hasSpecial ? "text-emerald-400" : "text-slate-600"}`} />
              <span>1 special character</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !allReqsMet}
          className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-40 transition shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="font-bold text-amber-400 hover:text-amber-300 cursor-pointer underline-offset-2 hover:underline"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
