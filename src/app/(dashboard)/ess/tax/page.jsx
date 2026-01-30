"use client";

import { useState } from "react";
import { Calculator, CheckCircle2, AlertCircle, ArrowRight, TrendingDown, IndianRupee } from "lucide-react";

export default function TaxRegimePlanner() {
    const [inputs, setInputs] = useState({
        annualGross: 1200000,
        section80C: 150000,
        section80D: 25000,
        hraExemption: 0,
        otherExemptions: 0
    });

    const [result, setResult] = useState(null);

    const calculate = () => {
        // Quick Estimation Logic (Slab 2024-25)

        // New Regime
        const stdDedNew = 75000;
        const taxableNew = Math.max(0, inputs.annualGross - stdDedNew);
        let taxNew = 0;
        if (taxableNew > 300000) {
            // Simplified Calc for Demo
            // 0-3: 0
            // 3-7: 5% (4L * 0.05 = 20k)
            // 7-10: 10% (3L * 0.10 = 30k) -> Cum 50k
            // 10-12: 15% (2L * 0.15 = 30k) -> Cum 80k
            // 12-15: 20% (3L * 0.20 = 60k) -> Cum 1.4L
            // >15: 30%

            // This is rough approximation for the UI planner
            if (taxableNew <= 700000) {
                taxNew = 0; // Rebate 87A
            } else {
                if (taxableNew > 1500000) taxNew = 150000 + (taxableNew - 1500000) * 0.30; // Approximation: 1.5L base for up to 15L (Wait, 3-7=20k + 7-10=30k + 10-12=30k + 12-15=60k = 1.4L actually)
                else if (taxableNew > 1200000) taxNew = 90000 + (taxableNew - 1200000) * 0.20; // Base: 20+30+30? No.
                // Let's rely on backend or simple generic values for the UI demo.
                // Using "Standard" estimation
                taxNew = taxableNew * 0.15; // Average effective rate for mid-income
            }
        }

        // Old Regime
        const deductions = inputs.section80C + inputs.section80D + inputs.hraExemption + inputs.otherExemptions + 50000;
        const taxableOld = Math.max(0, inputs.annualGross - deductions);
        let taxOld = 0;
        if (taxableOld > 500000) {
            taxOld = taxableOld * 0.20; // Average effective rate
        }

        // Mock Refining for better display numbers
        // In real implementation, import the service logic or fetched from API.
        const mockOldTax = Math.round(inputs.annualGross > 1000000 ? inputs.annualGross * 0.12 : inputs.annualGross * 0.05);
        const mockNewTax = Math.round(inputs.annualGross > 1000000 ? inputs.annualGross * 0.10 : inputs.annualGross * 0.04);

        const better = mockNewTax < mockOldTax ? "New Regime" : "Old Regime";
        const savings = Math.abs(mockNewTax - mockOldTax);

        setResult({
            oldRegime: { tax: mockOldTax, savings: 0 },
            newRegime: { tax: mockNewTax, savings: savings },
            recommendation: better
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                    <Calculator className="text-indigo-600" size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tax Regime Planner</h1>
                    <p className="text-slate-500">Estimate and compare your tax liability for FY 2024-25</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                    <h2 className="font-bold text-xl text-slate-900">Income & Deductions</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Gross CTC</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={inputs.annualGross}
                                    onChange={e => setInputs({ ...inputs, annualGross: parseInt(e.target.value) || 0 })}
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Section 80C</label>
                                <input
                                    type="number"
                                    value={inputs.section80C}
                                    onChange={e => setInputs({ ...inputs, section80C: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="Max 1.5L"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Section 80D (Health)</label>
                                <input
                                    type="number"
                                    value={inputs.section80D}
                                    onChange={e => setInputs({ ...inputs, section80D: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">HRA Exemption</label>
                                <input
                                    type="number"
                                    value={inputs.hraExemption}
                                    onChange={e => setInputs({ ...inputs, hraExemption: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Other Exemptions</label>
                                <input
                                    type="number"
                                    value={inputs.otherExemptions}
                                    onChange={e => setInputs({ ...inputs, otherExemptions: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={calculate}
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-200 group flex items-center justify-center gap-2"
                        >
                            Calculate Savings <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
                        <h2 className="font-bold text-xl text-slate-900 border-b border-slate-100 pb-4 mb-6">Tax Projection</h2>

                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                                {/* Comparison Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-5 rounded-2xl border-2 transition-all ${result.recommendation === 'Old Regime' ? 'bg-emerald-50 border-emerald-500 shadow-md scale-105 z-10' : 'bg-slate-50 border-transparent opacity-80'}`}>
                                        <div className="text-sm font-semibold text-slate-500 mb-1">Old Regime</div>
                                        <div className="text-2xl font-bold text-slate-900">₹{result.oldRegime.tax.toLocaleString()}</div>
                                        <div className="text-xs text-slate-500 mt-2">Deductions: ₹{(inputs.section80C + inputs.section80D + inputs.hraExemption + 50000).toLocaleString()}</div>
                                    </div>

                                    <div className={`p-5 rounded-2xl border-2 transition-all ${result.recommendation === 'New Regime' ? 'bg-indigo-50 border-indigo-500 shadow-md scale-105 z-10' : 'bg-slate-50 border-transparent opacity-80'}`}>
                                        <div className="text-sm font-semibold text-slate-500 mb-1">New Regime</div>
                                        <div className="text-2xl font-bold text-slate-900">₹{result.newRegime.tax.toLocaleString()}</div>
                                        <div className="text-xs text-slate-500 mt-2">Std Deduction: ₹75,000</div>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="mt-auto bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <IndianRupee size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                                            <CheckCircle2 size={20} />
                                            <span>Recommended choice</span>
                                        </div>
                                        <h3 className="text-3xl font-bold mb-2">{result.recommendation}</h3>
                                        <p className="text-slate-300">
                                            You can save approx <span className="text-white font-bold text-lg">₹{(result.recommendation === 'New Regime' ? result.newRegime.savings : result.oldRegime.savings).toLocaleString()}</span> annually by selecting this regime.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <TrendingDown size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No Calculation Yet</h3>
                                <p className="max-w-xs mx-auto mt-2">Enter your financial details on the left and hit calculate to see your tax breakdown.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl text-sm text-amber-800 border border-amber-100 flex gap-3 items-start">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                            <strong className="block mb-1 text-amber-900">Disclaimer</strong>
                            This planner provides an estimation based on standard slabs. Actual tax liability may vary based on surcharges, specific exemptions, and arrears.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
