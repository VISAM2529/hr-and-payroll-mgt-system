"use client";

import { useState, useEffect } from "react";
import {
    Users, Plus, Search, Filter,
    FileText, CreditCard, ExternalLink,
    MoreVertical, Trash2, Edit3,
    Building2, Mail, Phone, MapPin,
    CheckCircle2, Clock, AlertCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

export default function VendorManager() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Fetch vendors - for now simulated
        setTimeout(() => {
            setVendors([
                { _id: '1', name: 'Synture Tech Solutions', category: 'IT Services', email: 'sales@synture.com', status: 'Active', gstin: '27AAAAA0000A1Z5' },
                { _id: '2', name: 'Cloud Provider Inc', category: 'Software', email: 'billing@cloud.io', status: 'Active', gstin: '27BBBBB0000B1Z5' },
                { _id: '3', name: 'Office Depot', category: 'Office Supplies', email: 'orders@depot.com', status: 'Inactive', gstin: '27CCCCC0000C1Z5' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Vendor Directory</h3>
                    <p className="text-slate-500 text-xs font-medium">Manage external service providers and contract terms.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-4 h-4" /> Add New Vendor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-50 rounded-[2rem] h-64 animate-pulse border border-slate-100"></div>
                    ))
                ) : (
                    vendors.map((vendor) => (
                        <div key={vendor._id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${vendor.status === 'Active' ? 'bg-emerald-50' : 'bg-slate-50'} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700`}></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 ${vendor.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'} rounded-2xl flex items-center justify-center`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><Edit3 className="w-4 h-4" /></button>
                                        <button className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <h4 className="text-lg font-black text-slate-900 mb-1">{vendor.name}</h4>
                                <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tight mb-4">{vendor.category}</span>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <Mail className="w-3 h-3 text-slate-400" /> {vendor.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        GSTIN: <span className="text-slate-600">{vendor.gstin}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${vendor.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                        {vendor.status}
                                    </span>
                                    <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                        View Invoices <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
