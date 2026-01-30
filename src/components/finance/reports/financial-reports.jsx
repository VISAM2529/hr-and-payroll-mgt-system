"use client";

import { FileText, Download, Calendar, Filter, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function FinancialReports() {
    const reports = [
        {
            id: 1,
            title: "Profit & Loss Statement",
            description: "Detailed breakdown of revenues, costs, and expenses.",
            period: "June 2025",
            type: "PDF",
            size: "2.4 MB",
            color: "indigo"
        },
        {
            id: 2,
            title: "Balance Sheet",
            description: "Snapshot of assets, liabilities, and equity.",
            period: "Q2 2025",
            type: "Excel",
            size: "1.8 MB",
            color: "emerald"
        },
        {
            id: 3,
            title: "Cash Flow Statement",
            description: "Analysis of cash inflows and outflows.",
            period: "June 2025",
            type: "PDF",
            size: "1.2 MB",
            color: "blue"
        },
        {
            id: 4,
            title: "Expense Summary",
            description: "Categorized expense report with vendor details.",
            period: "YTD 2025",
            type: "Excel",
            size: "3.5 MB",
            color: "orange"
        },
        {
            id: 5,
            title: "Tax Liability Report",
            description: "Estimated tax obligations and deductions.",
            period: "Q2 2025",
            type: "PDF",
            size: "0.9 MB",
            color: "rose"
        },
        {
            id: 6,
            title: "Payroll Cost Analysis",
            description: "Department-wise payroll allocation and trends.",
            period: "June 2025",
            type: "Excel",
            size: "2.1 MB",
            color: "purple"
        }
    ];

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 leading-tight">Reports Library</h3>
                        <p className="text-xs text-slate-500 font-medium">Access and download financial statements</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all">
                        <Calendar className="w-3.5 h-3.5" /> Select Period
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all">
                        <Filter className="w-3.5 h-3.5" /> Filter Type
                    </button>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden">
                        {/* Hover Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-${report.color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-2xl bg-${report.color}-50 flex items-center justify-center text-${report.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {report.type}
                                </span>
                            </div>

                            <h4 className="font-black text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{report.title}</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{report.description}</p>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> {report.period}
                                </div>
                                <button className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Download <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Generated Info */}
            <div className="text-center pt-8 pb-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Last sync: {format(new Date(), "MMM d, yyyy 'at' h:mm a")} • All reports are GAAP compliant
                </p>
            </div>
        </div>
    );
}
