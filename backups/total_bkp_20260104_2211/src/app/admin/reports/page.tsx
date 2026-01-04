"use client";

import { FileText, Download, Calendar, ArrowUpRight, TrendingUp, Users, Wallet, CreditCard, ChevronDown, Filter, PieChart, MapPin, Share2, DollarSign, Activity, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

// Mock Data for Charts
const weeklyData = [
    { day: "Mon", value: 12000, label: "12k" },
    { day: "Tue", value: 18500, label: "18.5k" },
    { day: "Wed", value: 15000, label: "15k" },
    { day: "Thu", value: 22000, label: "22k" },
    { day: "Fri", value: 28000, label: "28k" },
    { day: "Sat", value: 25000, label: "25k" },
    { day: "Sun", value: 10000, label: "10k" },
];

const monthlyData = [
    { day: "W1", value: 85000, label: "85k" },
    { day: "W2", value: 92000, label: "92k" },
    { day: "W3", value: 110000, label: "1.1L" },
    { day: "W4", value: 105000, label: "1.05L" },
];

export default function ReportsPage() {
    const [chartPeriod, setChartPeriod] = useState<'Week' | 'Month'>('Week');
    const [activeTab, setActiveTab] = useState<'Overview' | 'Staff' | 'Expenses'>('Overview');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedDate, setSelectedDate] = useState('Jan 2026');
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedStat, setSelectedStat] = useState('revenue');

    // Chart Data Selection
    const chartData = chartPeriod === 'Week' ? weeklyData : monthlyData;
    const maxChartValue = Math.max(...chartData.map(d => d.value));

    // Stats Data
    const stats = {
        revenue: "8,45,000",
        growth: "+12.5%",
        collections: "5,20,000",
        pending: "3,25,000",
        staffActive: 4
    };

    const monthlyStats = [
        { name: 'Revenue', value: '₹ 8.45L', change: '+12%', color: 'indigo' },
        { name: 'Collections', value: '₹ 5.20L', change: '+8%', color: 'emerald' },
        { name: 'Expenses', value: '₹ 45k', change: '-2%', color: 'rose' },
        { name: 'Pending', value: '₹ 3.25L', change: '+5%', color: 'amber' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Reports & Analytics</h2>
                    <p className="text-slate-400 font-medium">Business performance derived from your data.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Date Selector */}
                    <div className="relative flex-1 md:flex-none">
                        <button
                            onClick={() => setIsDateOpen(!isDateOpen)}
                            className="w-full md:w-auto bg-[#1e293b] border border-white/10 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-between gap-3 text-sm hover:bg-white/5 transition-colors"
                        >
                            <span className="flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> {selectedDate}</span>
                            <ChevronDown size={16} />
                        </button>
                        <AnimatePresence>
                            {isDateOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl z-50 w-48 overflow-hidden"
                                >
                                    {['Jan 2026', 'Dec 2025', 'Nov 2025'].map(date => (
                                        <button
                                            key={date}
                                            onClick={() => { setSelectedDate(date); setIsDateOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => alert("Report Exported!")}
                        disabled={isExporting}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-sm"
                    >
                        {isExporting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : <Download size={18} />}
                        <span className="hidden md:inline">Download PDF</span>
                        <span className="md:hidden">PDF</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {monthlyStats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => setSelectedStat(stat.name.toLowerCase())}
                        className={`bg-[#1e293b]/40 backdrop-blur-sm p-5 rounded-[2rem] border transition-all cursor-pointer group ${selectedStat === stat.name.toLowerCase() ? 'border-indigo-500/50 bg-[#1e293b]/80' : 'border-white/5 hover:bg-[#1e293b]/60'}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{stat.name}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{stat.change}</span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                        <div className={`h-1 w-full rounded-full mt-3 overflow-hidden bg-slate-700/30`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '70%' }}
                                className={`h-full bg-${stat.color}-500`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Graph Section */}
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2.5rem] border border-white/5 p-6 md:p-8 relative overflow-hidden shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" size={20} />
                            Revenue Trends
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Based on transactions from {selectedDate}</p>
                    </div>
                    <div className="hidden md:flex bg-white/5 rounded-lg p-1">
                        {['Week', 'Month'].map(p => (
                            <button
                                key={p}
                                onClick={() => setChartPeriod(p as any)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${chartPeriod === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simulated Chart Container */}
                <div className="h-64 w-full flex items-end gap-3 md:gap-6 relative z-10 px-2 pb-4">
                    {/* Y-Axis Grid Lines (Visual only) */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full h-px bg-white/5 border-dashed border-b border-white/5"></div>
                        ))}
                    </div>

                    {/* Bars */}
                    {chartData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col justify-end items-center gap-2 group/bar cursor-pointer min-w-[20px] h-full">
                            <div className="relative w-full h-full flex items-end justify-center">
                                {/* Tooltip */}
                                <div className="absolute -top-10 bg-white text-indigo-950 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl">
                                    ₹ {data.value.toLocaleString()}
                                </div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(data.value / maxChartValue) * 100}%` }}
                                    transition={{ duration: 1, type: "spring", bounce: 0.2, delay: index * 0.1 }}
                                    className={`w-full max-w-[50px] rounded-t-lg transition-all duration-300 relative overflow-hidden ${index === chartData.length - 1
                                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                                        : 'bg-gradient-to-t from-indigo-600 to-indigo-400 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                                </motion.div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 group-hover/bar:text-white transition-colors">{data.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Reports Tabs */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setActiveTab('Overview')} className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'Overview' ? 'bg-white text-indigo-950 shadow-lg shadow-white/10' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        Detailed Overview
                    </button>
                    <button onClick={() => setActiveTab('Staff')} className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'Staff' ? 'bg-white text-indigo-950 shadow-lg shadow-white/10' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        Staff Performance
                    </button>
                    <button onClick={() => setActiveTab('Expenses')} className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'Expenses' ? 'bg-white text-indigo-950 shadow-lg shadow-white/10' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                        Expense Analysis
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'Overview' && (
                            <div className="bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
                                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                    <FileText className="text-indigo-400" size={20} /> Latest Transaction Log
                                </h3>
                                {/* Mobile Card List */}
                                <div className="md:hidden space-y-4">
                                    <div className="text-center text-slate-500 py-4 font-medium">Swipe table functionality or switch to iPad for full data tables</div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-white">Shiv Shakti Traders</span>
                                            <span className="font-bold text-emerald-400">₹ 15,000</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-400">
                                            <span>Today, 10:30 AM</span>
                                            <span className="uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Paid</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-white">Om Enterprise</span>
                                            <span className="font-bold text-emerald-400">₹ 8,200</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-400">
                                            <span>Yesterday, 4:00 PM</span>
                                            <span className="uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Paid</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                                <th className="px-6 py-4">Transaction Details</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-white">
                                            <tr className="group hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-lg">Shiv Shakti Traders</p>
                                                    <p className="text-slate-500 text-xs">Payment for Invoice #001</p>
                                                </td>
                                                <td className="px-6 py-4"><span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">Sales</span></td>
                                                <td className="px-6 py-4 text-slate-300">Jan 02, 2026</td>
                                                <td className="px-6 py-4 text-right font-bold text-xl">₹ 15,000</td>
                                                <td className="px-6 py-4 text-center"><span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase">Completed</span></td>
                                            </tr>
                                            <tr className="group hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-lg">Om Enterprise</p>
                                                    <p className="text-slate-500 text-xs">Monthly Subscription</p>
                                                </td>
                                                <td className="px-6 py-4"><span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">Service</span></td>
                                                <td className="px-6 py-4 text-slate-300">Jan 01, 2026</td>
                                                <td className="px-6 py-4 text-right font-bold text-xl">₹ 8,200</td>
                                                <td className="px-6 py-4 text-center"><span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase">Completed</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Staff' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { name: "Rahul Varma", sales: "2.4L", visits: 145, status: "Active", color: "emerald", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
                                    { name: "Amit Kumar", sales: "1.8L", visits: 110, status: "On Route", color: "blue", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" },
                                    { name: "Suresh Patil", sales: "90k", visits: 85, status: "Break", color: "amber", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh" },
                                ].map((staff, idx) => (
                                    <div key={idx} className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 p-1">
                                                <img src={staff.img} alt={staff.name} className="h-full w-full rounded-xl bg-[#0f172a]" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{staff.name}</h3>
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded w-fit mt-1 uppercase ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    staff.status === 'On Route' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                                                    }`}>{staff.status}</div>
                                            </div>
                                            <div className="ml-auto p-2 bg-white/5 rounded-full text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                                <ArrowUpRight size={20} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5">
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Sales</p>
                                                <p className="text-2xl font-black text-white">₹ {staff.sales}</p>
                                            </div>
                                            <div className="bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5">
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Visits</p>
                                                <p className="text-2xl font-black text-white">{staff.visits}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Expenses' && (
                            <div className="space-y-6">
                                {/* Top Expense Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Outflow</p>
                                                <h3 className="text-3xl font-black text-white tracking-tight">₹ 45,000</h3>
                                            </div>
                                            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                                                <TrendingUp size={24} className="rotate-180" />
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 w-[45%]"></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Payouts</p>
                                                <h3 className="text-3xl font-black text-white tracking-tight">₹ 12,500</h3>
                                            </div>
                                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                                                <Users size={24} />
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 w-[30%]"></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-xl flex items-center gap-4">
                                        <div className="relative w-20 h-20 shrink-0">
                                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="20" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="20" strokeDasharray="150" strokeDashoffset="50" />
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="20" strokeDasharray="100" strokeDashoffset="200" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">Expense Split</h4>
                                            <div className="text-xs text-slate-400 space-y-1">
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Operations (60%)</div>
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Salary (40%)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Expense List */}
                                <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
                                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                        <FileText className="text-rose-400" size={20} /> Monthly Expense Log
                                    </h3>

                                    {/* Mobile Card List */}
                                    <div className="md:hidden space-y-4">
                                        {[{ title: "Office Rent", amount: "15,000", date: "Jan 01" }, { title: "Staff Bonus", amount: "5,000", date: "Jan 02" }, { title: "Internet Bill", amount: "1,200", date: "Jan 03" }].map((exp, i) => (
                                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-white">{exp.title}</span>
                                                    <span className="font-bold text-rose-400">- ₹ {exp.amount}</span>
                                                </div>
                                                <div className="text-xs text-slate-400">{exp.date}, 2026</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10 text-slate-400 text-sm font-bold uppercase tracking-wider">
                                                    <th className="px-6 py-4">Expense Details</th>
                                                    <th className="px-6 py-4">Category</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4 text-right">Amount</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-white">
                                                <tr className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4"><p className="font-bold text-lg">Office Rent</p></td>
                                                    <td className="px-6 py-4"><span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">Operations</span></td>
                                                    <td className="px-6 py-4 text-slate-300">Jan 01, 2026</td>
                                                    <td className="px-6 py-4 text-right font-bold text-xl text-rose-400">₹ 15,000</td>
                                                    <td className="px-6 py-4 text-center"><span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase">Paid</span></td>
                                                </tr>
                                                <tr className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4"><p className="font-bold text-lg">Staff Bonus</p></td>
                                                    <td className="px-6 py-4"><span className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-white/5">Salary</span></td>
                                                    <td className="px-6 py-4 text-slate-300">Jan 02, 2026</td>
                                                    <td className="px-6 py-4 text-right font-bold text-xl text-rose-400">₹ 5,000</td>
                                                    <td className="px-6 py-4 text-center"><span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase">Paid</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
