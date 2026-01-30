"use client";

import React, { useState, useEffect } from "react";
import {
    Shield,
    Save,
    Building,
    Settings,
    Info,
    CheckCircle2,
    AlertCircle,
    Building2,
    MapPin,
    Calendar,
    Clock,
    TrendingUp,
    CreditCard
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ComplianceSettingsPage() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orgs, setOrgs] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const orgsRes = await fetch("/api/crm/organizations");
            const orgsResponse = await orgsRes.json();
            const orgsData = orgsResponse.organizations || [];
            setOrgs(orgsData);

            if (orgsData.length > 0) {
                setSelectedOrg(orgsData[0]._id);
                fetchConfig(orgsData[0]._id);
            }
        } catch (error) {
            toast.error("Failed to load organizations");
        }
    };

    const fetchConfig = async (orgId) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/payroll/settings?orgId=${orgId}`);
            if (!res.ok) throw new Error("Failed to load config");
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOrgChange = (e) => {
        const orgId = e.target.value;
        setSelectedOrg(orgId);
        fetchConfig(orgId);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await fetch("/api/payroll/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...config, company: selectedOrg })
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success("Compliance settings updated successfully");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading && !config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Shield className="w-6 h-6" />
                            </div>
                            Payroll Compliance & Policy
                        </h1>
                        <p className="text-slate-500 mt-1">Manage India-specific statutory rates and organization policies</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
                        <Building2 className="w-4 h-4 text-slate-400 ml-2" />
                        <select
                            value={selectedOrg}
                            onChange={handleOrgChange}
                            className="text-sm font-semibold border-none focus:ring-0 bg-transparent pr-8"
                        >
                            {orgs.map(org => (
                                <option key={org._id} value={org._id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Statutory Limits */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Statutory Contribution Limits</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Government Mandated Thresholds</p>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-slate-700">PF Wage Ceiling</span>
                                        <div className="group relative">
                                            <Info className="w-3.5 h-3.5 text-slate-400" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                Standard India ceiling is ₹15,000 for EPF contributions.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={config?.pfWageLimit}
                                            onChange={(e) => setConfig({ ...config, pfWageLimit: parseInt(e.target.value) })}
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <input
                                        type="checkbox"
                                        checked={config?.pfEnabled}
                                        onChange={(e) => setConfig({ ...config, pfEnabled: e.target.checked })}
                                        className="w-4 h-4 rounded text-emerald-600"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-emerald-900">Enable PF Calculations</span>
                                        <span className="text-[10px] text-emerald-700">Automatically calculate 12%/13% contributions</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-slate-700">ESIC Wage Threshold</span>
                                        <div className="group relative">
                                            <Info className="w-3.5 h-3.5 text-slate-400" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                ESIC applies if gross salary is less than or equal to ₹21,000.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={config?.esicWageLimit}
                                            onChange={(e) => setConfig({ ...config, esicWageLimit: parseInt(e.target.value) })}
                                            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-blue-100 rounded-xl">
                                    <input
                                        type="checkbox"
                                        checked={config?.esicEnabled}
                                        onChange={(e) => setConfig({ ...config, esicEnabled: e.target.checked })}
                                        className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-blue-900">Enable ESIC Calculations</span>
                                        <span className="text-[10px] text-blue-700">Automatically calculate 0.75%/3.25% contributions</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regional Settings */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900">Regional Compliance (Professional Tax)</h3>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Primary Work State</label>
                                <select
                                    value={config?.professionalTaxState}
                                    onChange={(e) => setConfig({ ...config, professionalTaxState: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none shadow-inner"
                                >
                                    <option value="Maharashtra">Maharashtra (Default)</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Telangana">Telangana</option>
                                </select>
                                <p className="text-[10px] text-slate-400 mt-2 px-1">Professional Tax (PT) calculations follow the slabs of the selected state.</p>
                            </div>
                        </div>
                    </div>

                    {/* Organization Policies */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Building className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900">Standard Payout Policies</h3>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Working Days / Month</label>
                                <input
                                    type="number"
                                    value={config?.workingDaysPerMonth}
                                    onChange={(e) => setConfig({ ...config, workingDaysPerMonth: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Overtime Rate</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config?.overtimeRate}
                                        onChange={(e) => setConfig({ ...config, overtimeRate: parseFloat(e.target.value) })}
                                        className="w-full pr-12 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MULTIPLIER</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Day</label>
                                <select
                                    value={config?.paymentDay}
                                    onChange={(e) => setConfig({ ...config, paymentDay: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none shadow-inner"
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}th of Month</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Discard Changes</button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 group disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                            )}
                            Save Configuration
                        </button>
                    </div>
                </form>

                {/* Help Banner */}
                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-900">Why are these settings locked to organizations?</h4>
                        <p className="text-sm text-indigo-700 leading-relaxed mt-1">
                            Compliance thresholds and working policies can vary across different legal entities or subsidiaries within the same company.
                            Changes made here will affect all automatic salary calculations for the selected organization only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
