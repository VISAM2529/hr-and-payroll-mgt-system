"use client";

import { useState } from "react";
import { useSession } from "@/context/SessionContext";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Shield,
  Loader2,
  ArrowRight,
  BarChart3,
  Users,
  Mail,
  Calendar,
  ClipboardCheck,
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

  const router = useRouter();

  const roles = [
    {
      value: "admin",
      label: "Admin",
      fullName: "System Administrator",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      usernameLabel: "Username",
      usernamePlaceholder: "Enter username",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      passwordType: "password",
      usernameIcon: User,
      passwordIcon: Lock,
    },
    {
      value: "employee",
      label: "Employee",
      fullName: "Employee Login",
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      usernameLabel: "Employee ID",
      usernamePlaceholder: "Enter Employee ID",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      passwordType: "password",
      usernameIcon: User,
      passwordIcon: Lock,
    },
    {
      value: "supervisor",
      label: "Supervisor",
      fullName: "Supervisor Login",
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      usernameLabel: "Employee ID",
      usernamePlaceholder: "Enter Employee ID",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      passwordType: "password",
      usernameIcon: User,
      passwordIcon: Lock,
    },
    {
      value: "attendance_only",
      label: "Attendance",
      fullName: "Attendance Marker",
      icon: ClipboardCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      usernameLabel: "Employee ID",
      usernamePlaceholder: "Enter Employee ID",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      passwordType: "password",
      usernameIcon: User,
      passwordIcon: Lock,
    },
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Email validation for supervisor role
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation based on role
    if (!formData.username.trim()) {
      newErrors.username = "This field is required";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "This field is required";
    }


    // Role validation
    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
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

      console.log(response);

      if (response.success) {
        toast.success("Login successful! Welcome back!");
        if (formData.role === "admin") {
          router.push("/payroll/employees");
        }
        else if (formData.role === "employee") {
          router.push("/payroll/my-payslip");
        }
        else if (formData.role === "supervisor") {
          router.push("/payroll/attendance");
        }
        else if (formData.role === "attendance_only") {
          router.push("/payroll/attendance");
        } else {
          router.push("/");
        }

      } else {
        if (response.message) {
          setErrors({ general: response.message });
          toast.error(response.message);
        } else {
          toast.error("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setErrors({ general: "Invalid credentials" });
        toast.error("Invalid username or password.");
      } else {
        setErrors({
          general:
            error.response?.data?.message || "Login failed. Please try again.",
        });
        toast.error(
          error.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit(e);
    }
  };

  const selectedRole = roles.find((r) => r.value === formData.role);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <Toaster />
      {/* Left Side */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-900 relative">
        <div className="flex flex-col justify-center px-12 py-8 text-white w-full">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  SupplyChainPro
                </h1>
                <p className="text-slate-400">Business Management Platform</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Comprehensive Business Solution
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Streamline operations with integrated payroll management and
                task coordination.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Role-Based Access Control
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Secure departmental access with optimized workflow management.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Enterprise-Grade Security
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Advanced security protocols to protect your business data.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <p className="text-slate-400 text-sm">
              Trusted by businesses worldwide for operational excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 lg:flex-none lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-6">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              SupplyChainPro
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Sign In</h2>
            <p className="text-slate-600 text-sm">
              Access your business dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block text-xs font-medium text-slate-700"
              >
                {selectedRole.usernameLabel}
              </label>
              <div className="relative flex items-center">
                {selectedRole.usernameIcon && (
                  <selectedRole.usernameIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                )}
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedRole.usernamePlaceholder}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm leading-5 focus:outline-none focus:ring-2 transition-colors ${errors.username
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                />
              </div>
              {errors.username && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Password/DOB Field */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-700"
              >
                {selectedRole.passwordLabel}
              </label>
              <div className="relative flex items-center">
                {selectedRole.passwordIcon && (
                  <selectedRole.passwordIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                )}
                <input
                  id="password"
                  name="password"
                  type={
                    formData.role === "admin"
                      ? showPassword
                        ? "text"
                        : "password"
                      : selectedRole.passwordType
                  }
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedRole.passwordPlaceholder}
                  className={`w-full pl-10 pr-11 py-2.5 border rounded-lg text-sm leading-5 focus:outline-none focus:ring-2 transition-colors ${errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                />
                {formData.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <label
                      key={role.value}
                      className={`flex items-center p-2.5 border rounded-lg cursor-pointer transition-all hover:bg-slate-50 ${isSelected
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-slate-200 bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center mr-2.5 ${isSelected ? "bg-yellow-100" : "bg-slate-100"
                          }`}
                      >
                        <Icon
                          className={`w-3 h-3 ${isSelected ? "text-yellow-600" : "text-slate-500"
                            }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium text-xs ${isSelected ? "text-yellow-800" : "text-slate-900"
                            }`}
                        >
                          {role.label}
                        </div>
                        <div className="text-xs text-slate-600">
                          {role.fullName}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.role && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center space-y-2 pt-2">
              <button
                type="button"
                className="text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                onClick={() =>
                  toast.error(
                    "Contact your system administrator for password reset"
                  )
                }
              >
                Forgot password?
              </button>
              <p className="text-xs text-slate-500">
                Contact IT support for assistance
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;