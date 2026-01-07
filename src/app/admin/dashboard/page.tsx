"use client";

import { Wallet, Users, ArrowUpRight, Plus, Activity, CreditCard, MoreHorizontal, TrendingUp, Calendar, Filter, X, Check, ChevronDown, Download, AlertCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import GoalTracker from "@/components/GoalTracker";
import { EnhancedTransactionItem } from "@/components/EnhancedTransactionItem";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import { useCurrency } from "@/hooks/useCurrency";

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
    // Load from storage or fallback to initialTransactions
    // process this in useEffect to avoid hydration mismatch
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isLoaded, setIsLoaded] = useState(false);
    const { formatCurrency } = useCurrency();

    // Initial Load
    useEffect(() => {
        const saved = loadFromStorage('transactions', initialTransactions);
        if (saved && Array.isArray(saved) && saved.length > 0) {
            setTransactions(saved);
        }
        setIsLoaded(true);
    }, []);

    // Persist changes
    useEffect(() => {
        if (isLoaded) {
            saveToStorage('transactions', transactions);
            // Trigger a custom event to notify other components immediately if needed
            // But storage event listener in Layout should be enough for cross-window, 
            // for same-window updates we might need window.dispatchEvent if setupStorageSync doesn't catch same-window storage.setItem
            // StorageEvent only fires on OTHER windows.
            // We need a custom event for same-window sync or just rely on Layout re-mounting? 
            // Layout won't re-mount. Layout needs a custom listener.
            window.dispatchEvent(new Event('transaction-updated'));
        }
    }, [transactions, isLoaded]);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportButtonRef = useRef<HTMLButtonElement>(null);
    const [exportMenuPosition, setExportMenuPosition] = useState({ top: 0, left: 0 });

    // Filter & Search State
    const [dateFilter, setDateFilter] = useState("Jan 2026");
    const dateButtonRef = useRef<HTMLButtonElement>(null);
    const [dateMenuPosition, setDateMenuPosition] = useState({ top: 0, left: 0, width: 0 });

    const handleDateClick = () => {
        if (isDateOpen) {
            setIsDateOpen(false);
        } else {
            if (dateButtonRef.current) {
                const rect = dateButtonRef.current.getBoundingClientRect();
                setDateMenuPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width
                });
                setIsDateOpen(true);
            }
        }
    };

    const handleExportClick = () => {
        if (isExportMenuOpen) {
            setIsExportMenuOpen(false);
        } else {
            if (exportButtonRef.current) {
                const rect = exportButtonRef.current.getBoundingClientRect();
                setExportMenuPosition({
                    top: rect.bottom + 8,
                    left: rect.left
                });
                setIsExportMenuOpen(true);
            }
        }
    };
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState(""); // Specific date filter
    const [showDropdown, setShowDropdown] = useState(false);

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

    const mockCustomers = [
        "Shiv Shakti Traders",
        "Jay Mataji Store",
        "Om Enterprise",
        "Ganesh Provision",
        "Maruti Nandan",
        "Khodiyar General",
        "Umiya Traders",
        "Balaji Kirana",
        "Sardar Stores"
    ];

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

    // Action Handlers
    const handleVerifyTransaction = (id: number | string) => {
        setTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, status: t.status === 'Verified' ? 'Pending' : 'Verified' } : t
        ));
    };

    const handleDeleteTransaction = (id: number | string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    const handleViewTransaction = (item: any) => {
        setFormData({
            customer: item.customer,
            amount: item.amount.replace(/,/g, ''),
            mode: item.mode,
            staff: item.staff.replace(/\.$/, ''), // Remove trailing dot if exists
            date: item.date || getTodayDate(),
            remarks: item.remarks || "",
            status: item.status
        });
        setIsEntryModalOpen(true);
    };

    // State for Single Receipt Modal
    const [activeReceipt, setActiveReceipt] = useState<any>(null);

    const handleDownloadReceipt = (item: any) => {
        setActiveReceipt(item);
        // We need a slight delay to let state update and render the modal/hidden view before printing
        // But since we are reusing the Staff History logic, let's keep it simple:
        // Open a "Receipt View" modal which has the download button, OR just auto-download?
        // User asked for "Download Receipt", let's open the receipt modal same as Staff History for consistency.
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 relative printable-area">

            {/* Action Header */}
            {/* Added z-50 to ensure dropdown stacks on top of subsequent elements */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 p-8 rounded-[2rem] border border-white/10 relative z-50 backdrop-blur-3xl shadow-2xl overflow-visible">

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
                    {/* Advanced Export Menu */}
                    <div className="relative shrink-0">
                        <button
                            ref={exportButtonRef}
                            onClick={handleExportClick}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-4 rounded-2xl font-bold flex items-center justify-center transition-all border border-white/5 group relative overflow-hidden"
                            title="Export Report"
                        >
                            <Download size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
                            {isExportMenuOpen && (
                                <motion.div
                                    layoutId="exportGlow"
                                    className="absolute inset-0 bg-indigo-600/20 rounded-2xl"
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </button>
                    </div>

                    {/* Export Menu Portal - Rendered at body level to avoid clipping/positioning issues */}
                    {typeof window !== 'undefined' && isExportMenuOpen && createPortal(
                        <AnimatePresence>
                            {isExportMenuOpen && exportMenuPosition.top > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="fixed w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[10001] p-1"
                                    style={{
                                        top: `${exportMenuPosition.top}px`,
                                        left: `${exportMenuPosition.left}px`
                                    }}
                                >
                                    {/* Invisible full-screen backdrop for click-outside */}
                                    <div
                                        className="fixed inset-0 z-[-1]"
                                        onClick={() => setIsExportMenuOpen(false)}
                                    />

                                    <button
                                        onClick={() => {
                                            const csvContent = "data:text/csv;charset=utf-8,"
                                                + "Time,Customer,Amount,Staff,Mode,Status,Date\n"
                                                + filteredTransactions.map(t => `${t.time},${t.customer},${t.amount},${t.staff},${t.mode},${t.status},${t.date}`).join("\n");
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 group relative z-10"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                            <Download size={16} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Export as CSV</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{filteredTransactions.length} records</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const csvContent = "data:text/csv;charset=utf-8,"
                                                + "Time,Customer,Amount,Staff,Mode,Status,Date\n"
                                                + filteredTransactions.map(t => `${t.time},${t.customer},${t.amount.replace(/,/g, '')},${t.staff},${t.mode},${t.status},${t.date}`).join("\n");
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `transaction_report_${new Date().toISOString().split('T')[0]}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 group relative z-10"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <CreditCard size={16} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Export as Excel</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">.CSV format</div>
                                        </div>
                                    </button>

                                    <div className="h-px bg-white/5 my-1 relative z-10"></div>

                                    <button
                                        onClick={() => {
                                            window.print();
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 group relative z-10"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                            <Download size={16} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Export as PDF</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">Save via Print</div>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        , document.body)}

                    {/* Date Dropdown */}
                    <div className="relative shrink-0">
                        <button
                            ref={dateButtonRef}
                            onClick={handleDateClick}
                            className="bg-white/5 hover:bg-white/15 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg border border-white/10 transition-all backdrop-blur-md min-w-[160px] justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-indigo-300 group-hover:text-white transition-colors" />
                                <span>{dateFilter} {activeReceipt ? 'R' : ''}</span> {/* Force Re-render */}
                            </div>
                            <ChevronDown size={16} className={`text-white/50 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Date Menu Portal */}
                    {typeof window !== 'undefined' && isDateOpen && createPortal(
                        <AnimatePresence>
                            {isDateOpen && dateMenuPosition.top > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="fixed bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[10001] p-1"
                                    style={{
                                        top: `${dateMenuPosition.top}px`,
                                        left: `${dateMenuPosition.left}px`,
                                        width: `${dateMenuPosition.width}px`
                                    }}
                                >
                                    {/* Invisible full-screen backdrop for click-outside */}
                                    <div
                                        className="fixed inset-0 z-[-1]"
                                        onClick={() => setIsDateOpen(false)}
                                    />

                                    {dateOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleDateSelect(opt)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors relative z-10 ${dateFilter === opt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        , document.body)}

                    <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="bg-white text-indigo-950 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-white/5 transition-transform active:scale-95 shrink-0 whitespace-nowrap"
                    >
                        <Plus size={22} strokeWidth={3} />
                        <span>New Entry</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Today's Collection" value={formatCurrency(45200)} icon={<TrendingUp />} trend="+15%" trendUp={true} color="bg-blue-600" href="/admin/collections" />
                <Card
                    title="Pending Handover"
                    value={formatCurrency(12500)}
                    icon={<Users />}
                    trend="3 Staff"
                    trendUp={false}
                    color="bg-amber-600"
                    onClick={() => setIsHandoverModalOpen(true)}
                />
                <Card title="Active Staff" value="8 / 10" icon={<Activity />} trend="All Online" trendUp={true} color="bg-emerald-600" href="/admin/staff" />
                <Card title="Month Revenue" value={formatCurrency(850000)} icon={<Wallet />} trend="+12% vs last" trendUp={true} color="bg-purple-600" href="/admin/reports" />
            </div>

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
                                <EnhancedTransactionItem
                                    key={txn.id}
                                    {...txn}
                                    onVerify={handleVerifyTransaction}
                                    onView={handleViewTransaction}
                                    onReceipt={handleDownloadReceipt}
                                    onDelete={handleDeleteTransaction}
                                />
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
                    {/* Staff Leaderboard */}
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradien-to-br from-indigo-500 to-purple-500 opacity-20 blur-[80px]"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Top Performers</h3>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/10">Today</span>
                            </div>
                            <div className="space-y-5">
                                <LeaderboardItem rank="1" name="Rahul Varma" amount={formatCurrency(15000)} />
                                <LeaderboardItem rank="2" name="Vikram Singh" amount={formatCurrency(12000)} />
                                <LeaderboardItem rank="3" name="Amit Kumar" amount={formatCurrency(8000)} />
                            </div>
                            <Link href="/admin/reports" className="block w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-colors border border-white/5 text-center">
                                View Full Report
                            </Link>
                        </div>
                    </div>

                    {/* Advanced Goal Widget */}
                    <GoalTracker currentRevenue={filteredTransactions.reduce((sum, t) => sum + (parseInt(String(t.amount).replace(/,/g, '')) || 0), 0)} />
                </div>

            </div>

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
                                    <div className="md:col-span-2 relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search or enter customer..."
                                                value={formData.customer}
                                                onFocus={() => setShowDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, customer: e.target.value });
                                                    setShowDropdown(true);
                                                }}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600 peer"
                                            />
                                            {/* Autocomplete Dropdown */}
                                            {showDropdown && (
                                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                                                    {mockCustomers.filter(c => c.toLowerCase().includes(formData.customer.toLowerCase())).length > 0 ? (
                                                        mockCustomers.filter(c => c.toLowerCase().includes(formData.customer.toLowerCase())).map((c, i) => (
                                                            <div
                                                                key={i}
                                                                onMouseDown={() => {
                                                                    setFormData({ ...formData, customer: c });
                                                                    setShowDropdown(false);
                                                                }}
                                                                className="px-5 py-3 hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white font-bold transition-colors"
                                                            >
                                                                {c}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-5 py-3 text-slate-500 text-sm italic">New customer will be created</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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

            {/* Receipt Modal */}
            {activeReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setActiveReceipt(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white text-slate-900 w-full max-w-sm rounded-3xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-indigo-600 p-6 text-center text-white relative print:hidden">
                            <h2 className="text-2xl font-bold mb-1 text-white uppercase tracking-widest">PAYMENT RECEIPT</h2>
                            <p className="opacity-80 text-xs tracking-widest uppercase text-white">Transaction Successful</p>
                        </div>
                        <div className="p-6 space-y-6 print:hidden">
                            <div className="text-center">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Amount Paid</p>
                                <h3 className="text-4xl font-black text-slate-900">{formatCurrency(parseFloat(activeReceipt.amount.replace(/,/g, '') || '0'))}</h3>
                            </div>
                            <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Payment To</span>
                                    <span className="text-slate-900 text-sm font-bold text-right">{activeReceipt.customer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Date & Time</span>
                                    <span className="text-slate-900 text-sm font-bold text-right">{activeReceipt.date || getTodayDate()}, {activeReceipt.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Transaction ID</span>
                                    <span className="text-slate-900 text-sm font-bold text-right">#{activeReceipt.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Payment Mode</span>
                                    <span className="text-slate-900 text-sm font-bold text-right bg-slate-100 px-2 py-0.5 rounded text-xs uppercase">{activeReceipt.mode}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
                            <button onClick={() => setActiveReceipt(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Close</button>
                            <button onClick={() => window.print()} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">Print / PDF</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Hidden Print Template for PDF Generation - Reusing Global CSS Logic */}
            {activeReceipt && (
                <div id="receipt-modal" className="hidden">
                    <div className="p-8 text-center bg-indigo-600 text-white mb-8 rounded-t-3xl">
                        <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-widest">PAYMENT RECEIPT</h2>
                        <p className="text-sm tracking-[0.2em] uppercase opacity-90">Transaction Successful</p>
                    </div>
                    <div className="px-4 space-y-10">
                        <div className="text-center py-6 border-b-2 border-dashed border-slate-200">
                            <p className="text-lg font-bold uppercase tracking-wider mb-2 text-slate-500">Amount Paid</p>
                            <h3 className="text-7xl font-black text-slate-900">{formatCurrency(parseFloat(activeReceipt.amount.replace(/,/g, '') || '0'))}</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center"><span className="font-bold text-xl text-slate-500">Payment To</span><span className="font-bold text-2xl text-slate-900">{activeReceipt.customer}</span></div>
                            <div className="flex justify-between items-center"><span className="font-bold text-xl text-slate-500">Date & Time</span><span className="font-bold text-2xl text-slate-900">{activeReceipt.date || getTodayDate()}, {activeReceipt.time}</span></div>
                            <div className="flex justify-between items-center"><span className="font-bold text-xl text-slate-500">Transaction ID</span><span className="font-bold text-2xl text-slate-900">#{activeReceipt.id}</span></div>
                            <div className="flex justify-between items-center"><span className="font-bold text-xl text-slate-500">Payment Mode</span><span className="font-bold text-2xl uppercase px-4 py-1 rounded-lg bg-slate-100 text-slate-900">{activeReceipt.mode}</span></div>
                        </div>
                        <div className="mt-12 pt-8 border-t text-center border-slate-100">
                            <p className="font-bold text-sm uppercase tracking-widest text-slate-400">Generated via Payment Soft</p>
                        </div>
                    </div>
                </div>
            )}

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

// TransactionItem replaced with EnhancedTransactionItem component

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
