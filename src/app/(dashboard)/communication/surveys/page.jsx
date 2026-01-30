"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, ChevronRight, BarChart2, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function SurveysPage() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        questions: [
            { id: "q1", text: "", type: "Text", required: true, options: [] }
        ],
        expiryDate: "",
    });

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            const res = await fetch("/api/communication/surveys");
            const data = await res.json();
            if (data.surveys) {
                setSurveys(data.surveys);
            }
        } catch (error) {
            toast.error("Failed to load surveys");
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { id: `q${Date.now()}`, text: "", type: "Text", required: true, options: [] }]
        }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return;
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index, field, value) => {
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            return { ...prev, questions: newQuestions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/communication/surveys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create survey");

            toast.success("Survey created successfully");
            setShowCreate(false);
            setFormData({
                title: "",
                description: "",
                questions: [{ id: "q1", text: "", type: "Text", required: true, options: [] }],
                expiryDate: ""
            });
            fetchSurveys();
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
                        <span className="font-medium text-indigo-600">Surveys</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Surveys</h1>
                </div>

                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95"
                >
                    {showCreate ? "Cancel Builder" : <><Plus size={18} /> Create New Survey</>}
                </button>
            </div>

            {/* Builder Form */}
            {showCreate && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Survey Builder</h2>
                            <p className="text-sm text-slate-500">Design your survey form for employees.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Survey Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="e.g. Employee Satisfaction Survey Q1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Description</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                                        placeholder="Short description of the survey's purpose..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full md:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900">Questions ({formData.questions.length})</h3>
                                </div>

                                {formData.questions.map((q, index) => (
                                    <div key={q.id} className="relative group p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(index)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-semibold text-slate-500">Question Text</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={q.text}
                                                        onChange={e => updateQuestion(index, "text", e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 border-b border-slate-200 focus:bg-indigo-50/30 focus:border-indigo-500 outline-none transition-all font-medium"
                                                        placeholder="Enter question text..."
                                                    />
                                                </div>
                                                <div className="w-1/3 space-y-1">
                                                    <label className="text-xs font-semibold text-slate-500">Type</label>
                                                    <select
                                                        value={q.type}
                                                        onChange={e => updateQuestion(index, "type", e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 border-b border-slate-200 focus:bg-indigo-50/30 focus:border-indigo-500 outline-none transition-all font-medium appearance-none"
                                                    >
                                                        <option value="Text">Text Answer</option>
                                                        <option value="Rating">Rating (1-5)</option>
                                                        <option value="YesNo">Yes / No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <PlusCircle size={18} /> Add Question
                                </button>
                            </div>

                            <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50"
                                >
                                    {submitting ? "Publishing Survey..." : "Publish Survey"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-slate-500">Loading surveys...</div>
                ) : surveys.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">No Active Surveys</h3>
                        <p className="text-slate-500">Launch a new survey to gather feedback.</p>
                    </div>
                ) : (
                    surveys.map((item) => (
                        <div key={item._id} className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <FileText size={20} />
                                </div>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {item.isActive ? "Active" : "Closed"}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{item.title}</h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{item.description || "No description provided."}</p>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                                    <span>{item.questions?.length || 0} Questions</span>
                                    <span>{item.createdAt ? format(new Date(item.createdAt), "MMM d") : ""}</span>
                                </div>
                                <button className="w-full py-2.5 bg-slate-50 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm flex items-center justify-center gap-2">
                                    <BarChart2 size={16} /> View Results
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
