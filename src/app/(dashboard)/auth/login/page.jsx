"use client";

import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import {
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Loader2,
  Lock,
  Check,
  Briefcase,
  Shield,
  ClipboardCheck,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

const LoginPage = () => {
  const { login } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "employee",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  const roles = [
    {
      value: "admin",
      label: "Admin",
      usernameLabel: "Username",
      usernamePlaceholder: "Enter username",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      passwordType: "password",
      usernameIcon: Shield,
    },
    {
      value: "employee",
      label: "Employee",
      usernameLabel: "Employee ID",
      usernamePlaceholder: "Enter Employee ID",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      passwordType: "password",
      usernameIcon: User,
    },
    // {
    //   value: "supervisor",
    //   label: "Supervisor",
    //   usernameLabel: "Employee ID",
    //   usernamePlaceholder: "Enter Employee ID",
    //   passwordLabel: "Password",
    //   passwordPlaceholder: "Enter password",
    //   passwordType: "password",
    //   usernameIcon: Briefcase,
    // },
    // {
    //   value: "attendance_only",
    //   label: "Attendance",
    //   usernameLabel: "Employee ID",
    //   usernamePlaceholder: "Enter Employee ID",
    //   passwordLabel: "Password",
    //   passwordPlaceholder: "Enter password",
    //   passwordType: "password",
    //   usernameIcon: ClipboardCheck,
    // },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "This field is required";
    if (!formData.password.trim()) newErrors.password = "This field is required";
    if (!formData.role) newErrors.role = "Please select a role";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await login(
        formData.username,
        formData.password,
        formData.role
      );

      if (response.success) {
        toast.success("Login successful! Welcome back!");
        if (formData.role === "admin") router.push("/payroll/employees");
        else if (formData.role === "employee") router.push("/payroll/my-payslip");
        else if (formData.role === "supervisor") router.push("/payroll/attendance");
        else if (formData.role === "attendance_only") router.push("/payroll/attendance");
        else router.push("/");
      } else {
        const msg = response.message || "Login failed. Please try again.";
        setErrors({ general: msg });
        toast.error(msg);
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Invalid credentials or server error";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleSubmit(e);
  };

  const selectedRole = roles.find((r) => r.value === formData.role) || roles[1];
  const UsernameIcon = selectedRole.usernameIcon;

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      <Toaster position="top-center" />

      {/* Left Side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 bg-white z-10">
        <div className="max-w-md w-full mx-auto">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              {/* Simple Logo Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">HRPayroll</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Enter your {selectedRole.usernameLabel.toLowerCase()} and password to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              {roles.map(role => {
                const isActive = formData.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                    className={`flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                  >
                    {role.label}
                  </button>
                )
              })}
            </div>

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
                {selectedRole.usernameLabel}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <UsernameIcon className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedRole.usernamePlaceholder}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all duration-200 ${errors.username
                    ? "border-red-300 focus:ring-2 focus:ring-red-100 bg-red-50/30"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                    }`}
                />
              </div>
              {errors.username && <p className="text-xs text-red-600 font-medium pl-1">{errors.username}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedRole.passwordPlaceholder}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl outline-none transition-all duration-200 ${errors.password
                    ? "border-red-300 focus:ring-2 focus:ring-red-100 bg-red-50/30"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 font-medium pl-1">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                  {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => toast.success("Reset password link sent to your email!")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
            </button>



            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                Don't Have An Account?{" "}
                <button type="button" onClick={() => router.push("/auth/register")} className="text-indigo-600 font-semibold hover:underline">
                  Register Now.
                </button>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <span>Copyright © 2026 HRPayroll</span>
            <span className="cursor-pointer hover:text-slate-600">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* Right Side - Hero/Decorative Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 overflow-hidden items-center justify-center">
        {/* Background Circles/Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-xl px-8 flex flex-col h-full justify-center">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Effortlessly manage your team <br /> and operations.
            </h2>
            <p className="text-indigo-100 text-lg">
              Log in to access your CRM dashboard and manage your team from one central platform.
            </p>
          </div>

          {/* Dashboard Mockup/Visual */}
          <div className="relative w-full aspect-[16/10] bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-2xl flex flex-col gap-4 overflow-hidden">

            {/* Fake Header */}
            <div className="flex items-center justify-between">
              <div className="w-24 h-6 bg-white/20 rounded-md"></div>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                <div className="w-6 h-6 bg-white/20 rounded-full"></div>
              </div>
            </div>

            {/* Fake Content Grid */}
            <div className="grid grid-cols-3 gap-4 flex-1">
              {/* Card 1 */}
              <div className="bg-white/10 rounded-lg p-3 col-span-1 flex flex-col justify-between">
                <div className="w-8 h-8 bg-indigo-500/50 rounded-md mb-2"></div>
                <div className="space-y-2">
                  <div className="w-16 h-3 bg-white/30 rounded"></div>
                  <div className="w-20 h-5 bg-white rounded"></div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white/10 rounded-lg p-3 col-span-2 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-indigo-500/30 to-transparent"></div>
                <div className="flex items-end gap-2 h-full pb-2 px-2">
                  <div className="w-full bg-white/30 rounded-t-sm h-[40%]"></div>
                  <div className="w-full bg-white/50 rounded-t-sm h-[70%]"></div>
                  <div className="w-full bg-indigo-400 rounded-t-sm h-[50%]"></div>
                  <div className="w-full bg-white/30 rounded-t-sm h-[60%]"></div>
                  <div className="w-full bg-white/20 rounded-t-sm h-[30%]"></div>
                </div>
              </div>
              {/* Bottom Table Fake */}
              <div className="bg-white/20 rounded-lg col-span-3 p-3 space-y-2">
                <div className="w-full h-8 bg-white/10 rounded flex items-center px-2 gap-4">
                  <div className="w-4 h-4 rounded-full bg-white/30"></div>
                  <div className="w-20 h-2 bg-white/30 rounded"></div>
                  <div className="flex-1"></div>
                  <div className="w-12 h-2 bg-white/30 rounded"></div>
                </div>
                <div className="w-full h-8 bg-white/5 rounded flex items-center px-2 gap-4">
                  <div className="w-4 h-4 rounded-full bg-white/20"></div>
                  <div className="w-16 h-2 bg-white/20 rounded"></div>
                  <div className="flex-1"></div>
                  <div className="w-10 h-2 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;