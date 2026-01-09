"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Plus, FileText, ChevronDown, MoreHorizontal, Edit, Trash2, Eye, TrendingDown, DollarSign, ArrowUpRight, Calendar, CheckCircle, Clock, User, X, Briefcase, Phone, MapPin, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import { db, Expense } from "@/services/db";

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<'transactions' | 'dealers'>('transactions');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddDealerModalOpen, setIsAddDealerModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingDealerId, setEditingDealerId] = useState<number | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const { formatCurrency } = useCurrency();

    // Dealers Data
    const [dealers, setDealers] = useState<any[]>([]);

    // Form State for Expense
    const [newExpense, setNewExpense] = useState({
        title: '',
        party: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Stock Purchase',
        method: 'Cash',
        notes: ''
    });

    // Form State for Dealer
    const [newDealer, setNewDealer] = useState({
        name: '',
        contact: '',
        category: 'Electronics',
        address: ''
    });

    // Expense Data
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = db.getRowsPerPage();

    useEffect(() => {
        setExpenses(db.getExpenses());
        setDealers(db.getDealers());

        const handleUpdate = () => {
            setExpenses(db.getExpenses());
            setDealers(db.getDealers());
        };

        window.addEventListener('expense-updated', handleUpdate);
        window.addEventListener('dealer-updated', handleUpdate);
        window.addEventListener('settings-updated', handleUpdate); // Re-render on settings change

        return () => {
            window.removeEventListener('expense-updated', handleUpdate);
            window.removeEventListener('dealer-updated', handleUpdate);
            window.removeEventListener('settings-updated', handleUpdate);
        };
    }, []);

    // Derived State
    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const matchesSearch =
                expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'All' || expense.category === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [expenses, searchQuery, filterStatus]);

    const filteredDealers = useMemo(() => {
        return dealers.filter(dealer =>
            dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dealer.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [dealers, searchQuery]);

    // Dynamic Stats
    const stats = useMemo(() => {
        const totalOutflow = expenses
            .filter(e => e.status === 'Paid')
            .reduce((sum, e) => sum + e.amount, 0);
        const pendingAmount = expenses
            .filter(e => e.status === 'Pending')
            .reduce((sum, e) => sum + e.amount, 0);
        const pendingCount = expenses.filter(e => e.status === 'Pending').length;
        return { totalOutflow, pendingAmount, pendingCount };
    }, [expenses]);

    // Handlers
    const handleAddExpense = (e: any) => {
        e.preventDefault();
        if (!newExpense.title || !newExpense.amount || !newExpense.party) return;

        const newItem = {
            id: Date.now(),
            title: newExpense.title,
            party: newExpense.party,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date,
            category: newExpense.category,
            method: newExpense.method,
            status: newExpense.method === 'Pending' ? 'Pending' : 'Paid'
        };

        const updated = db.saveExpense(newItem as any); // Cast for compatibility
        setExpenses(updated);
        setIsAddModalOpen(false);
        setNewExpense({ title: '', party: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Stock Purchase', method: 'Cash', notes: '' });
    };

    const handleAddDealer = (e: any) => {
        e.preventDefault();
        if (!newDealer.name) return;

        if (editingDealerId) {
            const existing = dealers.find(d => d.id === editingDealerId);
            if (existing) {
                const updated = db.updateDealer({ ...existing, ...newDealer });
                setDealers(updated);
                setEditingDealerId(null);
            }
        } else {
            const updated = db.addDealer({ id: Date.now(), ...newDealer, balance: 0 });
            setDealers(updated);
        }

        setIsAddDealerModalOpen(false);
        setNewDealer({ name: '', contact: '', category: 'Electronics', address: '' });
    };

    const handleEditDealer = (dealer: any) => {
        setEditingDealerId(dealer.id);
        setNewDealer({
            name: dealer.name,
            contact: dealer.contact,
            category: dealer.category,
            address: dealer.address || ''
        });
        setIsAddDealerModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this record?')) {
            const updated = db.deleteExpense(id);
            setExpenses(updated);
        }
    };

    const handleDeleteDealer = (id: number) => {
        if (confirm('Are you sure? This will not delete their transaction history.')) {
            const updated = db.deleteDealer(id);
            setDealers(updated);
        }
    };

    const handleExport = () => {
        const headers = ["Title", "Party", "Amount", "Date", "Category", "Method", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredExpenses.map(e =>
                [e.title, e.party, e.amount, e.date, e.category, e.method, e.status].map(field => `"${field}"`).join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "expenses_report.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-rose-500 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-black/20 rounded-xl rounded-tl-none text-white"><TrendingDown size={20} /></div>
                            <span className="text-rose-100 font-bold tracking-wider text-sm uppercase">Total Outflow</span>
                        </div>
                        <h3 className="text-4xl font-extrabold text-white">{formatCurrency(stats.totalOutflow)}</h3>
                        <p className="text-rose-200 font-medium mt-2 text-sm flex items-center gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">Updated Just Now</span>
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-black/10 transform rotate-[-15deg]"><DollarSign size={160} /></div>
                </div>

                <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500/20 rounded-xl rounded-tl-none text-amber-500"><Clock size={20} /></div>
                            <span className="text-slate-400 font-bold tracking-wider text-sm uppercase">Pending Payouts</span>
                        </div>
                        <h3 className="text-4xl font-extrabold text-white">{formatCurrency(stats.pendingAmount)}</h3>
                        <p className="text-slate-400 font-medium mt-2 text-sm">{stats.pendingCount} Payments Due</p>
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-center items-start cursor-pointer hover:scale-[1.02] transition-transform active:scale-95" onClick={() => setIsAddModalOpen(true)}>
                    <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-white">
                        <Plus size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Add New Payout</h3>
                    <p className="text-indigo-200 text-sm font-medium">Record expenses & payments</p>
                </div>
            </div>

            {/* Tab Navigation & Search */}
            <div className="bg-[#1e293b]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex bg-[#0f172a] p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'transactions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('dealers')}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'dealers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Dealers / Parties
                    </button>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={activeTab === 'transactions' ? "Search expenses..." : "Search dealers..."}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-bold transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {activeTab === 'dealers' && (
                        <>
                            <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-white/10">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                            <button onClick={() => setIsAddDealerModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2">
                                <Plus size={20} /> <span className="hidden md:inline">Add Dealer</span>
                            </button>
                        </>
                    )}
                    {activeTab === 'transactions' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 bg-[#0f172a] hover:bg-white/5 text-white px-6 py-4 rounded-2xl font-bold transition-colors border ${filterStatus !== 'All' ? 'border-indigo-500 text-indigo-400' : 'border-white/10'}`}
                            >
                                <Filter size={18} className={filterStatus !== 'All' ? "text-indigo-400" : "text-slate-400"} />
                                <span className="hidden md:inline">{filterStatus === 'All' ? 'Filter' : filterStatus}</span>
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-[#0f172a] hover:bg-white/5 text-white px-6 py-4 rounded-2xl font-bold transition-colors border border-white/10"
                            >
                                <FileText size={18} className="text-slate-400" />
                                <span className="hidden md:inline">Export</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            <AnimatePresence mode="wait">
                {activeTab === 'transactions' ? (
                    <motion.div
                        key="transactions"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-[#1e293b]/40 backdrop-blur-sm rounded-[2rem] border border-white/5 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-base font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-5 w-12 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0" /></th>
                                        <th className="px-6 py-5">Payout ID</th>
                                        <th className="px-6 py-5">Party / Dealer</th>
                                        <th className="px-6 py-5">Category</th>
                                        <th className="px-6 py-5">Method</th>
                                        <th className="px-6 py-5 text-right">Amount</th>
                                        <th className="px-6 py-5 text-center">Status</th>
                                        <th className="px-8 py-5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white divide-y divide-white/5">
                                    {filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((expense) => (
                                        <tr key={expense.id} className="group hover:bg-white/5 transition-colors text-lg">
                                            <td className="px-6 py-5 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0" /></td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white text-lg">EXP-{String(expense.id).padStart(3, '0')}</div>
                                                <div className="text-sm text-slate-500 mt-1">{db.formatDate(expense.date)}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white text-lg">{expense.party}</div>
                                                <div className="text-sm text-slate-500 mt-1">{expense.title}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-white/5">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="uppercase text-sm font-bold tracking-wider text-slate-400 border border-white/10 px-2 py-1 rounded bg-[#0f172a]">
                                                    {expense.method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-xl">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="px-6 py-5 text-center relative group">
                                                <select
                                                    value={expense.status || 'Pending'}
                                                    onChange={(e) => {
                                                        const updated = { ...expense, status: e.target.value };
                                                        db.saveExpense(updated);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    title="Change Status"
                                                    style={{ colorScheme: 'dark' }}
                                                >
                                                    <option value="Paid" className="bg-[#1e293b] text-white">Paid</option>
                                                    <option value="Approved" className="bg-[#1e293b] text-white">Approved</option>
                                                    <option value="Pending" className="bg-[#1e293b] text-white">Pending</option>
                                                    <option value="Rejected" className="bg-[#1e293b] text-white">Rejected</option>
                                                </select>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-bold capitalize ${expense.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    expense.status === 'Approved' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                        expense.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${expense.status === 'Paid' ? 'bg-emerald-500' :
                                                        expense.status === 'Approved' ? 'bg-blue-500' :
                                                            expense.status === 'Rejected' ? 'bg-rose-500' :
                                                                'bg-amber-500'
                                                        }`}></span>
                                                    {expense.status}
                                                    <ChevronDown size={14} className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredExpenses.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-500">
                                                No transactions found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center p-4 border-t border-white/10 bg-[#1e293b]/20">
                            <div className="text-slate-400 text-sm font-medium">
                                Showing <span className="text-white font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredExpenses.length)}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredExpenses.length)}</span> of <span className="text-white font-bold">{filteredExpenses.length}</span> results
                            </div>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5 transition-colors">Previous</button>
                                <button disabled={currentPage * itemsPerPage >= filteredExpenses.length} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5 transition-colors">Next</button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dealers"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    >
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDealers.map((dealer) => (
                                    <div
                                        key={dealer.id}
                                        className="bg-[#1e293b]/40 hover:bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 group transition-all hover:shadow-2xl relative"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-14 w-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === dealer.id ? null : dealer.id);
                                                    }}
                                                    className={`p-2 rounded-xl transition-colors ${activeMenuId === dealer.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>
                                                <AnimatePresence>
                                                    {activeMenuId === dealer.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                            className="absolute right-0 top-full mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-20"
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditDealer(dealer);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 text-left transition-colors"
                                                            >
                                                                <Edit size={16} className="text-amber-400" /> Edit Details
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert(`History feature for ${dealer.name} is coming soon!`);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 text-left transition-colors"
                                                            >
                                                                <Clock size={16} className="text-blue-400" /> View History
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteDealer(dealer.id);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 text-left transition-colors"
                                                            >
                                                                <Trash2 size={16} /> Delete
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-1">{dealer.name}</h4>
                                        <p className="text-slate-400 text-sm font-medium mb-4">{dealer.category}</p>

                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                                <Phone size={16} className="text-slate-500" /> {dealer.contact}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                                <TrendingDown size={16} className="text-slate-500" /> Last Payment: Upcoming
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#1e293b]/40 backdrop-blur-sm rounded-[2rem] border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-base font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-5 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0" /></th>
                                                <th className="px-6 py-5">Dealer Name</th>
                                                <th className="px-6 py-5">Category</th>
                                                <th className="px-6 py-5">Contact</th>
                                                <th className="px-6 py-5">Status</th>
                                                <th className="px-8 py-5 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white divide-y divide-white/5">
                                            {filteredDealers.map((dealer) => (
                                                <tr key={dealer.id} className="group hover:bg-white/5 transition-colors text-lg">
                                                    <td className="px-6 py-5 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0" /></td>
                                                    <td className="px-6 py-5 font-bold text-white">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                                                                <Briefcase size={18} />
                                                            </div>
                                                            {dealer.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-white/5">
                                                            {dealer.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-300 font-mono tracking-wide">{dealer.contact}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-bold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => handleEditDealer(dealer)} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Edit"><Edit size={20} /></button>
                                                            <button onClick={() => handleDeleteDealer(dealer.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete"><Trash2 size={20} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredDealers.length === 0 && (
                                                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No dealers found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
                        <motion.div onClick={(e) => e.stopPropagation()} className="bg-[#1e293b] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div><h2 className="text-2xl font-extrabold text-white">Add New Payout</h2><p className="text-slate-400 text-sm font-medium mt-1">Record a payment to dealer.</p></div>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title / Purpose</label>
                                        <input type="text" required value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="Ex. Stock Purchase, Rent" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Party / Dealer</label>
                                        <select
                                            value={newExpense.party}
                                            onChange={(e) => setNewExpense({ ...newExpense, party: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all font-bold"
                                        >
                                            <option value="">Select Dealer...</option>
                                            {dealers.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
                                            <input type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0.00" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                                            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all font-bold">
                                                <option>Stock Purchase</option><option>Rent</option><option>Salary</option><option>Utility Bill</option><option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
                                            <select value={newExpense.method} onChange={(e) => setNewExpense({ ...newExpense, method: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all font-bold">
                                                <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option><option>Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-4 border-t border-white/5">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-95 transition-all">Record Payment</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Dealer Modal */}
            <AnimatePresence>
                {isAddDealerModalOpen && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsAddDealerModalOpen(false)}>
                        <motion.div onClick={(e) => e.stopPropagation()} className="bg-[#1e293b] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div><h2 className="text-2xl font-extrabold text-white">Add New Dealer</h2><p className="text-slate-400 text-sm font-medium mt-1">Add a new party or vendor.</p></div>
                                <button onClick={() => setIsAddDealerModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddDealer} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dealer / Party Name</label>
                                        <input type="text" required value={newDealer.name} onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })} placeholder="Ex. Samsung Distributors" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Number</label>
                                        <input type="tel" value={newDealer.contact} onChange={(e) => setNewDealer({ ...newDealer, contact: e.target.value })} placeholder="9876543210" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                        <select value={newDealer.category} onChange={(e) => setNewDealer({ ...newDealer, category: e.target.value })} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all font-bold">
                                            <option>Electronics</option><option>Distributor</option><option>Wholesaler</option><option>Utility Provider</option><option>Staff</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-4 border-t border-white/5">
                                    <button type="button" onClick={() => setIsAddDealerModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Save Dealer</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
