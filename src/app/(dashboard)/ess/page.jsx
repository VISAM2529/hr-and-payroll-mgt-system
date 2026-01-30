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
    Percent,
    Trophy
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useSession } from "@/context/SessionContext";
import ESSLeaveManagement from "@/components/payroll/ess-leave-management";
import ESSTalentDashboard from "@/components/talent/ess-talent-dashboard";
import ESSSalaryProjection from "@/components/payroll/ess-salary-projection";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        type="button"
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

    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [selectedFY, setSelectedFY] = useState("2025-26");
    const [previewSlip, setPreviewSlip] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData(user.id);
        } else if (!sessionLoading && !user) {
            setLoading(false);
        }
    }, [user, sessionLoading]);

    const handleDownload = (filename, content) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filename}`);
    };

    const handleDownloadPDF = (slip) => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.setTextColor(79, 70, 229);
            doc.text("PAYROLL SYSTEM", 105, 15, { align: "center" }); // Generic name if company unknown

            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(`Payslip for ${getMonthName(slip.month)} ${slip.year}`, 105, 25, { align: "center" });

            // Employee Info
            autoTable(doc, {
                startY: 35,
                head: [['Employee Details', '']],
                body: [
                    ['Name', `${employee?.personalDetails?.firstName || ''} ${employee?.personalDetails?.lastName || ''}`],
                    ['Employee ID', employee?.employeeId || 'N/A'],
                    ['Designation', employee?.jobDetails?.designation || 'N/A'],
                    ['PAN', employee?.salaryDetails?.panNumber || 'N/A']
                ],
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
            });

            // Salary Breakdown
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
                body: [
                    ['Basic Salary', `Rs. ${slip.basicSalary?.toLocaleString()}`, 'Tax Deducted (TDS)', `Rs. ${slip.taxDeduction?.toLocaleString() || 0}`],
                    ['Allowances', `Rs. ${((slip.grossSalary || 0) - (slip.basicSalary || 0))?.toLocaleString()}`, '', ''],
                    ['Gross Earnings', `Rs. ${slip.grossSalary?.toLocaleString()}`, 'Total Deductions', `Rs. ${slip.taxDeduction?.toLocaleString() || 0}`]
                ],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });

            // Net Pay
            const finalY = doc.lastAutoTable.finalY + 15;
            doc.setFillColor(240, 253, 244); // Light green bg
            doc.rect(14, finalY, 182, 15, 'F');
            doc.setFontSize(12);
            doc.setTextColor(21, 128, 61); // Green 700
            doc.setFont("helvetica", "bold");
            doc.text(`Net Payable: Rs. ${slip.netSalary?.toLocaleString()}`, 105, finalY + 10, { align: "center" });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.setFont("helvetica", "normal");
            doc.text("** This is a computer generated payslip and does not require a signature **", 105, finalY + 30, { align: "center" });

            doc.save(`Payslip_${slip.month}_${slip.year}.pdf`);
            toast.success("Payslip PDF Downloaded");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

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
    //sample
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
                                    <p className="text-indigo-100 text-sm">Disbursed for {latestPayslip ? safeFormatDate(latestPayslip.year, latestPayslip.month) : 'N/A'}</p>
                                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs">
                                        <span className="opacity-80">Gross: ₹{latestPayslip?.grossSalary?.toLocaleString() || '0'}</span>
                                        <button type="button" onClick={() => setActiveTab("payslips")} className="flex items-center gap-1 hover:underline">View Breakdown <ChevronRight className="w-3 h-3" /></button>
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
                                    <button onClick={() => setShowPolicyModal(true)} className="text-xs text-indigo-600 font-semibold hover:underline">Check Policy</button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900">December 2025 Payslip Generated</p>
                                            <p className="text-[10px] text-slate-500">December 31, 2025</p>
                                        </div>
                                        <button onClick={() => handleDownload('Payslip-Dec-2025.txt', 'Payslip Content for December 2025...')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
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
                            <Card className="p-6 bg-blue-50/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-bold text-slate-900 text-sm">Tax Season Reminder</h4>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                    Final investment proofs must be submitted by Feb 15th to avoid higher TDS in March payroll.
                                </p>
                                <button
                                    onClick={() => setActiveTab("tax")}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
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
                                        <span className="font-semibold text-slate-900 font-mono">XXXXX{String(employee?.salaryDetails?.panNumber || '').slice(-4)}</span>
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
                                <select
                                    value={selectedFY}
                                    onChange={(e) => setSelectedFY(e.target.value)}
                                    className="text-xs bg-transparent border-none focus:ring-0 pr-8"
                                >
                                    <option value="2025-26">2025-26</option>
                                    <option value="2024-25">2024-25</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {payslips.filter(slip => {
                                const fyStart = slip.month >= 4 ? slip.year : slip.year - 1;
                                const fyString = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
                                return fyString === selectedFY;
                            }).map((slip, idx) => (
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
                                            <button
                                                onClick={() => setPreviewSlip(slip)}
                                                className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-3 h-3" /> View
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPDF(slip)}
                                                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {payslips.filter(slip => {
                                const fyStart = slip.month >= 4 ? slip.year : slip.year - 1;
                                const fyString = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
                                return fyString === selectedFY;
                            }).length === 0 && (
                                    <div className="col-span-full p-12 text-center text-slate-400">
                                        <p>No payslips found for {selectedFY}</p>
                                    </div>
                                )}
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
                    <ESSSalaryProjection employee={employee} />
                )}

                {activeTab === "leaves" && (
                    <ESSLeaveManagement employeeId={user?.id} />
                )}

                {activeTab === "talent" && (
                    <ESSTalentDashboard employeeId={user?.id} />
                )}
            </div>

            {/* Policy Modal */}
            {showPolicyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Payroll Policy 2025-26</h3>
                                <p className="text-xs text-slate-500">Effective from April 1st, 2025</p>
                            </div>
                            <button onClick={() => setShowPolicyModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed">
                            <p><strong className="text-slate-900">1. Payment Cycle:</strong> Salaries are processed on the last working day of every month. Pay slips are available for download by the 1st of the following month.</p>
                            <p><strong className="text-slate-900">2. Tax Deductions (TDS):</strong> TDS is deducted based on the investment declaration submitted by the employee. You can switch between Old and New Tax Regimes at the start of the financial year.</p>
                            <p><strong className="text-slate-900">3. Reimbursements:</strong> All expense claims must be submitted by the 20th of the month to be included in that month's payout. Late submissions will be processed in the subsequent cycle.</p>
                            <p><strong className="text-slate-900">4. Leaves & LOP:</strong> Unpaid leaves (Loss of Pay) will be deducted from the gross salary on a pro-rata basis. Leave balances are updated daily.</p>
                            <p><strong className="text-slate-900">5. Variable Pay:</strong> Performance bonuses and incentives are disbursed quarterly based on the company's performance appraisal policy.</p>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 text-right">
                            <button
                                onClick={() => handleDownload('Payroll_Policy_2025.txt', 'Full Payroll Policy Content...')}
                                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors"
                            >
                                Download Policy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payslip Preview Modal */}
            {previewSlip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Payslip Preview</h3>
                                <p className="text-xs text-slate-500">{getMonthName(previewSlip.month)} {previewSlip.year}</p>
                            </div>
                            <button onClick={() => setPreviewSlip(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Net Pay</p>
                                <h2 className="text-3xl font-black text-indigo-900">₹{previewSlip.netSalary?.toLocaleString()}</h2>
                                <p className="text-[10px] text-slate-400 mt-2 font-mono">ID: {previewSlip.payslipId}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Basic Salary</span>
                                    <span className="font-bold text-slate-900">₹{previewSlip.basicSalary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Tax Deducted (TDS)</span>
                                    <span className="font-bold text-rose-600">- ₹{previewSlip.taxDeduction?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-lg border-t-2 border-slate-200">
                                    <span className="font-bold text-slate-900">Gross Earnings</span>
                                    <span className="font-bold text-slate-900">₹{((previewSlip.basicSalary || 0)).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setPreviewSlip(null)}
                                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDownloadPDF(previewSlip)}
                                className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { X } from "lucide-react"; // Late import for usage in Modal

function safeFormatDate(y, m) {
    if (!y || !m || isNaN(m)) return 'N/A';
    try {
        return format(new Date(y, m - 1, 1), 'MMMM yyyy');
    } catch (e) {
        return 'N/A';
    }
}

function getMonthName(m) {
    if (!m || isNaN(m)) return '';
    try {
        return format(new Date(2000, m - 1, 1), "MMMM");
    } catch {
        return '';
    }
}
