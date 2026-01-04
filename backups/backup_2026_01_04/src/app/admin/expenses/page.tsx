"use client";

import { useState, useMemo, useRef } from "react";
import { Search, Filter, Plus, FileText, ChevronDown, MoreHorizontal, Edit, Trash2, Eye, TrendingDown, DollarSign, ArrowUpRight, Calendar, CheckCircle, Clock, User, X, Briefcase, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<'transactions' | 'dealers'>('transactions');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddDealerModalOpen, setIsAddDealerModalOpen] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
    const [editingDealerId, setEditingDealerId] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const tableRef = useRef<HTMLDivElement>(null);

    const scrollToTable = () => {
        if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(filteredExpenses.map(e => e.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleToggleSelect = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(prev => prev.filter(i => i !== id));
        } else {
            setSelectedItems(prev => [...prev, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
            setExpenses(prev => prev.filter(e => !selectedItems.includes(e.id)));
            setSelectedItems([]);
        }
    };

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

        if (editingExpenseId) {
            // Update Existing
            setExpenses(prev => prev.map(exp => exp.id === editingExpenseId ? {
                ...exp,
                title: newExpense.title,
                party: newExpense.party,
                amount: parseFloat(newExpense.amount),
                date: newExpense.date,
                category: newExpense.category,
                method: newExpense.method,
                status: newExpense.method === 'Pending' ? 'Pending' : 'Paid'
            } : exp));
            setEditingExpenseId(null);
        } else {
            // Add New
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
        }

        setIsAddModalOpen(false);
        setNewExpense({ title: '', party: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Stock Purchase', method: 'Cash', notes: '' });
    };

    const handleEditExpense = (expense: any) => {
        setNewExpense({
            title: expense.title,
            party: expense.party,
            amount: expense.amount.toString(),
            date: expense.date,
            category: expense.category,
            method: expense.method,
            notes: ''
        });
        setEditingExpenseId(expense.id);
        setIsAddModalOpen(true);
    };

    const handleAddDealer = (e: any) => {
        e.preventDefault();
        if (!newDealer.name) return;

        if (editingDealerId) {
            setDealers(prev => prev.map(d => d.id === editingDealerId ? { ...d, ...newDealer } : d));
            setEditingDealerId(null);
        } else {
            setDealers([...dealers, { id: Date.now(), ...newDealer, balance: 0 }]);
        }

        setIsAddDealerModalOpen(false);
        setNewDealer({ name: '', contact: '', category: 'Electronics', address: '' });
    };

    const handleEditDealer = (dealer: any) => {
        setNewDealer({
            name: dealer.name,
            contact: dealer.contact,
            category: dealer.category,
            address: dealer.address || ''
        });
        setEditingDealerId(dealer.id);
        setIsAddDealerModalOpen(true);
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
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Outflow Card */}
                <div
                    onClick={() => { setActiveTab('transactions'); setFilterStatus('All'); scrollToTable(); }}
                    className="relative overflow-hidden rounded-3xl p-6 group cursor-pointer hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 border border-white/5 bg-[#0f172a]"
                >
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] opacity-90"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-rose-600/30 transition-all duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl translate-y-12 -translate-x-12"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-rose-500/20 rounded-xl rounded-tr-none text-rose-500 shadow-lg shadow-rose-500/10 border border-rose-500/20 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                                <TrendingDown size={20} />
                            </div>
                            <div>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Outflow</h4>
                                <p className="text-emerald-400 text-[10px] font-bold mt-0.5 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live Updates
                                </p>
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight mb-2">₹ {stats.totalOutflow.toLocaleString('en-IN')}</h3>
                        <div className="w-full bg-slate-700/30 h-1 rounded-full overflow-hidden mt-2">
                            <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Pending Payouts Card */}
                <div
                    onClick={() => { setActiveTab('transactions'); setFilterStatus('Pending'); scrollToTable(); }}
                    className="relative overflow-hidden rounded-3xl p-6 group cursor-pointer hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 border border-white/5 bg-[#0f172a]"
                >
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] opacity-90"></div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-amber-500/30 transition-all duration-500"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-amber-500/20 rounded-xl rounded-tr-none text-amber-500 shadow-lg shadow-amber-500/10 border border-amber-500/20 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Pending Payouts</h4>
                                <p className="text-amber-400 text-[10px] font-bold mt-0.5 uppercase">Action Required</p>
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight mb-2">₹ {stats.pendingAmount.toLocaleString('en-IN')}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                {stats.pendingCount} Due
                            </span>
                            <span className="text-slate-500 text-[10px] font-bold">Review &rarr;</span>
                        </div>
                    </div>
                </div>

                {/* Add New Payout Card */}
                <div
                    onClick={() => { setEditingExpenseId(null); setNewExpense({ title: '', party: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Stock Purchase', method: 'Cash', notes: '' }); setIsAddModalOpen(true); }}
                    className="relative overflow-hidden rounded-3xl p-6 group cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border border-white/5 bg-[#0f172a]"
                >
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -bottom-12 -right-12 text-white/10 transform rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500 ease-out">
                        <Plus size={140} strokeWidth={1} />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Plus size={24} />
                            </div>
                            <div className="px-2 py-1 bg-white/20 rounded-full text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">New</div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-2xl font-extrabold text-white leading-tight mb-0.5">Make Payment</h3>
                            <p className="text-indigo-200 text-xs font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                                Tap to record <ArrowUpRight size={14} />
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation & Search */}
            <div ref={tableRef} className="bg-[#1e293b]/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/5 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
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
                        <button onClick={() => { setEditingDealerId(null); setNewDealer({ name: '', contact: '', category: 'Electronics', address: '' }); setIsAddDealerModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2">
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
                                    <tr className="border-b border-white/10 text-lg font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="p-6 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.length === filteredExpenses.length && filteredExpenses.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0 w-6 h-6"
                                            />
                                        </th>
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
                                        <tr key={expense.id} className={`group hover:bg-white/5 transition-colors text-xl border-l-2 ${selectedItems.includes(expense.id) ? 'bg-indigo-500/5 border-indigo-500' : 'border-transparent'}`}>
                                            <td className="p-6 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(expense.id)}
                                                    onChange={() => handleToggleSelect(expense.id)}
                                                    className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-0 w-6 h-6"
                                                />
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-white text-2xl">EXP-{String(expense.id).padStart(3, '0')}</div>
                                                <div className="text-lg text-slate-500 mt-2">{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-white text-2xl">{expense.party}</div>
                                                <div className="text-lg text-slate-500 mt-2">{expense.title}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-base font-medium border border-white/5">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className="uppercase text-base font-bold tracking-wider text-slate-400 border border-white/10 px-4 py-2 rounded bg-[#0f172a]">
                                                    {expense.method}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right font-bold text-3xl">
                                                ₹ {expense.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-bold capitalize ${expense.status === 'Paid'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    }`}>
                                                    <span className={`w-2.5 h-2.5 rounded-full ${expense.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {expense.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-center flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditExpense(expense)}
                                                    className="p-3 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredExpenses.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-500 text-xl">
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
                        {filteredDealers.map((dealer) => {
                            const totalPaid = expenses.filter(e => e.party === dealer.name && e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
                            const lastPayment = expenses.filter(e => e.party === dealer.name).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                            return (
                                <div key={dealer.id} className="bg-[#1e293b]/40 hover:bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/5 group transition-all hover:shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                                        <DollarSign size={100} className="text-white transform rotate-12 translate-x-4 -translate-y-4" />
                                    </div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="h-14 w-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditDealer(dealer)} className="p-2 text-slate-500 hover:text-indigo-400 bg-black/20 hover:bg-indigo-500/10 rounded-xl transition-all"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteDealer(dealer.id)} className="p-2 text-slate-500 hover:text-rose-500 bg-black/20 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-xl font-bold text-white mb-1">{dealer.name}</h4>
                                        <p className="text-slate-400 text-sm font-medium mb-4">{dealer.category}</p>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total Paid</p>
                                                <p className="text-lg font-bold text-emerald-400">₹ {(totalPaid / 1000).toFixed(1)}k</p>
                                            </div>
                                            <div className="bg-[#0f172a]/50 p-3 rounded-xl border border-white/5">
                                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Last Paid</p>
                                                <p className="text-sm font-bold text-white">{lastPayment ? new Date(lastPayment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                                <Phone size={16} className="text-slate-500" /> {dealer.contact}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
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
                                onClick={() => { alert(`Exporting ${selectedItems.length} items...`); }}
                                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors"
                            >
                                <FileText size={16} /> Export Selected
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
            </AnimatePresence>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
                        <motion.div onClick={(e) => e.stopPropagation()} className="bg-[#1e293b] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div><h2 className="text-2xl font-extrabold text-white">{editingExpenseId ? 'Edit Payout' : 'Add New Payout'}</h2><p className="text-slate-400 text-sm font-medium mt-1">{editingExpenseId ? 'Update payment details.' : 'Record a payment to dealer.'}</p></div>
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
                                    <button type="submit" className="flex-1 py-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-95 transition-all">
                                        {editingExpenseId ? 'Update Payout' : 'Record Payment'}
                                    </button>
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
                                <div><h2 className="text-2xl font-extrabold text-white">{editingDealerId ? 'Edit Dealer' : 'Add New Dealer'}</h2><p className="text-slate-400 text-sm font-medium mt-1">{editingDealerId ? 'Update details' : 'Add a new party or vendor.'}</p></div>
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
                                    <button type="submit" className="flex-1 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">{editingDealerId ? 'Update Dealer' : 'Save Dealer'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
