"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Megaphone, MoreVertical, Calendar, User, Tag, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "Announcement",
        priority: "Normal",
        targetAudience: "all", // Simplified for UI
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch("/api/communication/announcements");
            const data = await res.json();
            if (data.announcements) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                targetAudience: { all: formData.targetAudience === "all" }
                // expanded logic for specific depts later
            };

            const res = await fetch("/api/communication/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to post");

            toast.success("Announcement posted successfully");
            setShowCreate(false);
            setFormData({ title: "", content: "", type: "Announcement", priority: "Normal", targetAudience: "all" });
            fetchAnnouncements(); // Refresh list
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center text-sm text-slate-500 mb-1">
                        <Link href="/communication" className="hover:text-indigo-600 transition-colors">Communication Hub</Link>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-indigo-600">Announcements</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Announcements & Policy</h1>
                </div>

                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95"
                >
                    {showCreate ? "Cancel Query" : <><Plus size={18} /> New Announcement</>}
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Create New Announcement</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="e.g. Annual Company Retreat"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                                    >
                                        <option value="Announcement">Generic Announcement</option>
                                        <option value="Policy">Policy Update</option>
                                        <option value="Broadcast">Urgent Broadcast</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Content</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                                placeholder="Write your announcement here..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:shadow-lg disabled:opacity-50"
                            >
                                {submitting ? "Posting..." : <><Send size={16} /> Post Announcement</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Bar (Visual only for now) */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-1.5 bg-transparent text-sm font-medium focus:outline-none w-48"
                    />
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <select className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none">
                    <option>All Types</option>
                    <option>Policy</option>
                    <option>Announcement</option>
                </select>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <Megaphone className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">No Announcements Yet</h3>
                        <p className="text-slate-500">Create your first company-wide announcement.</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item._id} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.priority === "Critical" ? "bg-red-100 text-red-700" :
                                        item.priority === "High" ? "bg-orange-100 text-orange-700" :
                                            "bg-blue-50 text-blue-700"
                                        }`}>
                                        {item.priority}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 flex items-center gap-1">
                                        <Tag size={12} /> {item.type}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : ""}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{item.content}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                        <User size={12} />
                                    </div>
                                    Posted by {item.createdBy?.name || "Admin"}
                                </div>
                                {item.requiresAcknowledgement && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                        <CheckCircle size={14} />
                                        Acknowledgement Required
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
