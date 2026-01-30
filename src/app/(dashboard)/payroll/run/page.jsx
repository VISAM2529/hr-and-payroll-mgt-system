"use client";

import React, { useState, useEffect } from "react";
import {
    Banknote,
    Calendar,
    Play,
    Lock,
    RotateCcw,
    Users,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    ChevronRight,
    Calculator,
    Eye
} from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const StatusBadge = ({ status }) => {
    const colors = {
        'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
        'Processing': 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
        'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Approved': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Locked': 'bg-red-100 text-red-700 border-red-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
        </span>
    );
};

export default function PayrollRunPage() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);
    const [newRunMonth, setNewRunMonth] = useState(new Date().getMonth() + 1);
    const [newRunYear, setNewRunYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [runsRes, orgsRes] = await Promise.all([
                fetch("/api/payroll/run"),
                fetch("/api/crm/organizations")
            ]);

            const runsData = await runsRes.json();
            const orgsResponse = await orgsRes.json();
            const orgsData = orgsResponse.organizations || [];

            setRuns(runsData);
            setOrganizations(orgsData);
            if (orgsData.length > 0) setSelectedOrg(orgsData[0]._id);
        } catch (error) {
            toast.error("Failed to load payroll data");
        } finally {
            setLoading(false);
        }
    };

    const initializeRun = async () => {
        if (!selectedOrg) {
            toast.error("Please select an organization first");
            return;
        }
        try {
            setIsInitializing(true);
            const res = await fetch("/api/payroll/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    month: newRunMonth,
                    year: newRunYear,
                    orgId: selectedOrg,
                    generatedBy: "66e2f79f3b8d2e1f1a9d9c33" // Placeholder Admin
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to initialize");

            toast.success("Payroll run initialized successfully");
            fetchInitialData();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsInitializing(false);
        }
    };

    const processRun = async (runId) => {
        try {
            toast.loading("Processing batch payroll...", { id: "proc" });
            const res = await fetch(`/api/payroll/run/${runId}/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ performedBy: "66e2f79f3b8d2e1f1a9d9c33" })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Processing failed");

            toast.success("Batch payroll completed!", { id: "proc" });
            fetchInitialData();
        } catch (error) {
            toast.error(error.message, { id: "proc" });
        }
    };

    const rollbackRun = async (runId) => {
        if (!confirm("Are you sure you want to rollback and delete this payroll run? This will delete all draft payslips.")) return;
        try {
            const res = await fetch(`/api/payroll/run/${runId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Rollback failed");
            toast.success("Payroll run rolled back");
            fetchInitialData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const lockRun = async (runId) => {
        try {
            const res = await fetch(`/api/payroll/run/${runId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Locked", updatedBy: "66e2f79f3b8d2e1f1a9d9c33" })
            });
            if (!res.ok) throw new Error("Lock failed");
            toast.success("Payroll locked successfully");
            fetchInitialData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getMonthName = (m) => format(new Date(2000, m - 1, 1), "MMMM");

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Banknote className="w-6 h-6" />
                            </div>
                            Payroll Batch Processing
                        </h1>
                        <p className="text-slate-500 mt-1">Initialize, calculate, and finalize monthly payroll runs</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchInitialData}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 mx-1" />
                        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="text-sm border-none focus:ring-0 px-2 py-1 bg-transparent pr-8 font-medium text-indigo-600 border-r border-slate-100"
                            >
                                <option value="" disabled>Select Organization</option>
                                {organizations.map((org) => (
                                    <option key={org._id} value={org._id}>{org.name}</option>
                                ))}
                            </select>
                            <select
                                value={newRunMonth}
                                onChange={(e) => setNewRunMonth(parseInt(e.target.value))}
                                className="text-sm border-none focus:ring-0 px-2 py-1 bg-transparent pr-8 border-r border-slate-100"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                ))}
                            </select>
                            <select
                                value={newRunYear}
                                onChange={(e) => setNewRunYear(parseInt(e.target.value))}
                                className="text-sm border-none focus:ring-0 px-2 py-1 bg-transparent pr-8"
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <button
                                onClick={initializeRun}
                                disabled={isInitializing}
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Init Run
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-500">Total Proccessed</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {runs.reduce((sum, r) => sum + (r.processedEmployees || 0), 0)}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-500">Gross Payout</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            ₹{runs[0]?.totalGrossSalary?.toLocaleString() || '0'}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Latest Run</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-500">Next Pay Date</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">01 Feb</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-yellow-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-500">Awaiting Action</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {runs.filter(r => r.status === 'Draft' || r.status === 'Completed').length}
                        </div>
                    </div>
                </div>

                {/* Runs Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Payroll Run History</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search runs..."
                                    className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 w-48 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Run Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employees</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Totals (Net)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {runs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Banknote className="w-10 h-10 text-slate-200 mb-3" />
                                                <p>No payroll runs found. Start by initializing a new run.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    runs.map((run) => (
                                        <tr key={run._id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex flex-col items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                        <span className="text-[10px] font-bold text-indigo-400 leading-none">{run.year}</span>
                                                        <span className="text-xs font-black text-indigo-700 leading-tight">{getMonthName(run.month).substring(0, 3)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{run.runId}</p>
                                                        <p className="text-[10px] text-slate-500">{run.organizationId?.name || "Global"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={run.status} />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900">{run.processedEmployees || 0}/{run.totalEmployees || "-"}</span>
                                                    {run.failedEmployeesCount > 0 && <span className="text-[10px] text-red-500">⚠ {run.failedEmployeesCount} errors</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-indigo-600">₹{(run.totalNetSalary || 0).toLocaleString()}</span>
                                                    <span className="text-[10px] text-slate-400 italic">Gross: ₹{(run.totalGrossSalary || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {run.status === 'Draft' && (
                                                        <button
                                                            onClick={() => processRun(run._id)}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 transition-transform hover:scale-105"
                                                        >
                                                            <Play className="w-3 h-3 fill-current" />
                                                            Calculate
                                                        </button>
                                                    )}
                                                    {run.status === 'Completed' && (
                                                        <>
                                                            <button
                                                                onClick={() => processRun(run._id)}
                                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                                title="Recalculate"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => lockRun(run._id)}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
                                                            >
                                                                <Lock className="w-3 h-3" />
                                                                Lock run
                                                            </button>
                                                        </>
                                                    )}
                                                    {run.status !== 'Locked' && (
                                                        <button
                                                            onClick={() => rollbackRun(run._id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete/Rollback"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Calculator className="w-6 h-6 opacity-80" />
                            <h3 className="font-bold text-lg">Next-Gen Calculation Engine</h3>
                        </div>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                            Our Workday-inspired payroll engine automatically detects attendance discrepancies, calculates state-wise Professional Tax (PT), and caps PF/ESIC contributions according to standard India compliance rules.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                Statutory Mapping
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                Retro Detecting
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            Payroll Processing Steps
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">1</div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Initialize Batch</p>
                                    <p className="text-xs text-slate-500">Pick the month and organization to start a fresh draft.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">2</div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Bulk Calculation</p>
                                    <p className="text-xs text-slate-500">The system calculates CTC to Net, including LOP and Retros.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">3</div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Review & Lock</p>
                                    <p className="text-xs text-slate-500">Verify totals and lock the run to prevent any further changes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
