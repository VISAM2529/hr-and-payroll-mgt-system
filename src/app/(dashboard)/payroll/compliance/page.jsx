"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, FileText, BarChart3, ChevronRight, Info, Search } from "lucide-react";
import { toast } from "sonner";
import Link from 'next/link';

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState("challans");
  const [loading, setLoading] = useState(false);

  // Data Fetching State
  const [organizations, setOrganizations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingEmps, setLoadingEmps] = useState(false);

  // Challan State
  const [challanParams, setChallanParams] = useState({
    month: new Date().getMonth() + 1, // Current month 1-12
    year: new Date().getFullYear(),
    type: "pf",
  });

  // Form 16 State
  const [form16Params, setForm16Params] = useState({
    organizationId: "",
    employeeId: "",
    year: new Date().getFullYear(),
  });

  // Fetch Organizations on Mount
  useEffect(() => {
    const fetchOrgs = async () => {
      setLoadingOrgs(true);
      try {
        const res = await fetch("/api/crm/organizations?limit=100");
        const data = await res.json();
        if (data.organizations) {
          setOrganizations(data.organizations);
        }
      } catch (error) {
        console.error("Failed to fetch organizations", error);
        toast.error("Could not load organizations");
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, []);

  // Fetch Employees when Organization Changes
  useEffect(() => {
    if (!form16Params.organizationId) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
      setLoadingEmps(true);
      try {
        const res = await fetch(`/api/payroll/employees?organizationId=${form16Params.organizationId}&limit=1000`);
        const data = await res.json();
        if (data.employees) {
          setEmployees(data.employees);
        }
      } catch (error) {
        console.error("Failed to fetch employees", error);
        toast.error("Could not load employees");
      } finally {
        setLoadingEmps(false);
      }
    };
    fetchEmployees();
  }, [form16Params.organizationId]);


  const handleDownloadChallan = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        month: challanParams.month,
        year: challanParams.year,
        type: challanParams.type,
      });

      const res = await fetch(`/api/reports/challan?${query}`);
      if (!res.ok) throw new Error("Failed to generate report");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        challanParams.type === 'pf'
          ? `PF_ECR_${challanParams.month}_${challanParams.year}.txt`
          : `ESIC_Return_${challanParams.month}_${challanParams.year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.error("Error downloading report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadForm16 = async () => {
    if (!form16Params.employeeId) {
      toast.error("Please select an Employee");
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams({
        employeeId: form16Params.employeeId,
        year: form16Params.year,
      });

      const res = await fetch(`/api/reports/form16?${query}`);
      if (!res.ok) throw new Error("Form 16 generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Find employee name for filename
      const emp = employees.find(e => e._id === form16Params.employeeId);
      const filename = emp ? `Form16_${emp.personalDetails.firstName}_${form16Params.year}.pdf` : "Form16.pdf";

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Form 16 generated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <Link href="/dashboard/payroll" className="hover:text-indigo-600 transition-colors">Payroll</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-slate-900">Compliance</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Statutory Compliance & Reports</h1>
        <p className="text-slate-500 max-w-2xl">
          Generate and download mandatory government compliance reports including PF ECR, ESIC Returns, and Employee Form 16s.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("challans")}
            className={`pb-4 px-1 text-sm font-semibold transition-all duration-200 relative ${activeTab === "challans"
                ? "text-indigo-600"
                : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Monthly Challans
            {activeTab === "challans" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("form16")}
            className={`pb-4 px-1 text-sm font-semibold transition-all duration-200 relative ${activeTab === "form16"
                ? "text-indigo-600"
                : "text-slate-500 hover:text-indigo-600"
              }`}
          >
            Form 16 Generation
            {activeTab === "form16" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
        {activeTab === "challans" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={challanParams.type}
                    onChange={(e) => setChallanParams({ ...challanParams, type: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium appearance-none"
                  >
                    <option value="pf">PF ECR (Text Format)</option>
                    <option value="esic">ESIC Return (Excel Format)</option>
                  </select>
                </div>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
                <select
                  value={challanParams.month}
                  onChange={(e) => setChallanParams({ ...challanParams, month: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium appearance-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {format(new Date(2000, i, 1), "MMMM")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                <input
                  type="number"
                  value={challanParams.year}
                  onChange={(e) => setChallanParams({ ...challanParams, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
                />
              </div>

              <button
                onClick={handleDownloadChallan}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center gap-2">Generating...</span>
                ) : (
                  <><Download size={18} /> Download Report</>
                )}
              </button>
            </div>

            <div className="flex gap-4 bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-sm text-slate-600">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">Submission Instructions</h3>
                <ul className="list-disc pl-4 space-y-1 marker:text-blue-400">
                  <li><strong>PF ECR:</strong> The downloaded text file is formatted strictly for the <a href="#" className="text-blue-600 hover:underline">EPFO Unified Portal</a> bulk upload. Do not modify the structure.</li>
                  <li><strong>ESIC Return:</strong> The Excel file follows the monthly contribution template required for the ESIC portal.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "form16" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-wrap items-end gap-6">

              {/* Organization Selector */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                <div className="relative">
                  <select
                    value={form16Params.organizationId}
                    onChange={(e) => setForm16Params({ ...form16Params, organizationId: e.target.value, employeeId: "" })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium appearance-none"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee Selector */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
                <div className="relative">
                  <select
                    value={form16Params.employeeId}
                    onChange={(e) => setForm16Params({ ...form16Params, employeeId: e.target.value })}
                    disabled={!form16Params.organizationId || loadingEmps}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium appearance-none disabled:opacity-50"
                  >
                    <option value="">{loadingEmps ? "Loading..." : "Select Employee"}</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.personalDetails.firstName} {emp.personalDetails.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-slate-700 mb-2">Financial Year</label>
                <select
                  value={form16Params.year}
                  onChange={(e) => setForm16Params({ ...form16Params, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium appearance-none"
                >
                  <option value={2024}>FY 2024-25</option>
                  <option value={2025}>FY 2025-26</option>
                </select>
              </div>

              <button
                onClick={handleDownloadForm16}
                disabled={loading || !form16Params.employeeId}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-100 hover:shadow-lg active:scale-95"
              >
                {loading ? "Process..." : <><FileText size={18} /> Generate PDF</>}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Generation Notes</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                This tool generates <strong>Part B</strong> of Form 16 based on the processed payroll data within the system for the selected financial year.
                Ensure all payroll runs for the employee from April to March are "Locked" and "Paid" before generating this report to ensure accurate tax reflection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}