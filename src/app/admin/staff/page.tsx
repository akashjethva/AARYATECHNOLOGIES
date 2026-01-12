"use client";

import { UserPlus, Search, MoreVertical, Phone, X, Save, Edit, Trash2, Shield, Calendar, TrendingUp, LayoutGrid, List, CheckCircle, Clock, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";

// ... imports
import { db, Staff, Collection } from "@/services/db";

export default function StaffPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [editingId, setEditingId] = useState<number | null>(null);

    // Wallet State
    const [walletModal, setWalletModal] = useState<{ open: boolean, staffId: number | null, mode: 'add' | 'history' }>({ open: false, staffId: null, mode: 'add' });

    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const loadData = () => {
            setStaffList(db.getStaff());
            setCollections(db.getCollections());
        };
        loadData();

        const handleUpdate = () => loadData();
        window.addEventListener('staff-updated', handleUpdate);
        window.addEventListener('transaction-updated', handleUpdate); // Listen for sales too
        return () => {
            window.removeEventListener('staff-updated', handleUpdate);
            window.removeEventListener('transaction-updated', handleUpdate);
        };
    }, []);

    // Helper to calculate Today's Collection for a staff member (Minus Handovers)
    const getCollectedToday = (staffName: string) => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Sum up Collections (Cash + UPI) collected by this staff
        const collected = collections
            .filter(t => t.status === 'Paid' && t.date === today)
            .filter(t => {
                const txnStaffName = String(t.staff || '').replace(/\.$/, '').trim().toLowerCase();
                const currentStaffName = String(staffName || '').trim().toLowerCase();
                return txnStaffName === currentStaffName || txnStaffName.startsWith(currentStaffName) || currentStaffName.startsWith(txnStaffName);
            })
            .reduce((sum, t) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

        // 2. Subtract Handovers (Money given to Admin)
        const handedOver = collections
            .filter(t => t.status === 'Paid' && t.date === today && t.customer.startsWith('HANDOVER: '))
            .filter(t => {
                const handoverName = t.customer.replace('HANDOVER: ', '').trim().toLowerCase();
                const currentStaffName = String(staffName || '').trim().toLowerCase();
                return handoverName === currentStaffName || handoverName.startsWith(currentStaffName);
            })
            .reduce((sum, t) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

        return Math.max(0, collected - handedOver);
    };

    const [formData, setFormData] = useState({ name: "", phone: "", role: "Field Agent", email: "", zone: "", address: "", pin: "0000", employeeId: "" });
    // Filter Logic
    const filteredStaff = staffList.filter(staff =>
        String(staff.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(staff.phone || '').includes(searchQuery) ||
        String(staff.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = db.getRowsPerPage();

    // Reset page on search
    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const handleSaveStaff = () => {
        if (!formData.name || !formData.phone) return;

        const newStaffMember: Staff = {
            id: editingId || Date.now(),
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
            status: "Active",
            collectedToday: 0, // No longer used for display, can be ignored or removed
            joined: editingId ? (staffList.find(s => s.id === editingId)?.joined || "") : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            email: formData.email,
            zone: formData.zone,
            address: formData.address,
            pin: formData.pin || "0000",
            employeeId: formData.employeeId
        };

        const updatedList = db.saveStaff(newStaffMember);
        setStaffList(updatedList);
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            const updatedList = db.deleteStaff(id);
            setStaffList(updatedList);
        }
    };

    const openEditModal = (staff: Staff) => {
        setEditingId(staff.id);
        setFormData({
            name: staff.name,
            phone: staff.phone,
            role: staff.role,
            email: staff.email || "",
            zone: staff.zone || "",
            address: staff.address || "",
            pin: staff.pin || "0000",
            employeeId: staff.employeeId || ""
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", phone: "", role: "Field Agent", email: "", zone: "", address: "", pin: "0000", employeeId: "" });
    };

    const { formatCurrency } = useCurrency();

    // Stats Logic using Dynamic Transactions
    const totalDailyCollection = filteredStaff.reduce((sum, s) => sum + getCollectedToday(s.name), 0);

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 relative pb-20">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Staff Management</h1>
                    <p className="text-slate-400 mt-2 font-medium">Manage field staff, performance, and access levels</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex bg-[#0f172a] p-1.5 rounded-2xl border border-white/10 shadow-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 font-bold border border-indigo-500/50"
                    >
                        <UserPlus size={20} />
                        <span className="hidden sm:inline">Add New Staff</span>
                        <span className="sm:hidden">Add Staff</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:bg-[#1e293b]/60 transition-colors">
                    <div className="absolute top-4 right-4 opacity-10 group-hover:scale-110 transition-transform"><Shield size={64} /></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Staff</p>
                    <h3 className="text-3xl font-extrabold text-white">{staffList.length}</h3>
                </div>
                <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:bg-[#1e293b]/60 transition-colors">
                    <div className="absolute top-4 right-4 opacity-10 group-hover:scale-110 transition-transform"><CheckCircle size={64} /></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Today</p>
                    <h3 className="text-3xl font-extrabold text-emerald-400">{staffList.filter(s => s.status === 'Active').length}</h3>
                </div>
                <div className="bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:bg-[#1e293b]/60 transition-colors">
                    <div className="absolute top-4 right-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={64} /></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Collections Today</p>
                    <h3 className="text-3xl font-extrabold text-indigo-400">
                        {formatCurrency(totalDailyCollection)}
                    </h3>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-[#1e293b]/60 p-2 rounded-2xl shadow-xl border border-white/5 flex gap-4 max-w-2xl backdrop-blur-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search staff by name, phone, or role..."
                        className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none font-medium text-slate-200 placeholder:text-slate-500 focus:bg-white/5 rounded-xl transition-colors"
                    />
                </div>
            </div>

            {/* Content Area - Grid or List */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Staff Grid */}
                        <AnimatePresence>
                            {filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((staff) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={staff.id}
                                >
                                    <StaffCard
                                        staff={{ ...staff, collectedToday: getCollectedToday(staff.name) }}
                                        onEdit={() => openEditModal(staff)}
                                        onDelete={() => handleDelete(staff.id)}
                                        onWallet={(mode: 'add' | 'history') => setWalletModal({ open: true, staffId: staff.id, mode })}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-[#1e293b]/40 backdrop-blur-sm rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#0f172a]/50">
                                        <th className="px-8 py-6">Staff Member</th>
                                        <th className="px-6 py-6">Role / Designation</th>
                                        <th className="px-6 py-6">Status</th>
                                        <th className="px-6 py-6 text-right">Collected Today</th>
                                        <th className="px-6 py-6">Joined Date</th>
                                        <th className="px-8 py-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-white divide-y divide-white/5">
                                    {filteredStaff.map((staff) => (
                                        <tr key={staff.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                                                        {String(staff.name || 'Unknown').split(' ').map((n) => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-white">{staff.name}</div>
                                                        <div className="text-slate-400 text-sm flex items-center gap-1.5"><Phone size={12} /> {staff.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-medium text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5 w-fit">
                                                    {staff.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {(() => {
                                                    const isOnline = staff.lastSeen && (Date.now() - staff.lastSeen) < 120000; // 2 mins
                                                    const statusLabel = staff.status === 'Inactive' ? 'Inactive' : (isOnline ? 'Online' : 'Offline');
                                                    const statusColor = staff.status === 'Inactive' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : (isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/20');

                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${statusLabel === 'Online' ? 'bg-emerald-500 animate-pulse' : (statusLabel === 'Inactive' ? 'bg-rose-500' : 'bg-slate-500')}`}></span>
                                                            {statusLabel}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="font-mono font-bold text-indigo-300 text-lg">{formatCurrency(getCollectedToday(staff.name))}</div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-400 text-sm font-medium">
                                                {staff.joined}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(staff)} className="p-2 hover:bg-white/10 rounded-lg text-amber-400 transition-colors" title="Edit">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(staff.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredStaff.length === 0 && (
                            <div className="text-center py-20 opacity-50">
                                <p className="text-xl font-bold text-slate-400">No staff members found matching your search.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Staff Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/10 relative z-10"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                                <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Employee ID - NEW FIELD */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employee ID</label>
                                        <input
                                            type="text"
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                            placeholder="e.g. EMP-001"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-bold placeholder:text-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Rahul Varma"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold tracking-wide placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="rahul@example.com"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Zone / Area</label>
                                        <input
                                            type="text"
                                            value={formData.zone}
                                            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                            placeholder="e.g. North Zone"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium cursor-pointer"
                                        >
                                            <option>Field Agent</option>
                                            <option>Senior Field Officer</option>
                                            <option>Collection Agent</option>
                                            <option>Account</option>
                                            <option>Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600 cursor-pointer"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Security PIN (4 Digits)</label>
                                        <input
                                            type="text"
                                            value={formData.pin}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                setFormData({ ...formData, pin: val });
                                            }}
                                            placeholder="Enter 4-digit PIN"
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-bold tracking-widest text-center placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Residential Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter full address..."
                                            rows={3}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveStaff}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2 border border-indigo-500/50 mt-4"
                                >
                                    <Save size={20} />
                                    {editingId ? 'Update Staff Member' : 'Save Staff Member'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Wallet Modal */}
            <WalletModal
                isOpen={walletModal.open}
                onClose={() => setWalletModal({ ...walletModal, open: false })}
                staffId={walletModal.staffId}
                initialMode={walletModal.mode}
            />
        </div>
    );
}

function WalletModal({ isOpen, onClose, staffId, initialMode }: any) {
    const [mode, setMode] = useState<'add' | 'history'>(initialMode);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'Credit' | 'Debit'>('Credit');
    const [remarks, setRemarks] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { setMode(initialMode); }, [initialMode, isOpen]);

    useEffect(() => {
        if (isOpen && staffId) {
            setLogs(db.getStaffWalletLogs(staffId));
        }
    }, [isOpen, staffId, mode]); // reload on mode switch too to be safe? mainly open

    const handleSubmit = () => {
        if (!amount || !remarks || !staffId) return;
        setLoading(true);
        setTimeout(() => {
            const adminName = db.getAdminProfile().name;
            const success = db.updateStaffWallet(staffId, parseFloat(amount), type, remarks, adminName);
            if (success) {
                setAmount('');
                setRemarks('');
                setLogs(db.getStaffWalletLogs(staffId)); // refresh logs immediately
                if (mode === 'add') onClose(); // Close if adding, or maybe switch to history? let's close.
            }
            setLoading(false);
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1e293b] rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/10 relative z-10"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                    <div className="flex gap-4">
                        <button onClick={() => setMode('add')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${mode === 'add' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Update Balance</button>
                        <button onClick={() => setMode('history')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${mode === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>History Log</button>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {mode === 'add' ? (
                        <div className="space-y-4">
                            <div className="flex bg-[#0f172a] p-1 rounded-xl border border-white/10">
                                <button onClick={() => setType('Credit')} className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${type === 'Credit' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                    <TrendingUp size={16} /> Add (Credit)
                                </button>
                                <button onClick={() => setType('Debit')} className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${type === 'Debit' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                    <TrendingUp size={16} className="rotate-180" /> Deduct (Debit)
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Amount (₹)</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Remarks / Reason</label>
                                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Advance Salary, Expense Reimbursement..." rows={3} className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 resize-none" />
                            </div>

                            <button onClick={handleSubmit} disabled={loading || !amount} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg mt-2 transition-all active:scale-95">
                                {loading ? 'Processing...' : (type === 'Credit' ? 'Add Funds' : 'Deduct Funds')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                {logs.length > 0 ? logs.map((log) => (
                                    <div key={log.id} className="bg-[#0f172a] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <p className={`text-sm font-bold ${log.type === 'Credit' ? 'text-emerald-400' : 'text-rose-400'}`}>{log.type === 'Credit' ? 'Credit (+)' : 'Debit (-)'}</p>
                                            <p className="text-xs text-slate-500 mt-1">{log.date} at {log.time}</p>
                                            <p className="text-xs text-slate-300 mt-1 italic">"{log.remarks}"</p>
                                            <p className="text-[10px] text-slate-600 mt-1">By {log.adminName}</p>
                                        </div>
                                        <div className={`text-lg font-bold ${log.type === 'Credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {log.type === 'Credit' ? '+' : '-'}{log.amount}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-500 text-sm font-medium">No history available</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

function StaffCard({ staff, onEdit, onDelete, onWallet }: any) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white/5 hover:bg-[#1e293b] hover:border-indigo-500/30 transition-all duration-300 relative group"
        >
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                    className="text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-full transition-all border border-white/5 shadow-lg"
                >
                    <MoreVertical size={20} />
                </button>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-12 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-1.5 overflow-hidden ring-1 ring-white/10"
                            onMouseLeave={() => setIsMenuOpen(false)}
                        >
                            <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-left transition-colors">
                                <Edit size={14} className="text-amber-400" /> Edit Details
                            </button>
                            <button onClick={() => { onWallet('history'); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-left transition-colors">
                                <Clock size={14} className="text-blue-400" /> View History
                            </button>
                            <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg text-left transition-colors">
                                <Trash2 size={14} /> Delete Staff
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-5 mb-6">
                <div className="h-20 w-20 rounded-[1.2rem] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                    {String(staff.name || 'Unknown').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-indigo-300 transition-colors">{staff.name}</h3>
                    <div className="flex items-center text-slate-400 font-medium text-sm gap-1.5 mt-1">
                        <Shield size={14} className="text-indigo-400" />
                        {staff.role}
                    </div>
                    <div className="flex items-center text-slate-500 font-medium text-xs gap-1.5 mt-1">
                        <Phone size={12} />
                        {staff.phone}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">STATUS</p>
                    {(() => {
                        const isOnline = staff.lastSeen && (Date.now() - staff.lastSeen) < 120000; // 2 mins
                        const statusLabel = staff.status === 'Inactive' ? 'Inactive' : (isOnline ? 'Online' : 'Offline');
                        const statusColor = staff.status === 'Inactive' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : (isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/20');

                        return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusLabel === 'Online' ? 'bg-emerald-500 animate-pulse' : (statusLabel === 'Inactive' ? 'bg-rose-500' : 'bg-slate-500')}`}></span>
                                {statusLabel}
                            </span>
                        );
                    })()}
                </div>
                {/* WALLET SECTION */}
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">WALLET</p>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-white font-bold text-xl tracking-tight">{formatCurrency(staff.walletBalance || 0)}</span>
                        <button onClick={(e) => { e.stopPropagation(); onWallet('add'); }} className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all" title="Add/Deduct Balance">
                            <CreditCard size={14} />
                        </button>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1"><TrendingUp size={12} /> COLLECTED TODAY</p>
                    <p className="text-indigo-400 font-bold text-xl">{formatCurrency(staff.collectedToday)}</p>
                </div>
            </div>
        </motion.div>
    )
}
