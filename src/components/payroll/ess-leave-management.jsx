'use client';

import { useState, useEffect } from 'react';
import {
    Calendar, FileText, Clock,
    Plus, Loader2, CheckCircle2,
    XCircle, AlertCircle, ChevronRight,
    MoreVertical, CalendarDays
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function ESSLeaveManagement({ employeeId }) {
    const [activeView, setActiveView] = useState('list'); // 'list' or 'apply'
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState({
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: '',
        contactNumber: '',
        addressDuringLeave: '',
        isAdvanceLeave: false,
    });

    useEffect(() => {
        if (employeeId) {
            fetchMyLeaves();
        }
    }, [employeeId]);

    const fetchMyLeaves = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/payroll/leave-applications?employeeId=${employeeId}`);
            if (!res.ok) throw new Error("Failed to fetch leaves");
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (error) {
            toast.error("Error loading leave history");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const calculateTotalDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        return 0;
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        const totalDays = calculateTotalDays();
        if (totalDays <= 0) {
            toast.error("Invalid date range");
            return;
        }

        try {
            setSubmitLoading(true);
            const res = await fetch('/api/payroll/leave-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    employeeId,
                    totalDays
                })
            });

            if (!res.ok) throw new Error("Failed to submit");
            toast.success("Leave application submitted!");
            setActiveView('list');
            fetchMyLeaves();
            setFormData({
                leaveType: 'Casual',
                startDate: '',
                endDate: '',
                reason: '',
                contactNumber: '',
                addressDuringLeave: '',
                isAdvanceLeave: false,
            });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Cancelled': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle2 className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (activeView === 'apply') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">New Leave Application</h2>
                    <button
                        onClick={() => setActiveView('list')}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2"
                    >
                        Back to List
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleApplyLeave} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Leave Type</label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    required
                                >
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Earned">Earned Leave</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Contact During Leave</label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    placeholder="Phone number"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Reason for leave..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                required
                            />
                        </div>

                        {calculateTotalDays() > 0 && (
                            <div className="p-4 bg-indigo-50 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <CalendarDays className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Total Duration</p>
                                        <p className="text-lg font-black text-indigo-900">{calculateTotalDays()} Days</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setActiveView('list')}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                            >
                                {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Leave History</h2>
                    <p className="text-xs text-slate-500 mt-1">Track your past and pending leave requests</p>
                </div>
                <button
                    onClick={() => setActiveView('apply')}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all"
                >
                    <Plus className="w-4 h-4" /> Apply Leave
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading your leaves...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-slate-50 rounded-full">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">No leaves found</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">You haven't submitted any leave applications yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Leave Type</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Dates</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Duration</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {app.leaveType[0]}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900">{app.leaveType}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {format(new Date(app.startDate), 'MMM dd, yyyy')} - {format(new Date(app.endDate), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-slate-900">{app.totalDays} Days</span>
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>
                                                {getStatusIcon(app.status)}
                                                {app.status}
                                            </div>
                                            {app.status === 'Rejected' && app.rejectionReason && (
                                                <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Remark: {app.rejectionReason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
