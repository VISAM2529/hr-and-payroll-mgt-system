"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import {
  Download,
  Eye,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MyPayslipPage = () => {
  const { user } = useSession();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    status: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchPayslips();
    }
  }, [user, filters]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        employee: user.id,
        ...(filters.year && { year: filters.year }),
        ...(filters.month && { month: filters.month }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/payroll/payslip?${queryParams}`);
      const data = await response.json();
      console.log("Fetched payslips data:", data);
      if (response.ok) {
        setPayslips(data.payslips || []);
      } else {
        console.error("Failed to fetch payslips:", data.error);
      }
    } catch (error) {
      console.error("Error fetching payslips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  const handleDownloadPayslip = (payslip) => {
    // Implement PDF download logic here
    console.log("Downloading payslip:", payslip.payslipId);
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          {/* Filters Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
             <div className="grid grid-cols-7 gap-4">
               {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
             </div>
          </div>
          <div className="divide-y divide-slate-200">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 grid grid-cols-7 gap-4 items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Payslips</h1>
            <p className="text-sm text-slate-600 mt-1">
              View and download your salary payslips
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Month
            </label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {payslips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Total Payslips</p>
                <p className="text-2xl font-bold text-slate-900">{payslips.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Latest Salary</p>
                <p className="text-2xl font-bold text-slate-900">
                  {payslips[0] ? formatCurrency(payslips[0].netSalary) : "N/A"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Paid Payslips</p>
                <p className="text-2xl font-bold text-slate-900">
                  {payslips.filter((p) => p.status === "Paid").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Payslips List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {payslips.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Payslips Found
            </h3>
            <p className="text-sm text-slate-600">
              No payslips are available for the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Payslip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payslips.map((payslip) => (
                  <tr key={payslip._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {payslip.payslipId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getMonthName(payslip.month)} {payslip.year}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {formatCurrency(payslip.grossSalary)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      {formatCurrency(payslip.totalDeductions)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(payslip.netSalary)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payslip.status
                        )}`}
                      >
                        {payslip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPayslip(payslip)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPayslip(payslip)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Payslip Details */}
      {showModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Payslip Details
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedPayslip.payslipId} - {getMonthName(selectedPayslip.month)}{" "}
                    {selectedPayslip.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Working Days</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedPayslip.workingDays}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Present Days</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedPayslip.presentDays}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Leave Days</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedPayslip.leaveDays}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">LOP Days</p>
                  <p className="text-lg font-semibold text-red-600">
                    {selectedPayslip.lopDays}
                  </p>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Earnings
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">Basic Salary</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedPayslip.basicSalary)}
                    </span>
                  </div>
                  {selectedPayslip.earnings?.map((earning, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">{earning.type}</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(earning.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm font-semibold text-green-800">
                      Gross Salary
                    </span>
                    <span className="text-sm font-bold text-green-800">
                      {formatCurrency(selectedPayslip.grossSalary)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Deductions
                </h3>
                <div className="space-y-2">
                  {selectedPayslip.deductions?.map((deduction, index) => (
                    <div
                      key={index}
                      className="flex justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">{deduction.type}</span>
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(deduction.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm font-semibold text-red-800">
                      Total Deductions
                    </span>
                    <span className="text-sm font-bold text-red-800">
                      {formatCurrency(selectedPayslip.totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">
                    Net Salary
                  </span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(selectedPayslip.netSalary)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPayslip(selectedPayslip)}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayslipPage;