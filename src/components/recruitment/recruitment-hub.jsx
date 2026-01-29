"use client";

import { useState, useEffect } from "react";
import {
    Briefcase, Users, UserPlus, FileCheck,
    Search, Plus, Filter, MoreVertical,
    Clock, MapPin, Building2, TrendingUp,
    ChevronRight, ArrowUpRight, Loader2,
    Calendar, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function RecruitmentHub() {
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJobModal, setShowJobModal] = useState(false);
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activePositions: 0,
        totalCandidates: 0,
        hiresThisMonth: 0
    });

    useEffect(() => {
        fetchRecruitmentData();
    }, []);

    const fetchRecruitmentData = async () => {
        try {
            setLoading(true);
            const [jobsRes, candidatesRes] = await Promise.all([
                fetch('/api/recruitment/jobs'),
                fetch('/api/recruitment/candidates')
            ]);

            const jobsData = await jobsRes.json();
            const candidatesData = await candidatesRes.json();

            setJobs(jobsData.jobs || []);
            setCandidates(candidatesData.candidates || []);

            // Calculate basic stats
            setStats({
                totalJobs: jobsData.jobs?.length || 0,
                activePositions: jobsData.jobs?.filter(j => j.status === 'Open').length || 0,
                totalCandidates: candidatesData.candidates?.length || 0,
                hiresThisMonth: candidatesData.candidates?.filter(c => c.status === 'Hired').length || 0
            });
        } catch (error) {
            toast.error("Failed to load recruitment data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Assembling recruitment data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruitment Hub</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage job openings and candidate pipelines effortlessly.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCandidateModal(true)}
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" /> Add Candidate
                    </button>
                    <button
                        onClick={() => setShowJobModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Create Requisition
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Requisitions", value: stats.totalJobs, icon: Briefcase, color: "indigo" },
                    { label: "Active Positions", value: stats.activePositions, icon: Target, color: "emerald" },
                    { label: "Candidates in Funnel", value: stats.totalCandidates, icon: Users, color: "blue" },
                    { label: "Monthly Hires", value: stats.hiresThisMonth, icon: UserPlus, color: "orange" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-500 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700`}></div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Navigation Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
                    {[
                        { id: "jobs", label: "Job Board", icon: Briefcase },
                        { id: "candidates", label: "Candidate Pipeline", icon: Users },
                        { id: "offers", label: "Offer Management", icon: FileCheck },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                : "text-slate-500 hover:bg-white hover:text-indigo-600"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === "jobs" && <JobBoard jobs={jobs} onRefresh={fetchRecruitmentData} />}
                    {activeTab === "candidates" && (
                        <CandidatePipeline
                            candidates={candidates}
                            onRefresh={fetchRecruitmentData}
                            onSelectCandidate={(c) => setSelectedCandidate(c)}
                        />
                    )}
                    {activeTab === "offers" && <OfferManagement onRefresh={fetchRecruitmentData} />}
                </div>
            </div>

            {/* Modals will be added here */}
            {showJobModal && (
                <JobRequisitionModal
                    onClose={() => setShowJobModal(false)}
                    onSuccess={() => {
                        setShowJobModal(false);
                        fetchRecruitmentData();
                    }}
                />
            )}

            {showCandidateModal && (
                <AddCandidateModal
                    jobs={jobs}
                    onClose={() => setShowCandidateModal(false)}
                    onSuccess={() => {
                        setShowCandidateModal(false);
                        fetchRecruitmentData();
                    }}
                />
            )}

            {selectedCandidate && (
                <CandidateDetailModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onRefresh={() => {
                        setSelectedCandidate(null);
                        fetchRecruitmentData();
                    }}
                />
            )}
        </div>
    );
}

function JobBoard({ jobs, onRefresh }) {
    if (jobs.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Briefcase className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold">No active job requisitions found.</p>
                <p className="text-slate-400 text-xs mt-1 italic">Click 'Create Requisition' to start hiring.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
                <div key={job._id} className="p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-indigo-100/30 transition-all group border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${job.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {job.status}
                            </span>
                            <h4 className="text-lg font-black text-slate-900 mt-2">{job.title}</h4>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" /> {job.department}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> {job.type}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <AlertCircle className={`w-3.5 h-3.5 ${job.priority === 'Urgent' ? 'text-rose-500' : 'text-amber-500'
                                }`} /> {job.priority} Priority
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Applicant" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 italic">+5</div>
                        </div>
                        <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                            Review Pipeline <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CandidatePipeline({ candidates, onRefresh, onSelectCandidate }) {
    // Stage-wise grouping
    const stages = [
        "Applied", "Screening", "Technical Interview", "Managerial Interview", "HR Interview", "Offer Sent"
    ];

    if (candidates.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">No candidates tracked yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        placeholder="Search by name, email, or skill..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all"><Filter className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-slate-100">
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Candidate</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Position</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Status</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Applied</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {candidates.map((cand) => (
                            <tr key={cand._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-sm">
                                            {cand.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{cand.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{cand.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <p className="text-xs font-bold text-slate-700">{cand.jobRequisition?.title || "Unknown Position"}</p>
                                    <p className="text-[10px] text-slate-400">{cand.jobRequisition?.department}</p>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="px-2 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase">
                                        {cand.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                                    {format(new Date(cand.appliedDate), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => onSelectCandidate(cand)}
                                        className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AddCandidateModal({ jobs, onClose, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        jobRequisition: '',
        source: 'Website',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await fetch('/api/recruitment/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to add candidate");
            toast.success("Candidate added to pipeline!");
            onSuccess();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden scale-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-900">Add New Candidate</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
                            <input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Applied For</label>
                            <select
                                required
                                value={formData.jobRequisition}
                                onChange={e => setFormData({ ...formData, jobRequisition: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                            >
                                <option value="">Select Position</option>
                                {jobs.map(j => <option key={j._id} value={j._id}>{j.title} ({j.department})</option>)}
                            </select>
                        </div>
                    </div>
                </form>
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !formData.jobRequisition}
                        className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Candidate"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CandidateDetailModal({ candidate, onClose, onRefresh }) {
    const [submitting, setSubmitting] = useState(false);
    const stages = [
        'Applied', 'Screening', 'Technical Interview', 'Managerial Interview', 'HR Interview', 'Offer Sent', 'Hired', 'Rejected'
    ];

    const updateStatus = async (newStatus) => {
        try {
            setSubmitting(true);
            const res = await fetch('/api/recruitment/candidates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: candidate._id, status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");
            toast.success(`Candidate moved to ${newStatus}`);
            onRefresh();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden scale-in duration-300 grid grid-cols-1 md:grid-cols-3">
                {/* Left Profile Sidebar */}
                <div className="p-8 bg-slate-50 border-r border-slate-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100 mb-6">
                        {candidate.name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 text-center">{candidate.name}</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{candidate.jobRequisition?.title}</p>

                    <div className="w-full mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-medium">Applied {format(new Date(candidate.appliedDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-medium">{candidate.source}</span>
                        </div>
                    </div>

                    <div className="mt-auto w-full pt-8 space-y-2">
                        <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">View Resume</button>
                        <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all" onClick={() => updateStatus('Rejected')}>Reject</button>
                    </div>
                </div>

                {/* Right Pipeline Content */}
                <div className="md:col-span-2 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Recruitment Pipeline</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">&times;</button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="flex flex-wrap gap-2">
                            {stages.map((stage) => (
                                <button
                                    key={stage}
                                    disabled={submitting}
                                    onClick={() => updateStatus(stage)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${candidate.status === stage
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                        : "bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                        }`}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Interviews & Feedback</h4>
                            <div className="text-center py-8">
                                <p className="text-slate-400 text-xs italic font-medium">No interview feedback recorded yet.</p>
                                <button className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Schedule Interview</button>
                            </div>
                        </div>
                    </div>

                    {candidate.status === 'HR Interview' && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                <FileCheck className="w-4 h-4" /> Finalize & Generate Offer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function OfferManagement() {
    return (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">Offer generation interface coming soon.</p>
        </div>
    );
}

function JobRequisitionModal({ onClose, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        priority: 'Medium',
        description: '',
        requirements: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await fetch('/api/recruitment/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean)
                })
            });

            if (!res.ok) throw new Error("Failed to create job");
            toast.success("Job requisition active!");
            onSuccess();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden scale-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-900">New Job Requisition</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Job Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Head of Engineering"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Department</label>
                            <input
                                required
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Technology"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                            <input
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Remote / Mumbai"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                >
                                    <option>Full-time</option>
                                    <option>Contract</option>
                                    <option>Part-time</option>
                                    <option>Internship</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Urgent</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Requirements (comma separated)</label>
                        <input
                            value={formData.requirements}
                            onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                            placeholder="Next.js, Tailwind CSS, 5+ yrs exp..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Job Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10"
                            placeholder="Detailed role description..."
                        ></textarea>
                    </div>
                </form>
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all">Discard</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Opening"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Target({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}
