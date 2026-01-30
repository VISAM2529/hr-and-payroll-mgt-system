"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp, ArrowDownRight, ArrowUpRight,
    BarChart3, PieChart, Activity, DollarSign,
    Calendar, Filter, Search, Download,
    Building2, Users, FileText, Landmark,
    CheckCircle2, AlertCircle, Clock, Loader2
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import VendorManager from "./vendor-manager";
import JournalEntryModal from "./journal-entry-modal"; // Import Modal
import ExpenseDistributionChart from "./charts/expense-distribution";
import CashFlowTrendChart from "./charts/cash-flow-trend";
import FinancialReports from "./reports/financial-reports";

export default function FinanceDashboard({ initialTab = "overview" }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false); // Modal state
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        payrollCost: 0,
        pendingPayments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch financial overview stats
        setTimeout(() => setLoading(false), 1000); // Demo loading
    }, []);

    const handleExport = async () => {
        try {
            const res = await fetch('/api/finance/ledger');
            const data = await res.json();

            if (!data.entries || data.entries.length === 0) {
                toast.error("No data to export");
                return;
            }

            // Convert to CSV
            const headers = ["Date", "Reference", "Description", "Source", "TotalDebit", "TotalCredit"];
            const csvRows = [headers.join(',')];

            data.entries.forEach(entry => {
                const row = [
                    format(new Date(entry.date), 'yyyy-MM-dd'),
                    entry.referenceNumber,
                    `"${entry.description.replace(/"/g, '""')}"`, // Escape quotes
                    entry.source,
                    entry.totalDebit,
                    entry.totalCredit
                ];
                csvRows.push(row.join(','));
            });

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ledger-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Report Exported Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Export Failed");
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "ledger", label: "General Ledger", icon: Landmark },
        { id: "cost-centers", label: "Cost Centers", icon: Building2 },
        { id: "vendors", label: "Vendor Management", icon: Users },
        { id: "reports", label: "Financial Reports", icon: BarChart3 },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Analyzing financial records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance Command Center</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Real-time financial visibility and payroll-accounting integration.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <DollarSign className="w-4 h-4" /> New Entry
                    </button>
                </div>
            </div>

            {/* Tabbed Interface */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="flex border-b border-slate-100 p-3 gap-2 bg-slate-50/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:bg-white hover:text-indigo-600"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === "overview" && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Financial Overview stats - only in overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden border-l-4 border-l-indigo-500">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-[1rem] flex items-center justify-center">
                                                <Users className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <span className="flex items-center text-[10px] font-black text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                                +12%
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Payroll Cost</p>
                                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹42,50,000</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden border-l-4 border-l-orange-500">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-orange-100 rounded-[1rem] flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <span className="flex items-center text-[10px] font-black text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                                +5%
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Operating Expenses</p>
                                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹8,25,000</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden border-l-4 border-l-emerald-500">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-[1rem] flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <span className="flex items-center text-[10px] font-black text-rose-500">
                                                <ArrowDownRight className="w-3 h-3 mr-1" />
                                                -2%
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Current Liabilities</p>
                                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹1,40,000</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden border-l-4 border-l-blue-500">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-[1rem] flex items-center justify-center">
                                                <Landmark className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="flex items-center text-[10px] font-black text-emerald-500">
                                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                                +8%
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tax Reserves</p>
                                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹4,12,000</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-indigo-600" /> Expense Distribution
                                    </h4>
                                    <ExpenseDistributionChart />
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" /> Cash Flow Trends
                                    </h4>
                                    <CashFlowTrendChart />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "ledger" && <LedgerViewer />}
                    {activeTab === "cost-centers" && <CostCenterManager />}
                    {activeTab === "vendors" && <VendorManager />}
                    {activeTab === "reports" && <FinancialReports />}
                </div>
            </div>

            <JournalEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onEntrySaved={() => {
                    if (activeTab === "ledger") {
                        setActiveTab("overview");
                        setTimeout(() => setActiveTab("ledger"), 50);
                    }
                }}
            />
        </div>
    );
}

function LedgerViewer() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const res = await fetch('/api/finance/ledger');
            const data = await res.json();
            setEntries(data.entries || []);
        } catch (error) {
            toast.error("Failed to load ledger");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" placeholder="Search reference..." />
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"><Filter className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Landmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">No ledger entries found.</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry._id} className="border border-slate-100 rounded-[1.5rem] bg-white hover:border-indigo-100 transition-all p-6 group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                        {entry.source} • {entry.referenceNumber}
                                    </span>
                                    <h4 className="text-lg font-black text-slate-900 mt-2">{entry.description}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{format(new Date(entry.date), 'dd MMMM yyyy')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-indigo-600">₹{entry.totalDebit.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Balanced Entry</p>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl p-4 space-y-2">
                                {entry.lines.map((line, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-1.5 h-6 rounded-full ${line.debit > 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}></span>
                                            <div>
                                                <p className="font-bold text-slate-700">{line.accountName}</p>
                                                <p className="text-[9px] text-slate-400 uppercase font-black">{line.accountType}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex gap-8">
                                            {line.debit > 0 && <span className="font-black text-slate-900 w-24">DR: ₹{line.debit.toLocaleString()}</span>}
                                            {line.credit > 0 && <span className="font-black text-slate-500 w-24">CR: ₹{line.credit.toLocaleString()}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CostCenterManager() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { name: "Engineering", code: "ENG-001", budget: 5000000, spent: 3250000, color: "indigo" },
                { name: "Marketing", code: "MKT-002", budget: 2000000, spent: 1800000, color: "orange" },
                { name: "Admin", code: "ADM-003", budget: 1500000, spent: 900000, color: "emerald" },
            ].map((cc, i) => (
                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all`}>
                            <Building2 className={`w-6 h-6 text-${cc.color}-600`} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cc.code}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">{cc.name}</h4>
                    <div className="mt-6 space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>Budget Utilization</span>
                            <span>{Math.round((cc.spent / cc.budget) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-${cc.color}-500 rounded-full transition-all duration-1000`}
                                style={{ width: `${(cc.spent / cc.budget) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between pt-2">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                                <p className="text-xs font-black text-slate-900">₹{(cc.budget / 100000).toFixed(1)}L</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Spent</p>
                                <p className="text-xs font-black text-slate-900 text-indigo-600">₹{(cc.spent / 100000).toFixed(1)}L</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                                <p className="text-xs font-black text-emerald-600">₹{((cc.budget - cc.spent) / 100000).toFixed(1)}L</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
