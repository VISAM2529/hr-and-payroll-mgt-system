"use client";

import { Bell, FileText, MessageSquare, ChevronRight, Speaker, CheckCircle, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CommunicationHub() {
    const features = [
        {
            title: "Announcements & Policy",
            description: "Broadcast company news, policy updates, and track acknowledgements.",
            icon: Speaker,
            color: "bg-blue-50 text-blue-600",
            href: "/communication/announcements",
            stats: "3 Active"
        },
        {
            title: "Employee Surveys",
            description: "Create polls and surveys to gather employee feedback and sentiment.",
            icon: FileText,
            color: "bg-purple-50 text-purple-600",
            href: "/communication/surveys",
            stats: "1 Open"
        },
        {
            title: "Internal Messaging",
            description: "Direct messages and team broadcasts.",
            icon: MessageSquare,
            color: "bg-emerald-50 text-emerald-600",
            href: "/communication/messages", // Placeholder for now
            stats: "Inbox"
        }
    ];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center text-sm text-slate-500 mb-2">
                    <span className="font-medium text-slate-900">Dashboard</span>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="font-medium text-indigo-600">Communication Hub</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">HR Communication Hub</h1>
                <p className="text-slate-500 max-w-2xl">
                    Centralized platform for company announcements, policy updates, and employee engagement.
                </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <Link
                        key={index}
                        href={feature.href}
                        className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                    >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                            <feature.icon className="h-6 w-6" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
                            {feature.description}
                        </p>

                        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mt-auto pt-4 border-t border-slate-100">
                            <span>{feature.stats}</span>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Stats / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Recent Announcements</h3>
                        <Link href="/dashboard/communication/announcements" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Q4 All Hands Meeting</p>
                                    <p className="text-xs text-slate-500">Posted by HR • 2 days ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Pending Acknowledgements</h3>
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Action Required</span>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <FileText className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">Updated IT Security Policy</h4>
                                    <p className="text-xs text-slate-600 mb-3">Please review and acknowledge the revisions to the IT security guidelines for 2026.</p>
                                    <button className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors">
                                        Review & Acknowledge
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
