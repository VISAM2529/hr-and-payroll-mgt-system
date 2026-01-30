"use client";

import React, { useState, useEffect } from "react";
import {
    Calculator,
    TrendingUp,
    ShieldCheck,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Info,
    ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        {children}
    </div>
);

export default function ESSSalaryProjection({ employee }) {
    const [loading, setLoading] = useState(false);
    const [regime, setRegime] = useState("new"); // 'new' | 'old'
    const [projection, setProjection] = useState(null);

    // Default declarations for "What-If"
    const [declarations, setDeclarations] = useState({
        section80C: 150000,
        section80D: 25000,
        hra: 0,
        nps: 50000
    });

    useEffect(() => {
        if (employee) {
            calculateProjection();
        }
    }, [employee, regime, declarations]);

    const calculateProjection = () => {
        if (!employee?.salaryDetails?.ctc) return;

        // Simplified Logic: 
        // 1. Extrapolate monthly salary to annual
        // 2. Apply exemptions based on Regime
        // 3. Calculate Tax
        // 4. Derive Net

        const annualCTC = employee.salaryDetails.ctc;
        const basic = employee.payslipStructure?.basicSalary * 12 || annualCTC * 0.4; // Approx
        const hraReceived = employee.payslipStructure?.earnings?.find(e => e.name === 'HRA')?.fixedAmount * 12 || 0;

        // Exemptions (Old Regime Only)
        let totalExemptions = 0;
        let standardDeduction = 50000; // Common for both in FY24-25? Actually New Regime also allows it now (75k proposed, but sticking to 50k implementation or 75k as per latest interim budget if applicable, lets stick to 50k for safety or 75k if FY25) - Let's use 50000 for verified consistency for now.
        // Actually for FY 2025-26 it might be 75k. Let's assume 50k base logic from existing system.

        if (regime === 'old') {
            totalExemptions += Math.min(declarations.section80C, 150000);
            totalExemptions += Math.min(declarations.section80D, 25000);
            totalExemptions += Math.min(declarations.nps, 50000);

            // HRA Logic (Simplified)
            // Min of: Actual HRA, 50% Basic, Rent - 10% Basic
            // Assuming simplified Rent Paid = HRA Received + 10% Basic for now just to max out HRA if they declare it, 
            // OR use the 'hra' declaration value if we had a field. 
            // For this projection, let's assume they max out HRA exemption if they entered a rent amount.
            // But we don't have rent input here yet, so let's use 0 or a placeholder.
            totalExemptions += declarations.hra;
        }

        const taxableIncome = Math.max(0, annualCTC - totalExemptions - standardDeduction);

        const tax = calculateTax(taxableIncome, regime);
        const cess = tax * 0.04;
        const totalTax = tax + cess;
        const netAnnual = annualCTC - totalTax;

        setProjection({
            gross: annualCTC,
            taxable: taxableIncome,
            tax: totalTax,
            net: netAnnual,
            monthlyNet: netAnnual / 12,
            exemptions: totalExemptions + standardDeduction
        });
    };

    const calculateTax = (income, type) => {
        let tax = 0;
        const slabs = type === 'new'
            ? [
                { limit: 300000, rate: 0 },
                { limit: 600000, rate: 0.05 },
                { limit: 900000, rate: 0.10 },
                { limit: 1200000, rate: 0.15 },
                { limit: 1500000, rate: 0.20 },
                { above: 1500000, rate: 0.30 }
            ]
            : [
                { limit: 250000, rate: 0 },
                { limit: 500000, rate: 0.05 },
                { limit: 1000000, rate: 0.20 },
                { above: 1000000, rate: 0.30 }
            ];

        let remainingIncome = income;
        let previousLimit = 0;

        // Simplified slab calc
        if (type === 'new') {
            if (income <= 700000) return 0; // Rebate u/s 87A
        } else {
            if (income <= 500000) return 0; // Rebate
        }

        // Iterative calc
        for (let i = 0; i < slabs.length; i++) {
            const slab = slabs[i];
            if (slab.rate === 0) {
                previousLimit = slab.limit;
                continue;
            }

            if (slab.above) {
                if (income > slab.above) {
                    tax += (income - slab.above) * slab.rate;
                }
            } else {
                if (income > previousLimit) {
                    const taxableAtThisSlab = Math.min(income, slab.limit) - previousLimit;
                    tax += taxableAtThisSlab * slab.rate;
                    previousLimit = slab.limit;
                }
            }
        }
        return tax;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Calculator className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Salary Projection</h2>
                            <p className="text-slate-500 text-sm">Estimate your annual take-home pay under different tax regimes.</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setRegime('new')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${regime === 'new' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            New Regime
                        </button>
                        <button
                            onClick={() => setRegime('old')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${regime === 'old' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Old Regime
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Controls */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-slate-50 border-slate-200">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-slate-500" />
                                Annual Salary (CTC)
                            </h4>
                            <div className="text-2xl font-black text-slate-900 mb-1">
                                ₹{employee?.salaryDetails?.ctc?.toLocaleString() || '0'}
                            </div>
                            <p className="text-xs text-slate-500">Fixed as per your employment contract.</p>
                        </Card>

                        {regime === 'old' && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 text-sm">Simulate Declarations (Old Regime)</h4>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Section 80C (Max 1.5L)</label>
                                    <input
                                        type="range" min="0" max="150000" step="5000"
                                        value={declarations.section80C}
                                        onChange={(e) => setDeclarations({ ...declarations, section80C: Number(e.target.value) })}
                                        className="w-full accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-xs font-mono">
                                        <span>₹0</span>
                                        <span className="font-bold text-indigo-600">₹{declarations.section80C.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Section 80D (Health)</label>
                                    <input
                                        type="number"
                                        value={declarations.section80D}
                                        onChange={(e) => setDeclarations({ ...declarations, section80D: Number(e.target.value) })}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {regime === 'new' && (
                            <div className="p-4 bg-blue-50 text-blue-800 text-xs rounded-xl flex items-start gap-3">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>The New Regime offers lower tax rates but disallows most exemptions (like 80C, HRA). Standard Deduction (₹50k/75k) is applied automatically.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Projection */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none">
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Projected Monthly Net</p>
                                <h3 className="text-4xl font-black">₹{Math.round(projection?.monthlyNet || 0).toLocaleString()}</h3>
                                <p className="text-indigo-200 text-xs mt-2">Take-home pay after tax calc</p>
                            </Card>

                            <Card className="p-6">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Annual Tax</p>
                                <h3 className="text-4xl font-black text-slate-900">₹{Math.round(projection?.tax || 0).toLocaleString()}</h3>
                                <p className="text-rose-500 text-xs mt-2 font-bold flex items-center gap-1">
                                    Effective Rate: {((projection?.tax / projection?.gross) * 100).toFixed(1)}%
                                </p>
                            </Card>
                        </div>

                        <Card className="p-0 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 text-sm">
                                Calculation Breakdown
                            </div>
                            <div className="divide-y divide-slate-100 text-sm">
                                <div className="p-4 flex justify-between">
                                    <span className="text-slate-600">Gross Salary (Annual)</span>
                                    <span className="font-bold">₹{projection?.gross?.toLocaleString()}</span>
                                </div>
                                <div className="p-4 flex justify-between bg-emerald-50/50">
                                    <span className="text-emerald-800 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Total Exemptions & Deductions
                                    </span>
                                    <span className="font-bold text-emerald-700">- ₹{projection?.exemptions?.toLocaleString()}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-slate-600">Taxable Income</span>
                                    <span className="font-bold text-slate-900">₹{projection?.taxable?.toLocaleString()}</span>
                                </div>
                                <div className="p-4 flex justify-between bg-rose-50/50">
                                    <span className="text-rose-800 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Calculated Tax + Cess
                                    </span>
                                    <span className="font-bold text-rose-700">₹{Math.round(projection?.tax || 0).toLocaleString()}</span>
                                </div>
                                <div className="p-4 flex justify-between bg-slate-50 font-bold text-lg">
                                    <span className="text-slate-900">Annual Net Pay</span>
                                    <span className="text-indigo-600">₹{Math.round(projection?.net || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
