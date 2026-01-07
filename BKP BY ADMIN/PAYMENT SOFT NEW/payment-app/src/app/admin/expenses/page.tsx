"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Plus, FileText, ChevronDown, MoreHorizontal, Edit, Trash2, Eye, TrendingDown, DollarSign, ArrowUpRight, Calendar, CheckCircle, Clock, User, X, Briefcase, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<'transactions' | 'dealers'>('transactions');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddDealerModalOpen, setIsAddDealerModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Dealers Data
    const [dealers, setDealers] = useState([
        { id: 1, name: 'Samsung Distributors', contact: '9876543210', category: 'Electronics', balance: 0 },
        { id: 2, name: 'Complex Owner', contact: '9988776655', category: 'Rent/Lease', balance: 0 },
        { id: 3, name: 'Xiaomi Vendor', contact: '8877665544', category: 'Electronics', balance: 45000 },
        { id: 4, name: 'Torrent Power', contact: '1800-123-456', category: 'Utility', balance: 0 },
        { id: 5, name: 'Rahul Varma (Staff)', contact: '7766554433', category: 'Salary', balance: 0 },
    ]);

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
    const [expenses, setExpenses] = useState([
        { id: 1, title: 'Stock Purchase - Galaxy S24', party: 'Samsung Distributors', amount: 125000, date: '2026-01-03', category: 'Stock Purchase', method: 'Bank Transfer', status: 'Paid' },
        { id: 2, title: 'Shop Rent - Jan 2026', party: 'Complex Owner', amount: 25000, date: '2026-01-01', category: 'Rent', method: 'Cheque', status: 'Paid' },
        { id: 3, title: 'Staff Salary Advance', party: 'Rahul Varma (Staff)', amount: 5000, date: '2026-01-02', category: 'Salary', method: 'Cash', status: 'Paid' },
        { id: 4, title: 'Electricity Bill', party: 'Torrent Power', amount: 3450, date: '2025-12-28', category: 'Utility Bill', method: 'UPI', status: 'Paid' },
        { id: 5, title: 'Pending Payment', party: 'Xiaomi Vendor', amount: 45000, date: '2026-01-04', category: 'Stock Purchase', method: 'Pending', status: 'Pending' },
    ]);

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

        setExpenses([newItem, ...expenses]);
        setIsAddModalOpen(false);
        setNewExpense({ title: '', party: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Stock Purchase', method: 'Cash', notes: '' });
    };

    const handleAddDealer = (e: any) => {
        e.preventDefault();
        if (!newDealer.name) return;
        setDealers([...dealers, { id: Date.now(), ...newDealer, balance: 0 }]);
        setIsAddDealerModalOpen(false);
        setNewDealer({ name: '', contact: '', category: 'Electronics', address: '' });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this record?')) {
            setExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const handleDeleteDealer = (id: number) => {
        if (confirm('Are you sure? This will not delete their transaction history.')) {
            setDealers(dealers.filter(d => d.id !== id));
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
                        <h3 className="text-4xl font-extrabold text-white">₹ {stats.totalOutflow.toLocaleString('en-IN')}</h3>
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
                        <h3 className="text-4xl font-extrabold text-white">₹ {stats.pendingAmount.toLocaleString('en-IN')}</h3>
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
                        <button onClick={() => setIsAddDealerModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2">
                            <Plus size={20} /> <span className="hidden md:inline">Add Dealer</span>
                        </button>
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
                                    <tr className="border-b border-white/10 text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="p-6 w-12 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0" /></th>
                                        <th className="p-6">Payout ID</th>
                                        <th className="p-6">Party / Dealer</th>
                                        <th className="p-6">Category</th>
                                        <th className="p-6">Method</th>
                                        <th className="p-6 text-right">Amount</th>
                                        <th className="p-6 text-center">Status</th>
                                        <th className="p-6 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white divide-y divide-white/5">
                                    {filteredExpenses.map((expense) => (
                                        <tr key={expense.id} className="group hover:bg-white/5 transition-colors text-base">
                                            <td className="p-6 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0" /></td>
                                            <td className="p-6">
                                                <div className="font-bold text-white text-base">EXP-{String(expense.id).padStart(3, '0')}</div>
                                                <div className="text-sm text-slate-500 mt-1">{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-white text-base">{expense.party}</div>
                                                <div className="text-sm text-slate-500 mt-1">{expense.title}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-white/5">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className="uppercase text-xs font-bold tracking-wider text-slate-400 border border-white/10 px-2 py-1 rounded bg-[#0f172a]">
                                                    {expense.method}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right font-bold text-lg">
                                                ₹ {expense.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${expense.status === 'Paid'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${expense.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {expense.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
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
                    </motion.div>
                ) : (
                    <motion.div
                        key="dealers"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredDealers.map((dealer) => (
                            <div key={dealer.id} className="bg-[#1e293b]/40 hover:bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 group transition-all hover:shadow-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-14 w-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
                                        <Briefcase size={24} />
                                    </div>
                                    <button onClick={() => handleDeleteDealer(dealer.id)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
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
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
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
