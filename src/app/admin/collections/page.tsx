"use client";

import { Filter, Download, Search, Check, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpRight, TrendingUp, Calendar, CreditCard, DollarSign, X, Clock, Phone, FileText, Edit, Trash2, Eye, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";

import { db, Collection } from "@/services/db";

export default function CollectionsPage() {
    // Helper to get today's date in YYYY-MM-DD
    const getToday = () => new Date().toISOString().split('T')[0];

    // Initial Data with standard date format
    const [transactions, setTransactions] = useState<Collection[]>([]);

    useEffect(() => {
        // Load from unified db service
        setTransactions(db.getCollections());

        // Listener for other components
        const handleUpdate = () => setTransactions(db.getCollections());
        window.addEventListener('transaction-updated', handleUpdate);
        window.addEventListener('settings-updated', handleUpdate); // Re-render on settings change
        return () => {
            window.removeEventListener('transaction-updated', handleUpdate);
            window.removeEventListener('settings-updated', handleUpdate);
        };
    }, []);

    // View States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Collection | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState<Partial<Collection>>({
        customer: "", amount: "", mode: "Cash", date: getToday(), staff: "Admin", remarks: "", status: "Paid"
    });

    const handleAddTransaction = () => {
        if (!newTransaction.customer || !newTransaction.amount) return;

        const newId = `REC-${String(transactions.length + 1).padStart(3, '0')}`;
        const newEntry: Collection = {
            id: newId,
            customer: newTransaction.customer || "Unknown",
            staff: newTransaction.staff || "Admin",
            amount: newTransaction.amount || "0",
            status: "Paid",
            date: newTransaction.date || getToday(),
            mode: (newTransaction.mode as any) || "Cash",
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            contact: "+91 00000 00000",
            remarks: newTransaction.remarks || ""
        };

        const updatedTransactions = db.saveCollection(newEntry);
        setTransactions(updatedTransactions);

        // Dispatch event
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('transaction-updated'));

        setIsAddModalOpen(false);
        setNewTransaction({ customer: "", amount: "", mode: "Cash", date: getToday(), staff: "Admin", remarks: "", status: "Paid" });
    };

    // ... (Filter states)
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [staffFilter, setStaffFilter] = useState("All Staff");
    const [modeFilter, setModeFilter] = useState("All Modes");

    const [showDropdown, setShowDropdown] = useState(false);

    // Customer Sync Logic
    const [customers, setCustomers] = useState<{ id: number, name: string }[]>([]);

    // Staff Sync Logic
    const [staffList, setStaffList] = useState<{ id: number, name: string, status?: string }[]>([]);
    useEffect(() => {
        const loadStaff = () => setStaffList(db.getStaff());
        loadStaff();
        window.addEventListener('staff-updated', loadStaff);
        return () => window.removeEventListener('staff-updated', loadStaff);
    }, []);

    useEffect(() => {
        setCustomers(db.getCustomers());
        const handleCustUpdate = () => setCustomers(db.getCustomers());
        window.addEventListener('customer-updated', handleCustUpdate);
        return () => window.removeEventListener('customer-updated', handleCustUpdate);
    }, []);

    // Action State
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            const updatedTransactions = db.deleteCollection(id);
            setTransactions(updatedTransactions);

            if (typeof window !== 'undefined') window.dispatchEvent(new Event('transaction-updated'));

            setActiveActionId(null);
            if (selectedItems.includes(id)) setSelectedItems(prev => prev.filter(i => i !== id));
        }
    };

    const handleEdit = (id: string) => {
        alert(`Edit functionality for ${id} will be implemented here.`);
        setActiveActionId(null);
    };

    // Selection Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const ids = filteredTransactions.map(t => t.id);
            setSelectedItems(ids);
        } else {
            setSelectedItems([]);
        }
    };

    const handleToggleSelect = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(prev => prev.filter(i => i !== id));
        } else {
            setSelectedItems(prev => [...prev, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedItems.length} transactions?`)) {
            let current = transactions;
            selectedItems.forEach(id => {
                current = db.deleteCollection(id);
            });
            setTransactions(current); // Note: db.deleteCollection reads from storage every time, which is inefficient for bulk but safe.
            // Optimized bulk delete would be better in db service, but this works for now.

            if (typeof window !== 'undefined') window.dispatchEvent(new Event('transaction-updated'));
            setSelectedItems([]);
        }
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = db.getRowsPerPage();

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDate = filterDate ? t.date === filterDate : true;

        const matchesStatus = statusFilter === "All Status" || t.status === statusFilter;
        const matchesStaff = staffFilter === "All Staff" || t.staff.includes(staffFilter.split(' ')[0]);
        const matchesMode = modeFilter === "All Modes" || t.mode === modeFilter;

        return matchesSearch && matchesDate && matchesStatus && matchesStaff && matchesMode;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleExport = () => {
        // Define CSV headers
        const headers = ["Receipt ID", "Customer", "Staff", "Amount", "Status", "Date", "Mode", "Time", "Contact", "Remarks"];

        // Convert data to CSV format
        const csvContent = [
            headers.join(","),
            ...filteredTransactions.map(t => [
                t.id,
                `"${t.customer}"`, // Quote strings to handle commas
                t.staff,
                t.amount.replace(/,/g, ''), // Remove commas from amount for Excel
                t.status,
                t.amount.replace(/,/g, ''), // Remove commas from amount for Excel
                t.status,
                db.formatDate(t.date),
                t.mode,
                t.time,
                t.contact,
                `"${t.remarks || ''}"`
            ].join(","))
        ].join("\n");

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `collections_report_${getToday()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Format Date for Display
    const formatDate = (dateStr: string) => {
        return db.formatDate(dateStr);
    };

    // Calculate Stats
    const totalCollections = transactions
        .filter(t => t.status === "Paid")
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/,/g, '')), 0);
    const pendingAmount = transactions
        .filter(t => t.status === "Processing")
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/,/g, '')), 0);

    const { formatCurrency } = useCurrency();

    // Stats Calculation
    const successfulTx = transactions.filter(t => t.status === "Paid").length;
    const failedTx = transactions.filter(t => t.status === "Failed").length;
    const successRate = transactions.length > 0 ? Math.round((successfulTx / transactions.length) * 100) : 0;

    return (
        <div className="w-full space-y-8 relative">

            {/* Header Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/reports" className="block transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40 border border-white/10 group h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <DollarSign size={20} className="text-blue-200" />
                                </div>
                                <p className="font-medium text-blue-100">Total Collections</p>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{formatCurrency(totalCollections)}</h3>
                            <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                                <TrendingUp size={16} className="text-emerald-300" />
                                <span className="text-emerald-100">+12.5% this month</span>
                            </div>
                        </div>
                    </div>
                </Link>

                <div
                    onClick={() => {
                        setStatusFilter('All Status');
                        setStaffFilter('All Staff');
                        setSearchQuery("");
                        setFilterDate("");
                        document.getElementById('transaction-table')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden group hover:bg-[#1e293b] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Transactions</p>
                            <h3 className="text-3xl font-extrabold text-white">{transactions.length}</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <CreditCard size={24} />
                        </div>
                    </div>

                    {/* Progress Bar & Stats */}
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-2">
                            <span className="text-emerald-400">{successRate}% Success Rate</span>
                            <span className="text-slate-500">{successfulTx} Paid • {failedTx} Failed</span>
                        </div>
                        <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden flex">
                            <div style={{ width: `${successRate}%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            {failedTx > 0 && (
                                <div style={{ width: `${(failedTx / transactions.length) * 100}%` }} className="h-full bg-rose-500"></div>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => {
                        setStatusFilter('Processing');
                        setCurrentPage(1);
                        document.getElementById('transaction-table')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 shadow-xl relative overflow-hidden group hover:bg-[#1e293b] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Pending</p>
                            <h3 className="text-3xl font-extrabold text-white">{formatCurrency(pendingAmount)}</h3>
                        </div>
                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <Calendar size={24} />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-[70%] shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                    </div>
                </div>
            </div>

            {/* Main Action Bar - Redesigned to match image */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Recent Transactions</h2>
                    <p className="text-slate-400 font-medium">Monitor financial activity in real-time</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all md:ml-auto"
                >
                    <Plus size={20} strokeWidth={3} />
                    New Entry
                </button>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Bar - Matches Image */}
                    <div className="relative flex-1 md:w-64 group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search customer..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-slate-600"
                        />
                    </div>

                    {/* Date Input - Matches Image Style */}
                    <div className="relative">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold uppercase tracking-wider min-w-[150px] cursor-pointer"
                        />
                    </div>

                    {/* Filter Button & Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-3 rounded-xl transition-colors border ${isFilterOpen || (statusFilter !== 'All Status' || staffFilter !== 'All Staff') ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#0f172a] hover:bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}
                        >
                            <Filter size={20} />
                        </button>

                        {/* Dropdown for Advanced Filters */}
                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-64 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-4 space-y-4"
                                >
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Staff Member</label>
                                        <select
                                            value={staffFilter}
                                            onChange={(e) => { setStaffFilter(e.target.value); setCurrentPage(1); }}
                                            className="w-full px-3 py-2 text-sm font-bold border border-white/5 rounded-xl bg-[#0f172a] text-white outline-none focus:border-indigo-500/50 cursor-pointer"
                                        >
                                            <option>All Staff</option>
                                            <option value="Admin">Admin (Self)</option>
                                            {staffList.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                            className="w-full px-3 py-2 text-sm font-bold border border-white/5 rounded-xl bg-[#0f172a] text-white outline-none focus:border-indigo-500/50 cursor-pointer"
                                        >
                                            <option>All Status</option>
                                            <option>Paid</option>
                                            <option>Processing</option>
                                            <option>Failed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Payment Mode</label>
                                        <select
                                            value={modeFilter}
                                            onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
                                            className="w-full px-3 py-2 text-sm font-bold border border-white/5 rounded-xl bg-[#0f172a] text-white outline-none focus:border-indigo-500/50 cursor-pointer"
                                        >
                                            <option>All Modes</option>
                                            <option>Cash</option>
                                            <option>UPI</option>
                                            <option>Cheque</option>
                                        </select>
                                    </div>
                                    {(statusFilter !== 'All Status' || staffFilter !== 'All Staff' || modeFilter !== 'All Modes') && (
                                        <button
                                            onClick={() => { setStatusFilter('All Status'); setStaffFilter('All Staff'); setModeFilter('All Modes'); }}
                                            className="w-full py-2 text-xs font-bold text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Export Button (Optional, usually good to keep) */}
                    <button
                        onClick={handleExport}
                        className="p-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-lg active:scale-95 ml-auto md:ml-0"
                        title="Export Report"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Collections Table Container */}
            {/* Collections Table Container */}
            <div id="transaction-table" className="bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[600px] transition-all relative">

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0f172a]/80 text-indigo-300/80 font-bold text-base uppercase tracking-wider border-b border-white/5">
                            <tr>
                                <th className="px-8 py-5 w-16">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === filteredTransactions.length && filteredTransactions.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-offset-[#0f172a] focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-5">Receipt ID</th>
                                <th className="px-6 py-5">Customer</th>
                                <th className="px-6 py-5">Collected By</th>
                                <th className="px-6 py-5">Method</th>
                                <th className="px-6 py-5 text-right">Amount</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-lg">
                            {currentItems.length > 0 ? (
                                currentItems.map((t) => {
                                    if (!t) return null;
                                    return (
                                        <tr key={t.id} className={`hover:bg-white/5 transition-colors group cursor-pointer border-l-2 ${selectedItems.includes(t.id) ? 'bg-indigo-500/5 border-indigo-500' : 'border-transparent hover:border-indigo-500'}`} onClick={() => setSelectedTransaction(t)}>
                                            <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(t.id)}
                                                    onChange={() => handleToggleSelect(t.id)}
                                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-offset-[#0f172a] focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{t.id}</span>
                                                    <span className="text-xs font-medium text-slate-500 mt-0.5">{formatDate(t.date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{t.customer}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md ${t.staff.includes('Rahul') ? 'bg-indigo-600' : 'bg-purple-600'
                                                        }`}>
                                                        {t.staff.split(' ')[0][0]}{(t.staff.split(' ')[1] || '')[0] || ''}
                                                    </div>
                                                    <span className="font-bold text-slate-400">{t.staff}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wide group-hover:bg-white/10 transition-colors">
                                                    {t.mode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-white text-xl group-hover:text-indigo-300 transition-colors">₹ {t.amount}</td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-bold border ${t.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    t.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full shadow ${t.status === 'Paid' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                                        t.status === 'Processing' ? 'bg-amber-500 shadow-amber-500/50' :
                                                            'bg-rose-500 shadow-rose-500/50'
                                                        }`}></span>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === t.id ? null : t.id); }}
                                                    className={`p-2 rounded-lg transition-colors focus:bg-white/10 ${activeActionId === t.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>

                                                <AnimatePresence>
                                                    {activeActionId === t.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            className="absolute right-10 top-8 z-50 w-32 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="flex flex-col p-1">
                                                                <button
                                                                    onClick={() => { setSelectedTransaction(t); setActiveActionId(null); }}
                                                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                                                                >
                                                                    <Eye size={12} className="text-blue-400" /> View
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEdit(t.id)}
                                                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                                                                >
                                                                    <Edit size={12} className="text-amber-400" /> Edit
                                                                </button>
                                                                <div className="h-px bg-white/5 my-1"></div>
                                                                <button
                                                                    onClick={() => handleDelete(t.id)}
                                                                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                                                                >
                                                                    <Trash2 size={12} /> Delete
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-slate-500">
                                        <Filter size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="font-bold text-lg">No transactions found</p>
                                        {(searchQuery || filterDate || statusFilter !== 'All Status' || staffFilter !== 'All Staff') && (
                                            <button
                                                onClick={() => { setSearchQuery(""); setFilterDate(""); setStatusFilter("All Status"); setStaffFilter("All Staff"); }}
                                                className="mt-2 text-indigo-400 hover:text-indigo-300 underline font-bold"
                                            >
                                                Reset Filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-6 border-t border-white/5 bg-[#1e293b]/50 flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>
                        Showing {filteredTransactions.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} results
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="px-4 py-2 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all active:scale-95 flex items-center gap-1"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all active:scale-95 flex items-center gap-1"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Transaction Details Modal */}
            <AnimatePresence>
                {selectedTransaction && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTransaction(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Receipt Details</h3>
                                    <p className="text-indigo-400 text-xs font-bold mt-1 uppercase tracking-wider">{selectedTransaction.id}</p>
                                </div>
                                <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-4xl font-extrabold text-white tracking-tight">₹ {selectedTransaction.amount}</h2>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-3 border ${selectedTransaction.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        selectedTransaction.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                        {selectedTransaction.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Customer</p>
                                        <p className="text-white font-bold text-sm mb-1">{selectedTransaction.customer}</p>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Phone size={12} /> {selectedTransaction.contact}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Time & Date</p>
                                        <p className="text-white font-bold text-sm mb-1">{formatDate(selectedTransaction.date)}</p>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Clock size={12} /> {selectedTransaction.time}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400 font-medium text-sm">Payment Mode</span>
                                        <span className="text-white font-bold">{selectedTransaction.mode}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span className="text-slate-400 font-medium text-sm">Collected By</span>
                                        <span className="text-indigo-300 font-bold">{selectedTransaction.staff}</span>
                                    </div>
                                    {selectedTransaction.image && (
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-slate-400 font-medium text-sm flex items-center gap-2"><FileText size={14} /> Attachment</span>
                                            <button
                                                onClick={() => window.open(selectedTransaction.image, '_blank')}
                                                className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-1"
                                            >
                                                View Image <ArrowUpRight size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <span className="text-slate-400 font-medium text-sm flex items-center gap-2"><FileText size={14} /> Remarks</span>
                                        <p className="text-slate-300 text-sm bg-[#0f172a] p-3 rounded-xl border border-white/5 leading-relaxed">
                                            {selectedTransaction.remarks || "No remarks added for this transaction."}
                                        </p>
                                        {selectedTransaction.image && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                                                {/* Preview of the image */}
                                                <img src={selectedTransaction.image} alt="Receipt Attachment" className="w-full h-32 object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => window.open(selectedTransaction.image, '_blank')} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Download size={18} />
                                    Download Receipt
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedItems.length > 0 && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-6"
                    >
                        <span className="text-white font-bold text-sm bg-white/10 px-3 py-1 rounded-lg">
                            {selectedItems.length} Selected
                        </span>

                        <div className="h-6 w-px bg-white/10"></div>

                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold text-sm transition-colors"
                        >
                            <Trash2 size={16} /> Delete Selected
                        </button>

                        <button
                            onClick={() => {
                                alert(`Exporting ${selectedItems.length} items...`);
                            }}
                            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors"
                        >
                            <Download size={16} /> Export Selected
                        </button>

                        <button
                            onClick={() => setSelectedItems([])}
                            className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors ml-2"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">New Transaction</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-1">Record a new payment collection</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"><X size={24} /></button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
                                        <input
                                            type="text"
                                            value={newTransaction.customer}
                                            onFocus={() => setShowDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                            onChange={(e) => {
                                                setNewTransaction({ ...newTransaction, customer: e.target.value });
                                                setShowDropdown(true);
                                            }}
                                            placeholder="Search or enter customer..."
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600"
                                        />
                                        {/* Autocomplete Dropdown */}
                                        {showDropdown && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                                                {customers.filter(c => c.name.toLowerCase().includes((newTransaction.customer || "").toLowerCase())).length > 0 ? (
                                                    customers.filter(c => c.name.toLowerCase().includes((newTransaction.customer || "").toLowerCase())).map((c) => (
                                                        <div
                                                            key={c.id}
                                                            onMouseDown={() => {
                                                                setNewTransaction({ ...newTransaction, customer: c.name });
                                                                setShowDropdown(false);
                                                            }}
                                                            className="px-5 py-3 hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white font-bold transition-colors"
                                                        >
                                                            {c.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-5 py-3 text-slate-500 text-sm italic">New customer will be created</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                                        <input type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} placeholder="0.00" className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-xl placeholder:text-slate-600" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Mode</label>
                                        <select value={newTransaction.mode} onChange={(e) => setNewTransaction({ ...newTransaction, mode: e.target.value as any })} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer appearance-none">
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                                        <input type="date" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Collected By</label>
                                        <select value={newTransaction.staff} onChange={(e) => setNewTransaction({ ...newTransaction, staff: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer appearance-none">
                                            <option value="Admin">Admin (Self)</option>
                                            {staffList.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                                        <textarea value={newTransaction.remarks} onChange={(e) => setNewTransaction({ ...newTransaction, remarks: e.target.value })} placeholder="Add any notes..." rows={3} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none" />
                                    </div>
                                </div>
                                <button onClick={handleAddTransaction} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center justify-center gap-3 border border-indigo-500/50 mt-6">
                                    <Plus size={24} strokeWidth={3} /> Save Transaction
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
