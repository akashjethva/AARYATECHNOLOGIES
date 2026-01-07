"use client";

import { Search, Phone, MapPin, ArrowRight, User, ArrowLeft, X, TrendingUp, History, ShieldCheck, Download, ExternalLink, Calendar, Map, CheckCircle2, ArrowUpRight, ArrowDownRight, Bell, Link as LinkIcon, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadFromStorage, INITIAL_CUSTOMERS } from "@/utils/storage";

export default function StaffCustomers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const router = useRouter();

    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        setCustomers(loadFromStorage("customers", INITIAL_CUSTOMERS));
    }, []);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-20 px-6 pt-4 min-h-screen bg-[#0f1115]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-2xl font-bold text-white leading-none">Customers</h1>
            </div>

            {/* Search Bar - Premium */}
            <div className="relative mb-6 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-[#16181d] border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-lg font-medium"
                    placeholder="Search name, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Customer List */}
            <div className="space-y-4">
                {filtered.map((customer, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="bg-[#1e2128] rounded-3xl p-5 border border-white/5 relative overflow-hidden active:scale-[0.95] transition-transform cursor-pointer"
                    >
                        {/* Card Highlight */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-50"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 shadow-inner">
                                    {customer.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{customer.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{customer.city} • {customer.contact}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Balance</p>
                                <p className={`text-lg font-bold ${customer.balance === "0" ? 'text-emerald-500' : 'text-white'}`}>
                                    ₹ {customer.balance}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <a href={`tel:${customer.phone}`} className="flex-1 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-600/20">
                                <Phone size={14} /> Call Now
                            </a>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address || `${customer.name} ${customer.city}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 rounded-xl bg-[#16181d] text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/5 transition-colors border border-white/5"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin size={14} /> Navigate
                            </a>
                            <Link href="/staff/entry" className="py-3 px-4 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
            {/* Customer Details Modal (Mobileized Deep Dive) */}
            <AnimatePresence>
                {selectedCustomer && (
                    <CustomerDetailsModal
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}


function CustomerDetailsModal({ customer, onClose }: { customer: any, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState("Transaction Timeline");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#0b0c10] w-full max-w-7xl rounded-[2.5rem] border border-white/5 shadow-2xl relative z-10 overflow-hidden h-[90vh] max-h-[900px] flex flex-col"
            >
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#0b0c10] shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-3xl bg-[#4f46e5] flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-indigo-500/20">
                            {customer.name[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{customer.name}</h3>
                                <span className="bg-[#059669] text-white border border-emerald-400/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-900/20">Active</span>
                            </div>
                            <div className="flex items-center gap-6 text-slate-400 text-sm mt-2 font-medium">
                                <span className="flex items-center gap-2"><Phone size={16} className="text-slate-500" /> {customer.phone || customer.contact}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                <span className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" /> {customer.city}, East Zone</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="h-12 w-12 flex items-center justify-center bg-[#1c1f26] hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white border border-white/5">
                            <Download size={20} />
                        </button>
                        <button onClick={onClose} className="h-12 w-12 flex items-center justify-center bg-[#1c1f26] hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white border border-white/5">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* LEFT PANEL - Financial Status */}
                    <div className="w-full md:w-[450px] bg-[#0b0c10] p-8 border-r border-white/5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                        <p className="text-[11px] font-extrabold text-[#64748b] uppercase tracking-[0.2em] mb-2">Financial Status</p>

                        {/* Total Collections Card */}
                        <div className="bg-[#151921] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute top-4 right-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500">
                                <ArrowUpRight size={120} />
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Collections</p>
                            <h4 className="text-[2.75rem] leading-none font-extrabold text-white tracking-tight">₹ 1,25,000</h4>
                            <div className="flex items-center gap-2 mt-4">
                                <TrendingUp size={16} className="text-emerald-500" />
                                <span className="text-emerald-500 text-xs font-bold">+12% from last month</span>
                            </div>
                        </div>

                        {/* Current Balance Card */}
                        <div className="bg-[#151921] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute top-4 right-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500">
                                <ArrowDownRight size={120} className="text-rose-500" />
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Current Balance</p>
                            <h4 className="text-[2.75rem] leading-none font-extrabold text-white tracking-tight">₹ {customer.balance}</h4>
                            <p className="text-slate-600 text-[10px] font-bold mt-4 uppercase tracking-wide">Next expected collection: Jan 05</p>
                        </div>

                        {/* Collection Trend */}
                        <div className="bg-[#151921] p-6 rounded-[2rem] border border-white/5 flex-1 min-h-[220px] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Collection Trend</p>
                                <span className="text-white text-[10px] font-bold bg-[#059669] px-3 py-1 rounded-full shadow-lg shadow-emerald-900/20">6 MONTHS</span>
                            </div>
                            <div className="flex-1 flex items-end gap-3 justify-between px-1 pb-1">
                                {[30, 45, 25, 60, 40, 75, 50, 80].map((h, i) => (
                                    <div key={i} className={`w-full rounded-t-sm relative group overflow-hidden ${i === 7 ? 'bg-[#6366f1]' : 'bg-[#1e293b]/50'}`} style={{ height: `${h}%` }}>
                                        <div className={`absolute bottom-0 left-0 right-0 top-0 bg-[#818cf8] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm duration-300`}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 px-1">
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider">JULY</span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider">TODAY</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <button className="bg-[#151921] hover:bg-[#1f2937] border border-white/5 rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-black/20">
                                <Bell size={20} className="text-[#818cf8] group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-300 text-center leading-tight tracking-wide">SEND<br />ALERT</span>
                            </button>
                            <button className="bg-[#064e3b] hover:bg-[#065f46] border border-white/5 rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-emerald-900/20">
                                <MapPin size={20} className="text-white group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-white text-center leading-tight tracking-wide">NAVIGATE</span>
                            </button>
                            <button className="bg-[#151921] hover:bg-[#1f2937] border border-white/5 rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-black/20">
                                <LinkIcon size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-300 text-center leading-tight tracking-wide">KYC<br />LINK</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL - Timeline & Details */}
                    <div className="flex-1 bg-[#050608] p-10 flex flex-col overflow-hidden relative border-l border-white/5">
                        {/* Tabs */}
                        <div className="flex items-center gap-10 border-b border-white/5 pb-0 mb-10 overflow-x-auto scrollbar-hide">
                            {["Transaction Timeline", "Communication", "KYC Docs"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative pb-4 text-sm font-bold transition-colors whitespace-nowrap tracking-wide ${activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    {tab}
                                    {tab === "Communication" && <span className="ml-3 bg-[#1e293b] text-slate-300 text-[10px] px-2 py-0.5 rounded-full">3</span>}
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6366f1] shadow-[0_0_20px_rgba(99,102,241,0.5)] rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-10">
                            {/* Jan 02 */}
                            <div className="relative pl-10 border-l border-white/5 pb-2 last:pb-0 last:border-transparent group">
                                <div className="absolute -left-3.5 top-0 h-7 w-7 rounded-full bg-[#0b0c10] border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">JAN 02, 2026</p>
                                        <h4 className="text-xl font-bold text-white mb-1">Payment Received</h4>
                                        <p className="text-sm text-slate-400 font-medium">Processed by <span className="text-slate-200">Rahul Varma</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-emerald-400 mb-1">+ ₹ 5,000</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CASH</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dec 28 */}
                            <div className="relative pl-10 border-l border-white/5 pb-2 last:pb-0 last:border-transparent group">
                                <div className="absolute -left-3.5 top-0 h-7 w-7 rounded-full bg-[#0b0c10] border border-blue-500/30 flex items-center justify-center group-hover:border-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                    <TrendingUp size={14} className="text-blue-500" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">DEC 28, 2025</p>
                                        <h4 className="text-xl font-bold text-white mb-1">Invoice Issued</h4>
                                        <p className="text-sm text-slate-400 font-medium">Processed by <span className="text-slate-200">System Admin</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white mb-1">₹ 12,000</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TAX BILL</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dec 22 */}
                            <div className="relative pl-10 border-l border-white/5 pb-2 last:pb-0 last:border-transparent group">
                                <div className="absolute -left-3.5 top-0 h-7 w-7 rounded-full bg-[#0b0c10] border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    <Map size={14} className="text-amber-500" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">DEC 22, 2025</p>
                                        <h4 className="text-xl font-bold text-white mb-1">Site Visit Confirmed</h4>
                                        <p className="text-sm text-slate-400 font-medium">Processed by <span className="text-slate-200">Amit Kumar</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white mb-1">Details Updated</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CHECK-IN</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dec 15 */}
                            <div className="relative pl-10 border-l border-white/5 pb-2 last:pb-0 last:border-transparent group">
                                <div className="absolute -left-3.5 top-0 h-7 w-7 rounded-full bg-[#0b0c10] border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <CheckCircle size={14} className="text-emerald-500" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">DEC 15, 2025</p>
                                        <h4 className="text-xl font-bold text-white mb-1">Payment Received</h4>
                                        <p className="text-sm text-slate-400 font-medium">Processed by <span className="text-slate-200">Rahul Varma</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-emerald-400 mb-1">+ ₹ 2,000</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UPI</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Report Banner */}
                        <div className="mt-8 pt-0">
                            <div className="bg-gradient-to-r from-[#1e1b4b] to-[#1e1b4b] border border-indigo-500/30 rounded-[2rem] p-6 flex items-center justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-2xl">
                                <div className="absolute inset-0 bg-[#4f46e5]/10 blur-2xl group-hover:bg-[#4f46e5]/20 transition-colors"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                        <FileText size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">Need a custom report?</h4>
                                        <p className="text-indigo-200 text-sm font-medium mt-1">Export specific filters as a PDF or Excel.</p>
                                    </div>
                                </div>
                                <button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 relative z-10 text-sm">
                                    Generate Custom PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    )
}
