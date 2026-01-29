"use client";

import { useState, useMemo } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    Save,
    KeyRound,
    ShieldCheck,
    ShieldAlert,
    ShieldIcon,
    ArrowRight,
    CheckCircle2,
    Info,
    AlertCircle,
    Fingerprint,
    Zap
} from "lucide-react";
import { toast } from "react-hot-toast";

const PasswordStrengthMeter = ({ password }) => {
    const strength = useMemo(() => {
        if (!password) return 0;
        let s = 0;
        if (password.length > 6) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    }, [password]);

    const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    const colors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

    return (
        <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Password Strength</span>
                <span className={strength > 0 ? colors[strength].replace('bg-', 'text-') : ''}>{labels[strength]}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-500 ${step <= strength ? colors[strength] : 'bg-slate-200'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default function ChangePasswordPage() {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'newPassword') setTouched(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/employee/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Security credentials updated successfully!");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setTouched(false);
            } else {
                toast.error(data.error || "Failed to update password");
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8 lg:mt-10">

                {/* Security Hero Section */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 text-indigo-300">
                                Account Security Center
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight">
                                Protect Your <br />Digital Identity.
                            </h1>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto lg:mx-0">
                                Regularly updating your password is the first line of defense against unauthorized access.
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
                            <div className="relative bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col items-center">
                                <ShieldCheck className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                <div className="mt-6 text-center">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">System Status</p>
                                    <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                        Verified Secure
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Current Password */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Authorization</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-xl group-focus-within:bg-indigo-50 transition-colors">
                                                <KeyRound className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                            </div>
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className="w-full pl-16 pr-12 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none placeholder:text-slate-300"
                                                placeholder="Confirm current password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrent(!showCurrent)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                            >
                                                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 w-full opacity-50"></div>

                                    {/* New Passwords */}
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Establish New Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-xl group-focus-within:bg-indigo-50 transition-colors">
                                                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                                </div>
                                                <input
                                                    type={showNew ? "text" : "password"}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full pl-16 pr-12 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none placeholder:text-slate-300"
                                                    placeholder="Minimum 6 characters"
                                                    required
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(!showNew)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                                >
                                                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {touched && <PasswordStrengthMeter password={formData.newPassword} />}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Credentials</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-50 rounded-xl group-focus-within:bg-indigo-50 transition-colors">
                                                    <ShieldIcon className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                                                </div>
                                                <input
                                                    type={showConfirm ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full pl-16 pr-12 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none placeholder:text-slate-300"
                                                    placeholder="Match your new password"
                                                    required
                                                    minLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                                >
                                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`group w-full bg-indigo-600 text-white font-black py-5 px-8 rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 ${loading ? "opacity-70 pointer-events-none" : ""}`}
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Fingerprint className="w-5 h-5" />
                                                Secure Update
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Security Guidelines */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-indigo-50/50 rounded-[2.5rem] p-8 border border-indigo-100/50">
                            <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                Security Best Practices
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700">Unique Password</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">Avoid reusing passwords from other systems like social media or banking.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700">Complexity Counts</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">Include upper/lowercase letters, numbers, and special symbols (e.g. @, #, $).</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700">Never Share Credentials</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">Our HR team will never ask for your password via email or phone call.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 overflow-hidden relative group cursor-help">
                            <div className="absolute -right-2 -bottom-2 opacity-5 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                                <ShieldAlert className="w-32 h-32 text-slate-900" />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <Info className="w-5 h-5 text-indigo-600" />
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Need Help?</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                If you've forgotten your current password, please contact the IT support desk to initiate a recovery process.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
