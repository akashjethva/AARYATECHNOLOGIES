"use client";

import { Search, Phone, MapPin, ArrowRight, User, ArrowLeft, X, TrendingUp, History, ShieldCheck, Download, ExternalLink, Calendar, Map, CheckCircle2 } from "lucide-react";
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
    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-[#0f1115] w-full rounded-t-[3rem] border-t border-white/10 relative z-10 flex flex-col max-h-[92vh] overflow-hidden"
            >
                {/* Pull Handle */}
                <div className="w-full flex justify-center p-4">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                </div>

                {/* Modal Header */}
                <div className="px-8 pb-6 border-b border-white/5">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
                            {customer.name[0]}
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{customer.name}</h3>
                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                            <ShieldCheck size={10} className="text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Verified</span>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-1">{customer.city} • {customer.contact}</p>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide pb-24">

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#16181d] p-5 rounded-[2rem] border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                            <h4 className="text-xl font-bold text-white">₹ 1,25,000</h4>
                            <div className="flex items-center gap-1 mt-2">
                                <TrendingUp size={12} className="text-emerald-500" />
                                <span className="text-[10px] text-emerald-500 font-bold">+12%</span>
                            </div>
                        </div>
                        <div className="bg-[#16181d] p-5 rounded-[2rem] border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Due</p>
                            <h4 className="text-xl font-bold text-rose-500">₹ {customer.balance}</h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-2 italic">Visit: {customer.lastVisit}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Recent History</p>
                        <div className="space-y-6">
                            {(customer.history && customer.history.length > 0) ? (
                                customer.history.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-5 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative z-10">
                                                {item.type === 'PAYMENT' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <History size={16} className="text-indigo-400" />}
                                            </div>
                                            {idx !== customer.history.length - 1 && <div className="flex-1 w-0.5 border-l border-white/5 my-2 border-dashed"></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-600 tracking-wider mb-1">{item.date}</p>
                                                    <h5 className="font-bold text-white text-sm">{item.label}</h5>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-1">{item.mode}</p>
                                                </div>
                                                <p className={`font-bold text-sm ${item.amount.includes('+') ? 'text-emerald-400' : 'text-slate-300'}`}>{item.amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 bg-white/5 rounded-3xl text-center border border-dashed border-white/10">
                                    <p className="text-slate-500 text-sm font-medium">No recent transactions</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Operations</p>
                        <div className="grid grid-cols-2 gap-3">
                            <a href={`tel:${customer.phone}`} className="flex items-center gap-3 p-4 bg-indigo-600/10 rounded-2xl border border-indigo-600/20">
                                <Phone size={18} className="text-indigo-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Direct Call</span>
                            </a>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address || `${customer.name} ${customer.city}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10"
                            >
                                <MapPin size={18} className="text-slate-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Navigate</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Sticky Action */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f1115] via-[#0f1115] to-transparent">
                    <Link href={`/staff/entry?customer=${customer.id}`} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98]">
                        <TrendingUp size={20} />
                        Collect Payment
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
