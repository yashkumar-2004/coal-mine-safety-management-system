import { useState } from "react";
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "../Icons.jsx";

export function SignUpView({ onNavigate, onRegistered }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "Coal India Limited (CIL)",
    role: "Mine Inspector",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid work email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization / Company is required";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Terms of Service & Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      const registeredUser = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organization: formData.organization,
      };

      // Store in local storage as registered user record
      try {
        localStorage.setItem("coal_mock_registered_user", JSON.stringify(registeredUser));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      if (onRegistered) {
        onRegistered(registeredUser);
      }

      // Auto redirect to login after 1.5s
      setTimeout(() => {
        onNavigate("login");
      }, 1500);
    }, 500);
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-white">Account Created Successfully!</h3>
        <p className="mt-2 text-xs text-slate-300">
          Your statutory access profile for <strong className="text-white">{formData.email}</strong> has been registered.
        </p>
        <div className="mt-6 rounded-xl bg-slate-900 p-3 border border-slate-800 text-xs text-slate-400">
          Redirecting to Sign In portal...
        </div>
        <button
          onClick={() => onNavigate("login")}
          className="mt-6 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer transition"
        >
          Proceed to Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create Official Account</h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Register for the DGMS &amp; MoEFCC Smart Compliance Monitoring System
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3.5 text-xs">
        {/* Full Name */}
        <div>
          <label className="block font-semibold text-slate-300">Full Name</label>
          <div className="relative mt-1">
            <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. Arjun Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-xl border bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition ${
                errors.name ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-amber-500"
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-[11px] text-rose-400">{errors.name}</p>}
        </div>

        {/* Work Email */}
        <div>
          <label className="block font-semibold text-slate-300">Work Email Address</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="email"
              placeholder="e.g. inspector@coalguard.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full rounded-xl border bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition ${
                errors.email ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-amber-500"
              }`}
            />
          </div>
          {errors.email && <p className="mt-1 text-[11px] text-rose-400">{errors.email}</p>}
        </div>

        {/* Organization & Role (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300">Organization / Agency</label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Coal India Ltd"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            {errors.organization && <p className="mt-1 text-[11px] text-rose-400">{errors.organization}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-300">Statutory Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="Mine Inspector">Mine Inspector</option>
              <option value="Compliance Officer">Compliance Officer</option>
              <option value="Mine Manager">Mine Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>

        {/* Passwords Grid (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full rounded-xl border bg-slate-900/90 pl-10 pr-9 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition ${
                  errors.password ? "border-rose-500" : "border-slate-700 focus:border-amber-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[11px] text-rose-400">{errors.password}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-300">Confirm Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full rounded-xl border bg-slate-900/90 pl-10 pr-9 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition ${
                  errors.confirmPassword ? "border-rose-500" : "border-slate-700 focus:border-amber-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-[11px] text-rose-400">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950"
            />
            <span className="text-[11px] text-slate-300 leading-tight">
              I agree to the <span className="text-amber-400 underline underline-offset-2">Terms of Service</span> and{" "}
              <span className="text-amber-400 underline underline-offset-2">Privacy Policy</span> under DGMS guidelines.
            </span>
          </label>
          {errors.agreeTerms && <p className="mt-1 text-[11px] text-rose-400">{errors.agreeTerms}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 transition shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          {isLoading ? "Creating Profile..." : "Create Account"}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-5 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
        Already have an account?{" "}
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
