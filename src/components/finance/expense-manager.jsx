"use client";

import { useState, useEffect } from "react";
import {
    Receipt, Plus, Search, Filter,
    CheckCircle2, XCircle, Clock,
    Download, Eye, MoreVertical,
    Wallet, TrendingUp, CreditCard, PieChart,
    Loader2, Upload, Calendar, DollarSign
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ExpenseManager({ employeeId, isAdmin = false }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [stats, setStats] = useState({
        totalAmount: 0,
        pendingClaims: 0,
        approvedAmount: 0,
        rejectedClaims: 0
    });

    useEffect(() => {
        fetchExpenses();
    }, [employeeId, filterStatus]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            let url = `/api/finance/expenses`;
            const params = new URLSearchParams();
            if (!isAdmin && employeeId) params.append('employeeId', employeeId);
            if (filterStatus !== "all") params.append('status', filterStatus);

            const res = await fetch(`${url}?${params.toString()}`);
            const data = await res.json();

            const expenseList = data.expenses || [];
            setExpenses(expenseList);

            // Calculate stats
            const s = expenseList.reduce((acc, curr) => {
                acc.totalAmount += curr.amount;
                if (curr.status === 'Pending') acc.pendingClaims++;
                if (curr.status === 'Approved') acc.approvedAmount += curr.amount;
                if (curr.status === 'Rejected') acc.rejectedClaims++;
                return acc;
            }, { totalAmount: 0, pendingClaims: 0, approvedAmount: 0, rejectedClaims: 0 });
            setStats(s);

        } catch (error) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch('/api/finance/expenses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success(`Expense ${newStatus.toLowerCase()} successfully`);
            fetchExpenses();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expense Management</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Track spendings, submit reimbursements, and manage approvals.</p>
                </div>
                {!isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> File New Claim
                    </button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Claimed", value: `₹${stats.totalAmount.toLocaleString()}`, icon: Wallet, color: "indigo" },
                    { label: "Pending Claims", value: stats.pendingClaims, icon: Clock, color: "orange" },
                    { label: "Approved Amount", value: `₹${stats.approvedAmount.toLocaleString()}`, icon: CheckCircle2, color: "emerald" },
                    { label: "Rejected", value: stats.rejectedClaims, icon: XCircle, color: "rose" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700`}></div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mb-4`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search by title or category..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Paid">Paid</option>
                        </select>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left bg-slate-50/30">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                                        <p className="text-slate-400 text-xs font-bold">Fetching expense records...</p>
                                    </td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold">No expenses found.</p>
                                        <p className="text-slate-400 text-xs mt-1">Submit your first claim to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 line-clamp-1">{expense.title}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{isAdmin && expense.employee?.personalDetails?.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-xs font-bold text-slate-600">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-black text-indigo-600">₹{expense.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1.5 ${expense.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                    expense.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                                        expense.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                {expense.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                                {expense.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                {expense.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 outline-none">
                                                <button className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                {isAdmin && expense.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(expense._id, 'Approved')}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all font-black text-[10px] uppercase px-3"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(expense._id, 'Rejected')}
                                                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all font-black text-[10px] uppercase px-3"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {!isAdmin && expense.status === 'Draft' && (
                                                    <button className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for new Expense */}
            {showModal && (
                <ExpenseFormModal
                    employeeId={employeeId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchExpenses();
                    }}
                />
            )}
        </div>
    );
}

function ExpenseFormModal({ employeeId, onClose, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        employee: employeeId,
        title: '',
        category: 'Food',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        gstDetails: {
            gstNumber: '',
            gstAmount: 0,
            isGstIncluded: true
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await fetch('/api/finance/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to submit claim");

            toast.success("Expense claim submitted for review!");
            onSuccess();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden scale-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">File Expense Claim</h2>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Draft your reimbursement request</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Claim Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
                                placeholder="Client Meeting - Project X"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-bold"
                            >
                                <option>Food</option>
                                <option>Travel</option>
                                <option>Accommodation</option>
                                <option>Equipment</option>
                                <option>Software</option>
                                <option>Utilities</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 font-black"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl group hover:border-indigo-400 transition-all cursor-pointer">
                            <div className="text-center">
                                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-indigo-600 transition-all" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-all">Upload Receipt</span>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
                                placeholder="Provide context about this expense..."
                            />
                        </div>
                    </div>
                </form>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Claim"}
                    </button>
                </div>
            </div>
        </div>
    );
}
