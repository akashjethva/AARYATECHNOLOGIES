"use client";

import { Wallet, Users, ArrowUpRight, Plus, Activity, CreditCard, MoreHorizontal, TrendingUp, Calendar, Filter, X, Check, ChevronDown, Download, AlertCircle, Search, Edit2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Transaction {
    id: number;
    time: string;
    customer: string;
    amount: string;
    staff: string;
    mode: string;
    status: "Verified" | "Pending" | "Failed";
    date?: string;
    remarks?: string;
}

// Helper to get formatted date string (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

const initialTransactions: Transaction[] = [
    { id: 1, time: "10:45 AM", customer: "Shiv Shakti Traders", amount: "5,000", staff: "Rahul V.", mode: "Cash", status: "Verified", date: getTodayDate() },
    { id: 2, time: "11:12 AM", customer: "Jay Mataji Store", amount: "2,200", staff: "Amit K.", mode: "UPI", status: "Verified", date: getTodayDate() },
    { id: 3, time: "11:30 AM", customer: "Om Enterprise", amount: "10,000", staff: "Rahul V.", mode: "Cheque", status: "Pending", date: getTodayDate() },
    { id: 4, time: "12:05 PM", customer: "Ganesh Provision", amount: "1,500", staff: "Suresh P.", mode: "Cash", status: "Verified", date: getYesterdayDate() },
    { id: 5, time: "12:45 PM", customer: "Maruti Nandan", amount: "7,500", staff: "Vikram S.", mode: "Cash", status: "Verified", date: getYesterdayDate() },
    { id: 6, time: "01:15 PM", customer: "Khodiyar General", amount: "3,000", staff: "Amit K.", mode: "UPI", status: "Failed", date: getYesterdayDate() },
];

export default function AdminDashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Multi-Period Goal State
    const [goalPeriod, setGoalPeriod] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
    const [goals, setGoals] = useState({ Daily: 50000, Monthly: 1500000, Yearly: 10000000 });

    // Load goals from local storage
    useEffect(() => {
        const savedGoals = localStorage.getItem('payment_app_goals');
        if (savedGoals) {
            try {
                setGoals(JSON.parse(savedGoals));
            } catch (e) {
                console.error("Failed to parse goals", e);
            }
        }
    }, []);

    // Save goals when updated
    const updateGoal = (newAmount: number) => {
        const newGoals = { ...goals, [goalPeriod]: newAmount };
        setGoals(newGoals);
        localStorage.setItem('payment_app_goals', JSON.stringify(newGoals));
        setIsGoalModalOpen(false);
    };
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [tempGoal, setTempGoal] = useState("");
    const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);

    // Calculate Progress based on Period
    const calculateProgress = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const todayStr = getTodayDate();

        let periodTotal = 0;

        if (goalPeriod === 'Daily') {
            periodTotal = transactions
                .filter(t => t.date === todayStr && t.status === 'Verified' && !t.mode.includes("Debit"))
                .reduce((acc, curr) => acc + parseFloat(curr.amount.replace(/,/g, '')), 0);
        } else if (goalPeriod === 'Monthly') {
            periodTotal = transactions
                .filter(t => {
                    const tDate = new Date(t.date || '');
                    return t.status === 'Verified' && !t.mode.includes("Debit") && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                })
                .reduce((acc, curr) => acc + parseFloat(curr.amount.replace(/,/g, '')), 0);
        } else {
            periodTotal = transactions
                .filter(t => {
                    const tDate = new Date(t.date || '');
                    return t.status === 'Verified' && !t.mode.includes("Debit") && tDate.getFullYear() === currentYear;
                })
                .reduce((acc, curr) => acc + parseFloat(curr.amount.replace(/,/g, '')), 0);
        }

        const target = goals[goalPeriod];
        const percentage = Math.min(Math.round((periodTotal / target) * 100), 100);
        const isAchieved = periodTotal >= target;

        return { periodTotal, target, percentage, isAchieved };
    };

    const { periodTotal, target, percentage, isAchieved } = calculateProgress();

    // Filter & Search State
    const [dateFilter, setDateFilter] = useState("Jan 2026");
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState(""); // Specific date filter

    // Form State
    const [formData, setFormData] = useState({
        customer: "",
        amount: "",
        mode: "Cash",
        staff: "Rahul Varma",
        date: getTodayDate(),
        remarks: "",
        status: "Verified" as "Verified" | "Pending" | "Failed"
    });

    const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Jan 2026", "Dec 2025"];
    const filterOptions = ["All", "Cash", "UPI", "Cheque", "Pending", "Verified", "Failed"];

    const handleDateSelect = (option: string) => {
        setDateFilter(option);
        setIsDateOpen(false);
    };

    const handleFilterSelect = (option: string) => {
        setActiveFilter(option);
        setIsFilterOpen(false);
    };

    const handleSaveTransaction = () => {
        if (!formData.customer || !formData.amount) {
            alert("Please fill in Customer Name and Amount");
            return;
        }

        const newTxn: Transaction = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer: formData.customer,
            amount: Number(formData.amount).toLocaleString(),
            staff: formData.staff.split(' ')[0] + ' ' + (formData.staff.split(' ')[1]?.[0] || '') + '.',
            mode: formData.mode,
            status: formData.status,
            date: formData.date,
            remarks: formData.remarks
        };

        setTransactions([newTxn, ...transactions]);
        setIsEntryModalOpen(false);
        // Reset form
        setFormData({
            customer: "",
            amount: "",
            mode: "Cash",
            staff: "Rahul Varma",
            date: getTodayDate(),
            remarks: "",
            status: "Verified"
        });
    };

    // Filter Logic
    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = txn.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || txn.mode === activeFilter || txn.status === activeFilter;
        const matchesDate = !filterDate || txn.date === filterDate;
        return matchesSearch && matchesFilter && matchesDate;
    });

    // Credit State
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [recentCredits, setRecentCredits] = useState<any[]>([]);
    const [creditFormData, setCreditFormData] = useState({
        customer: "",
        type: "Credit" as "Credit" | "Debit",
        amount: "",
        remarks: "",
        date: getTodayDate()
    });

    // Mock Customers for Dropdown
    const customerList = [
        "Shiv Shakti Traders", "Jay Mataji Store", "Om Enterprise", "Ganesh Provision",
        "Maruti Nandan", "Khodiyar General", "Umiya Traders", "Balaji Kirana", "Sardar Stores"
    ];
    const [filteredCustomersForCredit, setFilteredCustomersForCredit] = useState<string[]>([]);

    // Load credits from local storage
    useEffect(() => {
        const savedCredits = localStorage.getItem('payment_app_credits');
        if (savedCredits) {
            try {
                setRecentCredits(JSON.parse(savedCredits));
            } catch (e) {
                console.error("Failed to parse credits", e);
            }
        }
    }, []);

    const handleSaveCredit = () => {
        if (!creditFormData.customer || !creditFormData.amount) {
            alert("Please fill in Customer Name and Amount");
            return;
        }

        // 1. Add to Recent Credits (Widget)
        const newCredit = {
            id: Date.now(),
            ...creditFormData,
            amount: Number(creditFormData.amount).toLocaleString()
        };
        const updatedCredits = [newCredit, ...recentCredits].slice(0, 10);
        setRecentCredits(updatedCredits);
        localStorage.setItem('payment_app_credits', JSON.stringify(updatedCredits));

        // 2. Add to Main Transactions (Live Feed)
        const newTxn: Transaction = {
            id: Date.now() + 1, // Ensure unique ID
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer: creditFormData.customer,
            amount: Number(creditFormData.amount).toLocaleString(),
            staff: "Admin",
            mode: creditFormData.type === 'Credit' ? 'Credit (+)' : 'Debit (-)', // Show explicitly
            status: "Verified",
            date: creditFormData.date,
            remarks: creditFormData.remarks
        };
        setTransactions([newTxn, ...transactions]);

        setIsCreditModalOpen(false);
        setCreditFormData({ customer: "", type: "Credit", amount: "", remarks: "", date: getTodayDate() });
    };

    const filterCustomers = (query: string) => {
        setCreditFormData({ ...creditFormData, customer: query });
        if (query) {
            const filetered = customerList.filter(c => c.toLowerCase().includes(query.toLowerCase()));
            setFilteredCustomersForCredit(filetered);
        } else {
            setFilteredCustomersForCredit([]);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 relative">

            {/* Action Header */}
            {/* Added z-50 to ensure dropdown stacks on top of subsequent elements */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 p-8 rounded-[2rem] border border-white/10 relative z-50 backdrop-blur-3xl shadow-2xl">

                {/* Background Effects Container - Clipped */}
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] -z-10">
                    <div className="absolute top-0 right-0 w-[400px] h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 hover:opacity-30 transition-opacity"></div>
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-bold text-indigo-200 mb-2 shadow-sm backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                        Live Collection Feed
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview</h1>
                    <p className="text-slate-300 mt-2 text-lg font-medium max-w-lg">Track your daily income, staff performance, and recent transactions in real-time.</p>
                </div>
                <div className="flex gap-4 relative z-20 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">

                    {/* Quick Credit Button (New) */}
                    <button
                        onClick={() => setIsCreditModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
                    >
                        <Zap size={20} className="fill-current" />
                        <span>Quick Credit</span>
                    </button>

                    <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span>New Entry</span>
                    </button>

                    <button
                        onClick={() => setIsHandoverModalOpen(true)}
                        className="flex items-center gap-2 bg-[#1e293b] hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-bold transition-colors border border-white/10 shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <Wallet size={20} className="text-emerald-400" />
                        <span>Handover</span>
                    </button>

                    {/* Date Dropdown */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setIsDateOpen(!isDateOpen)}
                            className="bg-white/5 hover:bg-white/15 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg border border-white/10 transition-all backdrop-blur-md min-w-[160px] justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-indigo-300 group-hover:text-white transition-colors" />
                                <span>{dateFilter}</span>
                            </div>
                            <ChevronDown size={16} className={`text-white/50 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isDateOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full mt-2 right-0 w-full min-w-[180px] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                                >
                                    {dateOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleDateSelect(opt)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${dateFilter === opt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Export Button */}
                    <button className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-4 rounded-2xl font-bold flex items-center justify-center transition-all border border-white/5 shrink-0" title="Export Report">
                        <Download size={22} />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" >
                <Card title="Today's Collection" value="₹ 45,200" icon={<TrendingUp />} trend="+15%" trendUp={true} color="bg-blue-600" href="/admin/collections" />
                <Card
                    title="Pending Handover"
                    value="₹ 12,500"
                    icon={<Users />}
                    trend="3 Staff"
                    trendUp={false}
                    color="bg-amber-600"
                    onClick={() => setIsHandoverModalOpen(true)}
                />
                <Card title="Active Staff" value="8 / 10" icon={<Activity />} trend="All Online" trendUp={true} color="bg-emerald-600" href="/admin/staff" />
                <Card title="Month Revenue" value="₹ 8.5L" icon={<Wallet />} trend="+12% vs last" trendUp={true} color="bg-purple-600" href="/admin/reports" />
            </div >

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Feed */}
                <div className="xl:col-span-2 bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[600px]">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Live Transactions</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Real-time payment feed from field staff</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-1 md:w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                />
                            </div>

                            {/* Date Filter Input */}
                            <div className="relative">
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold uppercase tracking-wider min-w-[150px]"
                                />
                            </div>

                            {/* Filter Button & Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`p-3 rounded-xl transition-colors border ${activeFilter !== 'All' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:text-white'}`}
                                >
                                    <Filter size={20} />
                                </button>
                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-1"
                                        >
                                            {filterOptions.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleFilterSelect(opt)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeFilter === opt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((txn) => (
                                <TransactionItem key={txn.id} {...txn} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <Filter size={48} className="mb-4 opacity-50" />
                                <p className="font-bold">No transactions found</p>
                                {(searchQuery || activeFilter !== 'All' || filterDate) && (
                                    <button
                                        onClick={() => { setSearchQuery(""); setActiveFilter("All"); setFilterDate(""); }}
                                        className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Widgets */}
                <div className="space-y-6">
                    {/* Recent Credits / Udhar Widget (New) */}
                    <div className="bg-[#1e293b]/60 rounded-[2.5rem] p-6 text-white border border-white/10 shadow-xl overflow-hidden relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Quick Credits</h3>
                            <Link href="/admin/customers" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
                        </div>

                        <div className="space-y-3">
                            {recentCredits.length > 0 ? (
                                recentCredits.slice(0, 4).map((credit) => (
                                    <div key={credit.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-xs text-white">{credit.customer}</p>
                                            <p className="text-[10px] text-slate-400">{credit.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${credit.type === 'Credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {credit.type === 'Credit' ? '+' : '-'} ₹{credit.amount}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{credit.type}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-xs text-center py-4">No recent entries</p>
                            )}
                        </div>
                        <button onClick={() => setIsCreditModalOpen(true)} className="w-full mt-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <Zap size={16} /> Add Quick Credit
                        </button>
                    </div>

                    {/* Staff Leaderboard */}
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradien-to-br from-indigo-500 to-purple-500 opacity-20 blur-[80px]"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Top Performers</h3>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/10">Today</span>
                            </div>
                            <div className="space-y-5">
                                <LeaderboardItem rank="1" name="Rahul Varma" amount="₹ 15k" />
                                <LeaderboardItem rank="2" name="Vikram Singh" amount="₹ 12k" />
                                <LeaderboardItem rank="3" name="Amit Kumar" amount="₹ 8k" />
                            </div>
                            <Link href="/admin/reports" className="block w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-colors border border-white/5 text-center">
                                View Full Report
                            </Link>
                        </div>
                    </div>

                    {/* Goal Widget */}
                    <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 border border-white/10 relative group z-30 !overflow-visible">

                        {/* Background Effects Container - Clipped */}
                        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                            <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity w-32 h-32 bg-white rounded-full blur-2xl translate-x-8 -translate-y-8"></div>
                        </div>

                        <div className="flex justify-between items-start mb-2 relative z-20">
                            <div className="relative">
                                <button
                                    onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
                                    className="font-bold opacity-80 flex items-center gap-2 hover:bg-white/10 px-2 py-1 -ml-2 rounded-lg transition-colors cursor-pointer"
                                    title="Switch Goal Period"
                                >
                                    <Zap size={16} className="text-yellow-400" fill="currentColor" />
                                    {goalPeriod} Goal
                                    <ChevronDown size={14} className={`opacity-60 transition-transform ${isGoalDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isGoalDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsGoalDropdownOpen(false)}></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                                className="absolute top-full left-0 mt-2 bg-[#020617] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] w-44 min-w-max ring-1 ring-white/10"
                                            >
                                                {['Daily', 'Monthly', 'Yearly'].map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => { setGoalPeriod(p as any); setIsGoalDropdownOpen(false); }}
                                                        className={`w-full text-left px-5 py-3 text-sm font-bold hover:bg-white/5 transition-colors flex items-center justify-between ${goalPeriod === p ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                                                    >
                                                        {p}
                                                        {goalPeriod === p && <Check size={16} className="text-blue-400" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => { setTempGoal(goals[goalPeriod].toString()); setIsGoalModalOpen(true); }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                title={`Edit ${goalPeriod} Goal`}
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>

                        <div className="flex items-end gap-2 mb-4 relative z-10">
                            <span className="text-4xl font-extrabold tracking-tight">{percentage}%</span>
                            <span className="text-lg opacity-60 font-medium mb-1">Achieved</span>
                        </div>

                        <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden relative z-10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] ${isAchieved ? 'bg-emerald-400' : 'bg-white'}`}
                            ></motion.div>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs font-medium opacity-80 relative z-10">
                            <span>₹ {periodTotal.toLocaleString()} / {target.toLocaleString()}</span>
                            {isAchieved ? (
                                <span className="text-emerald-300 font-bold flex items-center gap-1">🎉 Completed!</span>
                            ) : (
                                <span>₹ {(target - periodTotal).toLocaleString()} to go</span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Credit Modal */}
            <AnimatePresence>
                {isCreditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div onClick={() => setIsCreditModalOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <h3 className="text-lg font-bold text-white">Quick Credit Entry</h3>
                                <button onClick={() => setIsCreditModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={creditFormData.customer}
                                            onChange={(e) => filterCustomers(e.target.value)}
                                            placeholder="Search customer..."
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-bold"
                                        />
                                        {filteredCustomersForCredit.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-[#0f172a] border border-white/10 rounded-xl mt-1 max-h-40 overflow-y-auto z-50 shadow-xl">
                                                {filteredCustomersForCredit.map(c => (
                                                    <div
                                                        key={c}
                                                        onClick={() => { setCreditFormData({ ...creditFormData, customer: c }); setFilteredCustomersForCredit([]); }}
                                                        className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm font-medium text-slate-300 hover:text-white"
                                                    >
                                                        {c}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                                        <div className="flex p-1 bg-[#0f172a] rounded-xl border border-white/10">
                                            {['Credit', 'Debit'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setCreditFormData({ ...creditFormData, type: type as any })}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${creditFormData.type === type ? (type === 'Credit' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    {type === 'Credit' ? 'Jama (+)' : 'Udhar (-)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
                                        <input
                                            type="number"
                                            value={creditFormData.amount}
                                            onChange={(e) => setCreditFormData({ ...creditFormData, amount: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-bold"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                                    <textarea
                                        value={creditFormData.remarks}
                                        onChange={(e) => setCreditFormData({ ...creditFormData, remarks: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-medium placeholder:text-slate-600 resize-none"
                                        placeholder="Add notes..."
                                        rows={2}
                                    />
                                </div>

                                <button onClick={handleSaveCredit} className="w-full py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 mt-2">
                                    Save Entry
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Goal Modal */}
            <AnimatePresence>
                {isGoalModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div onClick={() => setIsGoalModalOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Set {goalPeriod} Goal</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Amount (₹)</label>
                                    <input type="number" value={tempGoal} onChange={(e) => setTempGoal(e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 font-bold text-xl" autoFocus />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsGoalModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button onClick={() => updateGoal(Number(tempGoal))} className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">Update Goal</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* New Entry Modal */}
            <AnimatePresence>
                {isEntryModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEntryModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">New Transaction</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-1">Record a new payment collection</p>
                                </div>
                                <button onClick={() => setIsEntryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
                                        <input
                                            type="text"
                                            placeholder="Search or enter customer..."
                                            value={formData.customer}
                                            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Mode</label>
                                        <select
                                            value={formData.mode}
                                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer appearance-none"
                                        >
                                            <option>Cash</option>
                                            <option>UPI</option>
                                            <option>Cheque</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Collected By</label>
                                        <select
                                            value={formData.staff}
                                            onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer appearance-none"
                                        >
                                            <option>Rahul Varma</option>
                                            <option>Amit Kumar</option>
                                            <option value="Admin">Admin (Self)</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                                        <textarea
                                            placeholder="Add any notes..."
                                            rows={3}
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveTransaction}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center justify-center gap-3 border border-indigo-500/50 mt-6"
                                >
                                    <Plus size={24} strokeWidth={3} /> Save Transaction
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pending Handover Details Modal */}
            <AnimatePresence>
                {isHandoverModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHandoverModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Pending Handover</h3>
                                    <p className="text-amber-500 text-xs font-bold mt-1">Cash held by staff</p>
                                </div>
                                <button onClick={() => setIsHandoverModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <HandoverItem name="Rahul Varma" amount="₹ 5,000" time="Since 2 days" />
                                <HandoverItem name="Amit Kumar" amount="₹ 4,500" time="Since Yesterday" />
                                <HandoverItem name="Vikram Singh" amount="₹ 3,000" time="Today" />

                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center px-2">
                                    <span className="text-slate-400 font-bold">Total Pending</span>
                                    <span className="text-2xl font-bold text-white">₹ 12,500</span>
                                </div>
                                <button className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-600/20 active:scale-95 transition-all">
                                    Request Settlement
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div >
    );
}

function Card({ title, value, icon, trend, trendUp, color, href, onClick }: any) {
    const Content = (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-[#1e293b]/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer hover:bg-[#1e293b] active:scale-95 transition-all`}
            onClick={onClick}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color} w-32 h-32 rounded-full blur-2xl translate-x-8 -translate-y-8`}></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-black/20`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold relative z-10">
                <span className={`px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'}`}>
                    {trend}
                </span>
                <span className="text-slate-500">vs yesterday</span>
            </div>
        </motion.div>
    );

    if (href && !onClick) {
        return <Link href={href}>{Content}</Link>;
    }
    return Content;
}

function TransactionItem({ time, customer, amount, staff, mode, status, date }: Transaction) {
    return (
        <div className="group flex items-center justify-between p-5 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-slate-400 text-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg transition-all duration-300">
                    {customer[0]}
                </div>
                <div>
                    <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{customer}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-500">{time}</span>
                        {/* Show date if meaningful, otherwise redundant with time */}
                        {date && <span className="text-[10px] text-slate-600 font-bold bg-white/5 px-1 rounded">{date}</span>}
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-xs font-bold text-slate-400">{staff}</span>
                        {/* Show small badge for status if not Verified */}
                        {status !== 'Verified' && (
                            <span className={`text-[10px] px-1.5 rounded border ${status === 'Pending' ? 'border-amber-500/50 text-amber-500' : 'border-red-500/50 text-red-500'}`}>{status}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <h4 className="font-bold text-white text-lg tracking-tight">₹ {amount}</h4>
                <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{mode}</span>
                    <span className={`w-2 h-2 rounded-full ${status === 'Verified' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                </div>
            </div>
        </div>
    )
}

function LeaderboardItem({ rank, name, amount }: any) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-sm ${rank === '1' ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-[#1e293b] text-slate-400'}`}>
                {rank}
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm text-slate-200">{name}</p>
            </div>
            <p className="font-bold text-emerald-400">{amount}</p>
        </div>
    )
}

function HandoverItem({ name, amount, time }: any) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    {name[0]}
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">{name}</h4>
                    <p className="text-xs text-slate-500">{time}</p>
                </div>
            </div>
            <span className="font-bold text-white">{amount}</span>
        </div>
    )
}
