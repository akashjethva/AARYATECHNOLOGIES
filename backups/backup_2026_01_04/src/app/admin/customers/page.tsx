"use client";

import { UserPlus, Search, MoreVertical, Phone, MapPin, Filter, Mail, X, History, ArrowDownRight, ArrowUpRight, Check, AlertCircle, Save, Edit, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
    id: number;
    name: string;
    contact: string;
    phone: string;
    city: string;
    status: "Active" | "Inactive";
    balance: string;
    email?: string;
    address?: string;
    zone?: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([
        { id: 1, name: "Shiv Shakti Traders", contact: "Rajesh Bhai", phone: "+91 98765 11223", city: "Ahmedabad", status: "Active", balance: "15,200", email: "shivshakti@gmail.com", address: "123, Market Yard, Naroda", zone: "East" },
        { id: 2, name: "Jay Mataji Store", contact: "Vikram Sinh", phone: "+91 91234 99887", city: "Surat", status: "Active", balance: "8,500", email: "jaymataji@gmail.com", address: "45, Varachha Road", zone: "West" },
        { id: 3, name: "Om Enterprise", contact: "Amit Shah", phone: "+91 99887 55443", city: "Vadodara", status: "Inactive", balance: "0", email: "om.ent@gmail.com", address: "88, Alkapuri", zone: "Central" },
        { id: 4, name: "Ganesh Provision", contact: "Suresh Patel", phone: "+91 98980 12345", city: "Rajkot", status: "Active", balance: "12,500", email: "ganesh.prov@gmail.com", address: "12, Soni Bazar", zone: "North" },
        { id: 5, name: "Maruti Nandan", contact: "Vikram Solanki", phone: "+91 97654 32109", city: "Surat", status: "Active", balance: "2,100", email: "maruti@gmail.com", address: "Ring Road, Surat", zone: "South" },
        { id: 6, name: "Khodiyar General", contact: "Ketan Bhai", phone: "+91 99000 88777", city: "Ahmedabad", status: "Inactive", balance: "45,000", email: "khodiyar@gmail.com", address: "Gota, Ahmedabad", zone: "North" },
        { id: 7, name: "Umiya Traders", contact: "Praveen Patel", phone: "+91 88776 65544", city: "Mehsana", status: "Active", balance: "8,900", email: "umiya@gmail.com", address: "Highway Road", zone: "North" },
        { id: 8, name: "Balaji Kirana", contact: "Ramesh Gupta", phone: "+91 77665 54433", city: "Vadodara", status: "Active", balance: "5,600", email: "balaji@gmail.com", address: "Manjalpur", zone: "South" },
        { id: 9, name: "Sardar Stores", contact: "Manish Singh", phone: "+91 66554 43322", city: "Rajkot", status: "Inactive", balance: "0", email: "sardar@gmail.com", address: "Yagnik Road", zone: "West" },
    ]);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");

    // State for Editing
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", contact: "", phone: "", city: "", balance: "", email: "", address: "", zone: "" });

    // Filter Options
    const filterOptions = ["All", "Active", "Inactive", "Ahmedabad", "Surat", "Rajkot", "Vadodara"];

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
                        c.city === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const handleSaveCustomer = () => {
        if (!formData.name) return;

        if (editingId) {
            // Edit Existing
            setCustomers(customers.map(c => c.id === editingId ? { ...c, ...formData, status: c.status } : c));
        } else {
            // Add New
            setCustomers([...customers, {
                id: Date.now(),
                ...formData,
                status: "Active",
                balance: formData.balance || "0",
                city: formData.city || "Unknown"
            }]);
        }

        setIsAddModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", contact: "", phone: "", city: "", balance: "", email: "", address: "", zone: "" });
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
            address: customer.address || "",
            zone: customer.zone || ""
        });
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setCustomers(customers.filter(c => c.id !== id));
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: "", contact: "", phone: "", city: "", balance: "", email: "", address: "", zone: "" });
        setIsAddModalOpen(true);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 relative pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 p-8 rounded-[2rem] border border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-bold text-indigo-200 mb-2 shadow-sm backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Total Customers: {customers.length}
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

            {/* Filters & Search */}
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

            {/* Customers Grid */}
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
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Zone</label>
                                        <select
                                            value={formData.zone}
                                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold"
                                        >
                                            <option value="">Select Zone</option>
                                            <option value="North">North</option>
                                            <option value="South">South</option>
                                            <option value="East">East</option>
                                            <option value="West">West</option>
                                            <option value="Central">Central</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opening Balance (₹)</label>
                                        <input
                                            type="number"
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

function CustomerCard({ customer, onViewHistory, onEdit, onDelete }: { customer: Customer, onViewHistory: () => void, onEdit: () => void, onDelete: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                {customer.zone && (
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                        <MapPin size={16} className="text-slate-500" />
                        {customer.zone} Zone
                    </div>
                )}
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
                    <p className="text-blue-400 font-bold text-lg mt-1">₹ {customer.balance}</p>
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

    const handleDownloadStatement = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) return;

        const htmlContent = `
            <html>
            <head>
                <title>Statement - ${customer.name}</title>
                <style>
                    @media print { @page { margin: 0; } body { margin: 1.6cm; } }
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                    .logo-container { display: flex; align-items: center; gap: 12px; }
                    .logo-text { font-size: 24px; font-weight: 800; color: #000000; letter-spacing: -0.5px; }
                    .invoice-title { font-size: 20px; font-weight: bold; text-align: right; color: #64748b; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                    .value { font-size: 16px; font-weight: 600; }
                    table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; padding: 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    .amount { text-align: right; font-weight: bold; }
                    .amount.credit { color: #10b981; }
                    .amount.debit { color: #f43f5e; }
                    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-container">
                        <div class="logo-text">AARYA TECHNOLOGIES</div>
                    </div>
                    <div class="invoice-title">STATEMENT OF ACCOUNTS</div>
                </div>

                <div class="details-grid">
                    <div>
                        <div class="label">Billed To</div>
                        <div class="value">${customer.name}</div>
                        <div style="font-size: 14px; color: #475569; margin-top: 4px;">${customer.address || 'Address Not Provided'}</div>
                        <div style="font-size: 14px; color: #475569;">${customer.city}, Gujarat</div>
                        <div style="font-size: 14px; color: #475569; margin-top: 4px;">Ph: ${customer.phone}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="label">Statement Date</div>
                        <div class="value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div class="label" style="margin-top: 16px;">Total Outstanding</div>
                        <div class="value" style="font-size: 24px; color: #ef4444;">₹ ${customer.balance}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Mode</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                         <tr>
                            <td>Jan 02, 2026</td>
                            <td>Payment Received (Rahul Varma)</td>
                            <td>Cash</td>
                            <td class="amount credit">+ 5,000</td>
                        </tr>
                         <tr>
                            <td>Dec 28, 2025</td>
                            <td>Invoice #INV-2025-001</td>
                            <td>Bill</td>
                            <td class="amount">12,000</td>
                        </tr>
                         <tr>
                            <td>Dec 25, 2025</td>
                            <td>Payment Received (Amit Kumar)</td>
                            <td>UPI</td>
                            <td class="amount credit">+ 2,000</td>
                        </tr>
                         <tr>
                            <td>Dec 20, 2025</td>
                            <td>Cheque Bounce Charges</td>
                            <td>Fee</td>
                            <td class="amount debit">- 500</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    This is a computer generated statement and does not require a signature.<br>
                    Generated by Aarya Technologies.
                </div>
                
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#1e293b] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                            {customer.name[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                            <p className="text-slate-400 text-sm">Customer Report & History</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Paid</p>
                            <div className="flex items-end gap-2">
                                <h4 className="text-2xl font-bold text-emerald-400">₹ 1,25,000</h4>
                                <ArrowUpRight className="text-emerald-500 mb-1" size={20} />
                            </div>
                        </div>
                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pending Due</p>
                            <div className="flex items-end gap-2">
                                <h4 className="text-2xl font-bold text-rose-400">₹ {customer.balance}</h4>
                                <ArrowDownRight className="text-rose-500 mb-1" size={20} />
                            </div>
                        </div>
                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Last Payment</p>
                            <div className="flex items-end gap-2">
                                <h4 className="text-2xl font-bold text-blue-400">2 Days Ago</h4>
                                <History className="text-blue-500 mb-1" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-[#0f172a]/50 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h4 className="font-bold text-white">Transaction History</h4>
                            <button onClick={handleDownloadStatement} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Download Statement</button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Staff</th>
                                    <th className="p-4">Mode</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-300">
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">Jan 02, 2026</td>
                                    <td className="p-4 font-bold text-white">Payment Received</td>
                                    <td className="p-4">Rahul Varma</td>
                                    <td className="p-4"><span className="bg-white/5 px-2 py-1 rounded border border-white/5 text-xs">Cash</span></td>
                                    <td className="p-4 text-right font-bold text-emerald-400">+ ₹ 5,000</td>
                                    <td className="p-4 text-center"><Check size={16} className="bg-emerald-500/20 text-emerald-500 rounded-full p-0.5 inline" /></td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">Dec 28, 2025</td>
                                    <td className="p-4 font-bold text-white">Invoice #INV-2025-001</td>
                                    <td className="p-4">System</td>
                                    <td className="p-4"><span className="bg-white/5 px-2 py-1 rounded border border-white/5 text-xs">Bill</span></td>
                                    <td className="p-4 text-right font-bold text-white">₹ 12,000</td>
                                    <td className="p-4 text-center"><span className="text-xs font-bold text-slate-500">Billed</span></td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">Dec 25, 2025</td>
                                    <td className="p-4 font-bold text-white">Payment Received</td>
                                    <td className="p-4">Amit Kumar</td>
                                    <td className="p-4"><span className="bg-white/5 px-2 py-1 rounded border border-white/5 text-xs">UPI</span></td>
                                    <td className="p-4 text-right font-bold text-emerald-400">+ ₹ 2,000</td>
                                    <td className="p-4 text-center"><Check size={16} className="bg-emerald-500/20 text-emerald-500 rounded-full p-0.5 inline" /></td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">Dec 20, 2025</td>
                                    <td className="p-4 font-bold text-white">Cheque Bounce - Charge</td>
                                    <td className="p-4">System</td>
                                    <td className="p-4"><span className="bg-white/5 px-2 py-1 rounded border border-white/5 text-xs">Fee</span></td>
                                    <td className="p-4 text-right font-bold text-rose-400">- ₹ 500</td>
                                    <td className="p-4 text-center"><AlertCircle size={16} className="text-rose-500 inline" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-[#0f172a]/50 flex justify-end gap-4 shrink-0">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white font-bold transition-colors">
                        Close
                    </button>
                    <button onClick={handleDownloadStatement} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                        <Download size={18} />
                        Download Full Report
                    </button>
                </div>

            </motion.div>
        </div>
    )
}
