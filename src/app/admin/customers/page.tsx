"use client";

import { UserPlus, Search, MoreVertical, Phone, MapPin, Filter, Mail, X, History, ArrowDownRight, ArrowUpRight, Check, AlertCircle, Save, Edit, Trash2, Download, Bell, Navigation, Link as LinkIcon, ShieldCheck, TrendingUp, Map, CheckCircle, MessageSquare, FileText, Wallet, Info, LayoutGrid, List, User } from "lucide-react";
import { useState, useCallback, memo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";
import { db, Customer, Collection } from "@/services/db";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        // Load initial data
        setCustomers(db.getCustomers());
    }, []);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");

    const handleDownloadPendingReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Pending Dues Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        const pendingCustomers = customers.filter(c => (parseFloat(c.balance.replace(/,/g, '')) || 0) > 0);
        const totalPending = pendingCustomers.reduce((sum, c) => sum + (parseFloat(c.balance.replace(/,/g, '')) || 0), 0);

        doc.text(`Total Pending Amount: Rs. ${totalPending.toLocaleString('en-IN')}`, 14, 34);

        // Table Data
        const tableColumn = ["Customer Name", "City", "Mobile", "Pending Balance (Rs.)"];
        const tableRows = pendingCustomers.map(c => [
            c.name,
            c.city,
            c.phone,
            c.balance
        ]);

        // @ts-ignore
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo color
            styles: { fontSize: 10, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        doc.save("pending_dues_report.pdf");
    };

    // State for Editing
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", contact: "", phone: "", city: "", balance: "", email: "", address: "" });

    // View Mode State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter Options
    const filterOptions = ["All", "Active", "Inactive", "Pending Dues", "Ahmedabad", "Surat", "Rajkot", "Vadodara"];

    // Filter Logic
    const filteredCustomers = customers.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery);

        const matchesFilter =
            activeFilter === "All" ? true :
                activeFilter === "Active" ? c.status === "Active" :
                    activeFilter === "Inactive" ? c.status === "Inactive" :
                        activeFilter === "Pending Dues" ? (parseFloat(c.balance.replace(/,/g, '')) || 0) > 0 :
                            c.city === activeFilter;

        return matchesSearch && matchesFilter;
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = db.getRowsPerPage();

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);

    const handleSaveCustomer = () => {
        if (!formData.name) return;

        let updatedList;
        if (editingId) {
            // Edit Existing
            const existing = customers.find(c => c.id === editingId);
            if (existing) {
                const updatedCustomer = { ...existing, ...formData };
                updatedList = db.saveCustomer(updatedCustomer);
            }
        } else {
            // Add New
            const newCustomer: Customer = {
                id: Date.now(),
                ...formData,
                status: "Active" as const, // Fix type inference
                balance: formData.balance || "0",
                city: formData.city || "Unknown"
            };
            updatedList = db.saveCustomer(newCustomer);
        }

        if (updatedList) setCustomers(updatedList);

        setIsAddModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", contact: "", phone: "", city: "", balance: "", email: "", address: "" });
    };

    const handleEditClick = (customer: Customer) => {
        setEditingId(customer.id);
        setFormData({
            name: customer.name,
            contact: customer.contact,
            phone: customer.phone,
            city: customer.city,
            balance: customer.balance,
            email: customer.email || "",
            address: customer.address || ""
        });
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            const updatedList = db.deleteCustomer(id);
            setCustomers(updatedList);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: "", contact: "", phone: "", city: "", balance: "", email: "", address: "" });
        setIsAddModalOpen(true);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 relative pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 p-8 rounded-[2rem] border border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div
                            onClick={() => setActiveFilter("All")}
                            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-bold shadow-lg backdrop-blur-md cursor-pointer transition-transform active:scale-95 border ${activeFilter === 'All' ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-100 ring-2 ring-indigo-500/20' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                        >
                            <span className={`w-3 h-3 rounded-full animate-pulse ${activeFilter === 'All' ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
                            Total Customers: {customers.length}
                        </div>
                        <div
                            onClick={() => setActiveFilter("Pending Dues")}
                            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-bold shadow-lg backdrop-blur-md cursor-pointer transition-transform active:scale-95 border ${activeFilter === 'Pending Dues' ? 'bg-rose-500/20 border-rose-500/50 text-rose-100 ring-2 ring-rose-500/20' : 'bg-white/5 border-white/10 text-rose-300 hover:bg-white/10'}`}
                        >
                            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                            Total Pending: {customers.reduce((sum, c) => sum + (parseFloat(c.balance.replace(/,/g, '')) || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Customers</h1>
                    <p className="text-slate-300 mt-2 text-lg font-medium max-w-lg">Manage detailed customer profiles and collection history.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-white text-indigo-950 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-white/5 transition-transform active:scale-95 relative z-10"
                >
                    <UserPlus size={22} strokeWidth={3} />
                    <span>Add Customer</span>
                </button>
            </div>

            {/* Filters & Search & Download */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-[#1e293b]/60 p-2 rounded-2xl shadow-xl border border-white/5 flex gap-4 flex-1 backdrop-blur-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search customers by name, city, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none font-medium text-slate-200 placeholder:text-slate-500 focus:bg-white/5 rounded-xl transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* PDF Download Button */}
                    <button
                        onClick={handleDownloadPendingReport}
                        className="p-4 rounded-xl bg-[#0f172a] border border-white/10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all shadow-lg flex items-center justify-center"
                        title="Download Pending Dues Report"
                    >
                        <Download size={20} />
                    </button>

                    {/* View Toggle */}
                    <div className="bg-[#1e293b]/60 p-1.5 rounded-xl border border-white/5 flex items-center backdrop-blur-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-4 rounded-xl transition-colors border flex items-center gap-2 font-bold ${activeFilter !== 'All' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#1e293b]/60 border-white/5 text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <Filter size={20} />
                            <span className="hidden md:inline">{activeFilter === 'All' ? 'Filters' : activeFilter}</span>
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
                                            onClick={() => { setActiveFilter(opt); setIsFilterOpen(false); }}
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

            {/* Customers View (Grid vs List) */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onViewHistory={() => setSelectedCustomer(customer)}
                                onEdit={() => handleEditClick(customer)}
                                onDelete={() => handleDeleteClick(customer.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-500">
                            <Search size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-xl font-bold">No customers found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0f172a]/50 text-slate-400 font-bold text-sm uppercase tracking-wider border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Customer Name</th>
                                    <th className="px-6 py-6">Contact Info</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-6 py-6">City</th>
                                    <th className="px-6 py-6 text-right">Balance</th>
                                    <th className="px-8 py-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-base">
                                {filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((customer) => (
                                    <tr key={customer.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                                    {customer.name[0]}
                                                </div>
                                                <span className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <User size={16} className="text-slate-500" />
                                                    <span className="font-medium">{customer.contact}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Phone size={16} className="text-slate-500" />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${customer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-slate-300 font-medium">{customer.city}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-bold text-blue-400 text-xl">₹ {customer.balance}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(customer)} className="p-2 hover:bg-white/10 rounded-lg text-amber-400 hover:text-amber-300 transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(customer.id)} className="p-2 hover:bg-white/10 rounded-lg text-rose-400 hover:text-rose-300 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                                <button onClick={() => setSelectedCustomer(customer)} className="p-2 hover:bg-white/10 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors" title="View History">
                                                    <History size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCustomers.length === 0 && (
                            <div className="py-20 text-center text-slate-500">
                                <Search size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="text-xl font-bold">No customers found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Customer Ledger Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <CustomerLedgerModal
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
            </AnimatePresence>

            {/* Add/Edit Customer Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/10 relative z-10"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-1">Enter customer business details below</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business / Customer Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Shiv Shakti Traders"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Person</label>
                                        <input
                                            type="text"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            placeholder="e.g. Rajesh Bhai"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold tracking-wide placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="business@example.com"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="e.g. Ahmedabad"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter full address..."
                                            rows={2}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opening Balance (₹)</label>
                                        <input
                                            type="text"
                                            value={formData.balance}
                                            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                            placeholder="0"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCustomer}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center justify-center gap-3 border border-indigo-500/50 mt-6"
                                >
                                    <Save size={24} />
                                    {editingId ? 'Update Customer' : 'Save Customer'}
                                </button>
                            </div>

                            {/* Pagination Controls */}
                            {filteredCustomers.length > 0 && (
                                <div className="flex justify-between items-center mt-8 p-4 bg-[#1e293b]/40 rounded-2xl border border-white/5">
                                    <div className="text-slate-400 text-sm font-medium">
                                        Showing <span className="text-white font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredCustomers.length)}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="text-white font-bold">{filteredCustomers.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5 transition-colors">Previous</button>
                                        <button disabled={currentPage * itemsPerPage >= filteredCustomers.length} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white disabled:opacity-50 hover:bg-white/5 transition-colors">Next</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

function CustomerCard({ customer, onViewHistory, onEdit, onDelete }: { customer: Customer, onViewHistory: () => void, onEdit: () => void, onDelete: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { formatCurrency } = useCurrency();

    return (
        <div className="bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white/5 hover:bg-[#1e293b] hover:border-indigo-500/30 transition-all duration-300 relative group">

            {/* Dropdown Menu */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                    <MoreVertical size={20} />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-32 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
                        >
                            <button onClick={() => { setIsMenuOpen(false); onEdit(); }} className="w-full px-4 py-3 text-left text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                                <Edit size={14} className="text-amber-400" /> Edit
                            </button>
                            <button onClick={() => { setIsMenuOpen(false); onDelete(); }} className="w-full px-4 py-3 text-left text-sm font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2">
                                <Trash2 size={14} /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-5 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    {customer.name[0]}
                </div>
                <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors">{customer.name}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">{customer.contact}</p>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                    <Phone size={16} className="text-slate-500" />
                    {customer.phone}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                    <MapPin size={16} className="text-slate-500" />
                    {customer.city}
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 mb-6">
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">STATUS</p>
                    <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${customer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {customer.status}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">BALANCE</p>
                    <p className="text-blue-400 font-bold text-lg mt-1">{formatCurrency(parseFloat(customer.balance.replace(/,/g, '') || '0'))}</p>
                </div>
            </div>

            <button
                onClick={onViewHistory}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3 rounded-xl font-bold text-sm transition-colors border border-white/5 flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500"
            >
                <History size={16} />
                View History & Reports
            </button>
        </div>
    )
}

function CustomerLedgerModal({ customer, onClose }: { customer: Customer, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState("Transaction Timeline");
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
    const { formatCurrency } = useCurrency();
    const [transactions, setTransactions] = useState<Collection[]>([]);

    useEffect(() => {
        try {
            if (!customer || !customer.id) {
                console.warn("CustomerLedgerModal: Missing customer or customer ID");
                return;
            }

            // Fetch and filter transactions for this customer
            const allCollections = db.getCollections();

            if (!Array.isArray(allCollections)) {
                console.error("CustomerLedgerModal: db.getCollections() returned non-array", allCollections);
                setTransactions([]);
                return;
            }

            // Ensure accurate ID matching (handling string/number types safely)
            const customerTransactions = allCollections.filter(c => String(c.customerId) === String(customer.id));

            // Sort by date descending
            customerTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTransactions(customerTransactions);
        } catch (err) {
            console.error("CustomerLedgerModal Error:", err);
            showToast("Error loading transactions", "info");
        }
    }, [customer?.id]); // Safe access in dependency

    const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    }, []);

    if (typeof window === 'undefined') return null;
    if (!customer) return null; // Extra safety guard

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                                <span className="flex items-center gap-2"><Phone size={16} className="text-slate-500" /> {customer.phone}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                <span className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" /> {customer.city}</span>
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

                {/* Toast Notification (Global) */}
                <AnimatePresence>
                    {toast.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1e293b] border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl z-[10000] flex items-center gap-4 min-w-[320px]"
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{toast.type === 'success' ? 'Success' : 'Information'}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
                            </div>
                            <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="ml-auto text-slate-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>



                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* LEFT PANEL - Financial Status */}
                    {/* LEFT PANEL - Financial Status (Memoized) */}
                    <CustomerFinancialPanel customer={customer} showToast={showToast} setActiveTab={setActiveTab} />

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
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 pl-4">
                            {/* Transaction Timeline Content */}
                            {activeTab === "Transaction Timeline" && (
                                <div className="space-y-10">
                                    {transactions.length > 0 ? (
                                        transactions.map((txn, index) => (
                                            <div key={txn.id || index} className="relative pl-10 border-l border-white/5 pb-2 last:pb-0 last:border-transparent group">
                                                <div className={`absolute -left-3.5 top-0 h-7 w-7 rounded-full bg-[#0b0c10] flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] ${txn.type === 'Credit' ? 'border-emerald-500/30 group-hover:border-emerald-500' : 'border-blue-500/30 group-hover:border-blue-500'}`}>
                                                    {txn.type === 'Credit' ? <ShieldCheck size={14} className="text-emerald-500" /> : <TrendingUp size={14} className="text-blue-500" />}
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">{new Date(txn.date).toLocaleDateString()}</p>
                                                        <h4 className="text-xl font-bold text-white mb-1">{txn.type === 'Credit' ? 'Payment Received' : 'Invoice/Debit'}</h4>
                                                        <p className="text-sm text-slate-400 font-medium">Processed by <span className="text-slate-200">Staff Link Needed</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xl font-bold mb-1 ${txn.type === 'Credit' ? 'text-emerald-400' : 'text-white'}`}>
                                                            {txn.type === 'Credit' ? '+' : ''} {formatCurrency(parseFloat(txn.amount))}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{txn.paymentMode || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 text-slate-500">
                                            <p>No transactions found for this customer.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Communication Content (Placeholder for now) */}
                            {activeTab === "Communication" && (
                                <div className="space-y-6">
                                    <div
                                        onClick={() => showToast("Message Status: Delivered (10:30 AM)", "info")}
                                        className="bg-[#151921] hover:bg-[#1f2937] cursor-pointer transition-colors p-5 rounded-2xl border border-white/5 flex gap-4 group"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">Payment Reminder Sent</h4>
                                                <span className="text-[10px] font-bold text-slate-500">Yesterday</span>
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed">Automated reminder sent via WhatsApp regarding overdue balance.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* KYC Content (Placeholder) */}
                            {activeTab === "KYC Docs" && (
                                <div className="text-center py-20 text-slate-500">
                                    <p>No KYC documents uploaded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}


function CustomerFinancialPanel({ customer, showToast, setActiveTab }: { customer: Customer, showToast: (msg: string, type: 'success' | 'info') => void, setActiveTab: (tab: string) => void }) {
    return (
        <div className="w-full md:w-[350px] bg-[#0b0c10] p-8 border-r border-white/5 flex flex-col shrink-0">
            <div className="mb-8 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">OUTSTANDING BALANCE</p>
                <div className="relative inline-block">
                    <h2 className="text-5xl font-extrabold text-white tracking-tight">₹ {customer.balance}</h2>
                    <span className="absolute -top-2 -right-6 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                </div>
                <p className="text-rose-400 text-xs font-bold mt-3 bg-rose-500/10 inline-block px-3 py-1 rounded-full border border-rose-500/20">Overdue by 15 Days</p>
            </div>

            <div className="space-y-4 mb-8">
                <div className="bg-[#151921] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Credit Limit</p>
                        <p className="text-lg font-bold text-slate-300">₹ 50,000</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Wallet size={18} />
                    </div>
                </div>
                <div className="bg-[#151921] p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Last Payment</p>
                        <p className="text-lg font-bold text-emerald-400">₹ 5,000</p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 text-right">
                        <p>Jan 02</p>
                        <p>Cash</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mt-auto">
                <button
                    onClick={() => { showToast("Payment Reminder Sent via WhatsApp!", "success"); setActiveTab("Communication"); }}
                    className="w-full bg-white text-indigo-950 hover:bg-indigo-50 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-white/5 transition-transform active:scale-95"
                >
                    <MessageSquare size={18} strokeWidth={2.5} />
                    Send Reminder
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-[#151921] hover:bg-white/10 text-white py-3 rounded-xl font-bold text-sm border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                        <Phone size={16} /> Call
                    </button>
                    <button className="bg-[#151921] hover:bg-white/10 text-white py-3 rounded-xl font-bold text-sm border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                        <Map size={16} /> Locate
                    </button>
                </div>
            </div>
        </div>
    );
}
