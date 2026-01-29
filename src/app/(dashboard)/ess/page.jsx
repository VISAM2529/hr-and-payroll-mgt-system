"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    FileText,
    ShieldCheck,
    Calculator,
    Download,
    Eye,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Search,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
    PlusCircle,
    Info,
    Wallet,
    Percent
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useSession } from "@/context/SessionContext";
import ESSLeaveManagement from "@/components/payroll/ess-leave-management";
import ESSTalentDashboard from "@/components/talent/ess-talent-dashboard";
import { Trophy } from "lucide-react";

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${active
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
        {label}
    </button>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
        {children}
    </div>
);

export default function ESSDashboard() {
    const { user, loading: sessionLoading } = useSession();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [payslips, setPayslips] = useState([]);
    const [investments, setInvestments] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData(user.id);
        } else if (!sessionLoading && !user) {
            setLoading(false);
        }
    }, [user, sessionLoading]);

    const fetchDashboardData = async (employeeId) => {
        try {
            setLoading(true);
            const [empRes, slipsRes, invRes] = await Promise.all([
                fetch(`/api/payroll/employees/${employeeId}`),
                fetch(`/api/payroll/payslip?employeeId=${employeeId}`),
                fetch(`/api/payroll/investments?employeeId=${employeeId}&financialYear=2025-26`)
            ]);

            const empData = await empRes.json();
            const slipsData = await slipsRes.json();
            const invData = await invRes.json();

            setEmployee(empData);
            setPayslips(slipsData.payslips || []);
            setInvestments(invData);
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const [form80C, setForm80C] = useState({ ppf: 0, elss: 0, lic: 0, others: 0 });
    const [form80D, setForm80D] = useState({ mediclaimSelf: 0 });
    const [hraData, setHraData] = useState({ annualRent: 0, landlordPan: '' });

    useEffect(() => {
        if (investments?.sections) {
            setForm80C(investments.sections.section80C || { ppf: 0, elss: 0, lic: 0, others: 0 });
            setForm80D(investments.sections.section80D || { mediclaimSelf: 0 });
            setHraData(investments.sections.hra || { annualRent: 0, landlordPan: '' });
        }
    }, [investments]);

    if (loading || sessionLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const latestPayslip = payslips[0] || null;

    const handleSaveDeclaration = async (submit = false) => {
        try {
            const res = await fetch('/api/payroll/investments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: user?.id,
                    financialYear: "2025-26",
                    sections: {
                        section80C: form80C,
                        section80D: form80D,
                        hra: hraData
                    },
                    submit
                })
            });

            if (!res.ok) throw new Error("Failed to save");
            toast.success(submit ? "Declaration submitted for review!" : "Draft saved successfully");
            fetchDashboardData(user?.id);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Welcome back, {employee?.personalDetails?.firstName}! 👋
                        </h1>
                        <p className="text-slate-500 mt-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Your payroll and tax profile is compliant for FY 2025-26
                        </p>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <nav className="flex px-2 overflow-x-auto no-scrollbar">
                        <TabButton
                            active={activeTab === "overview"}
                            label="Overview"
                            icon={LayoutDashboard}
                            onClick={() => setActiveTab("overview")}
                        />
                        <TabButton
                            active={activeTab === "payslips"}
                            label="Payslips Gallery"
                            icon={FileText}
                            onClick={() => setActiveTab("payslips")}
                        />
                        <TabButton
                            active={activeTab === "tax"}
                            label="Tax & Investments"
                            icon={ShieldCheck}
                            onClick={() => setActiveTab("tax")}
                        />
                        <TabButton
                            active={activeTab === "projection"}
                            label="Salary Projection"
                            icon={Calculator}
                            onClick={() => setActiveTab("projection")}
                        />
                        <TabButton
                            active={activeTab === "leaves"}
                            label="My Leaves"
                            icon={Calendar}
                            onClick={() => setActiveTab("leaves")}
                        />
                        <TabButton
                            active={activeTab === "talent"}
                            label="Talent Matrix"
                            icon={Trophy}
                            onClick={() => setActiveTab("talent")}
                        />
                    </nav>
                </div>

                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Key Stats */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Card className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-indigo-100">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Latest Pay</span>
                                    </div>
                                    <h3 className="text-3xl font-black mb-1">₹{latestPayslip?.netSalary?.toLocaleString() || '0'}</h3>
                                    <p className="text-indigo-100 text-sm">Disbursed for {latestPayslip ? `${format(new Date(latestPayslip.year, latestPayslip.month - 1, 1), 'MMMM yyyy')}` : 'N/A'}</p>
                                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs">
                                        <span className="opacity-80">Gross: ₹{latestPayslip?.grossSalary?.toLocaleString() || '0'}</span>
                                        <button className="flex items-center gap-1 hover:underline">View Breakdown <ChevronRight className="w-3 h-3" /></button>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-2 bg-emerald-50 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total YTD Earnings</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-1">₹1,24,500</h3>
                                    <p className="text-slate-500 text-sm">For Financial Year 2025-26</p>
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2">
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full w-[35%]"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">35%</span>
                                    </div>
                                </Card>
                            </div>

                            {/* Recent Activity / Announcements */}
                            <Card className="p-0 overflow-hidden">
                                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">Recent Payroll Events</h3>
                                    <button className="text-xs text-indigo-600 font-semibold hover:underline">Check Policy</button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900">December 2025 Payslip Generated</p>
                                            <p className="text-[10px] text-slate-500">December 31, 2025</p>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Percent className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900">80C Declaration Approved</p>
                                            <p className="text-[10px] text-slate-500">December 28, 2025</p>
                                        </div>
                                        <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Success</div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Mini Widgets */}
                        <div className="space-y-8">
                            {/* Tax Tip Widget */}
                            <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    <h4 className="font-bold text-slate-900 text-sm">Tax Season Reminder</h4>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                    Final investment proofs must be submitted by Feb 15th to avoid higher TDS in March payroll.
                                </p>
                                <button
                                    onClick={() => setActiveTab("tax")}
                                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    Upload Proofs <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </Card>

                            {/* Profile Snapshot */}
                            <Card className="p-6">
                                <h4 className="font-bold text-slate-900 text-sm mb-4">Profile Snapshot</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Employee ID</span>
                                        <span className="font-semibold text-slate-900 font-mono">{employee?.employeeId}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Designation</span>
                                        <span className="font-semibold text-slate-900">{employee?.jobDetails?.designation}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">PAN</span>
                                        <span className="font-semibold text-slate-900 font-mono">XXXXX{employee?.salaryDetails?.panNumber?.slice(-4)}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="p-3 bg-indigo-50 rounded-xl flex items-center gap-3 text-xs text-indigo-700 font-medium">
                                        <Calendar className="w-4 h-4" />
                                        <span>Next payday: Feb 01, 2026</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "payslips" && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Historic Payslips</h2>
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
                                <select className="text-xs bg-transparent border-none focus:ring-0 pr-8">
                                    <option>2025-26</option>
                                    <option>2024-25</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {payslips.map((slip, idx) => (
                                <Card key={slip._id} className="p-0 overflow-hidden group">
                                    <div className={`h-2 ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-200'} group-hover:h-3 transition-all duration-300`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{getMonthName(slip.month)} {slip.year}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">{slip.payslipId}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-slate-900">₹{slip.netSalary?.toLocaleString()}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold">DISBURSED</p>
                                            </div>
                                        </div>
                                        <div className="py-4 border-y border-slate-50 flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Basic: ₹{slip.basicSalary?.toLocaleString()}</span>
                                            <span className="text-slate-500">Tax Paid: ₹{slip.taxDeduction || 0}</span>
                                        </div>
                                        <div className="mt-5 flex gap-2">
                                            <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                                <Eye className="w-3 h-3" /> View
                                            </button>
                                            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "tax" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Declaration for FY 2025-26</h2>
                                    <p className="text-slate-500 text-sm">Submit your tax-saving investments to reduce TDS deductions.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Form Left */}
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Section 80C <span className="text-[10px] font-medium text-slate-400 font-mono">(Max ₹1.5L)</span></h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Provider Fund (PPF)</label>
                                                <input
                                                    type="number"
                                                    value={form80C.ppf || 0}
                                                    onChange={(e) => setForm80C({ ...form80C, ppf: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">ELSS Mutual Funds</label>
                                                <input
                                                    type="number"
                                                    value={form80C.elss || 0}
                                                    onChange={(e) => setForm80C({ ...form80C, elss: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">LIC/Life Insurance</label>
                                                <input
                                                    type="number"
                                                    value={form80C.lic || 0}
                                                    onChange={(e) => setForm80C({ ...form80C, lic: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Section 80D <span className="text-[10px] font-medium text-slate-400 font-mono">(Health Ins.)</span></h4>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Mediclaim (Self/Family)</label>
                                            <input
                                                type="number"
                                                value={form80D.mediclaimSelf || 0}
                                                onChange={(e) => setForm80D({ ...form80D, mediclaimSelf: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Right */}
                                <div className="space-y-8 border-l border-slate-100 md:pl-12">
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">HRA Exemption <span className="text-[10px] font-medium text-slate-400 font-mono">(House Rent)</span></h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Annual House Rent Paid</label>
                                                <input
                                                    type="number"
                                                    value={hraData.annualRent || 0}
                                                    onChange={(e) => setHraData({ ...hraData, annualRent: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase">Landlord PAN</label>
                                                <input
                                                    type="text"
                                                    value={hraData.landlordPan || ''}
                                                    onChange={(e) => setHraData({ ...hraData, landlordPan: e.target.value })}
                                                    placeholder="ABCDE1234F"
                                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <h4 className="font-black text-slate-900 mb-4 text-center">Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Total Declared</span>
                                                <span className="font-bold text-slate-900">₹{((form80C.ppf || 0) + (form80C.elss || 0) + (form80C.lic || 0) + (form80C.others || 0) + (form80D.mediclaimSelf || 0) + (hraData.annualRent || 0)).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Status</span>
                                                <span className={`font-bold ${investments?.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>{investments?.status || 'Not Started'}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveDeclaration(false)}
                                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                                                >
                                                    Save Draft
                                                </button>
                                                <button
                                                    onClick={() => handleSaveDeclaration(true)}
                                                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Submit <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "projection" && (
                    <div className="max-w-4xl mx-auto py-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto">
                            <Calculator className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 italic">Coming Soon!</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            The "What-if" calculator is being calibrated. Soon you'll be able to simulate your Net Take-home pay based on different investment scenarios and regimes.
                        </p>
                        <div className="flex justify-center gap-4 pt-6">
                            <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-400 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" /> New Tax Regime
                            </div>
                            <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-400 flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" /> Old Tax Regime
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "leaves" && (
                    <ESSLeaveManagement employeeId={user?.id} />
                )}

                {activeTab === "talent" && (
                    <ESSTalentDashboard employeeId={user?.id} />
                )}
            </div>
        </div>
    );
}

function getMonthName(m) {
    return format(new Date(2000, m - 1, 1), "MMMM");
}
