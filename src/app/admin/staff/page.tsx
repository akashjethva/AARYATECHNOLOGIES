"use client";

import { UserPlus, Search, MoreVertical, Phone, X, Save, Edit, Trash2, Shield, Calendar, TrendingUp, LayoutGrid, List, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";

export default function StaffPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingId, setEditingId] = useState<number | null>(null);

    const [staffList, setStaffList] = useState([
        { id: 1, name: "Rahul Varma", phone: "+91 98765 43210", status: "Active", collectedToday: 15400, role: "Senior Field Officer", joined: "Jan 2023" },
        { id: 2, name: "Amit Kumar", phone: "+91 91234 56789", status: "Active", collectedToday: 8200, role: "Field Agent", joined: "Mar 2023" },
        { id: 3, name: "Suresh Patel", phone: "+91 99887 77665", status: "On Leave", collectedToday: 0, role: "Collection Agent", joined: "Dec 2023" },
        { id: 4, name: "Vikram Singh", phone: "+91 76543 21098", status: "Active", collectedToday: 12500, role: "Senior Field Officer", joined: "Feb 2023" },
    ]);

    const [formData, setFormData] = useState({ name: "", phone: "", role: "Field Agent", email: "", zone: "", address: "" });

    // Filter Logic
    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery)
    );

    const handleSaveStaff = () => {
        if (!formData.name || !formData.phone) return;

        if (editingId) {
            // Edit Mode
            setStaffList(prev => prev.map(staff =>
                staff.id === editingId ? { ...staff, ...formData } : staff
            ));
        } else {
            // Add Mode
            setStaffList(prev => [...prev, {
                id: Date.now(),
                name: formData.name,
                phone: formData.phone,
                role: formData.role,
                status: "Active",
                collectedToday: 0,
                joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            }]);
        }

        closeModal();
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            setStaffList(prev => prev.filter(s => s.id !== id));
        }
    };

    const openEditModal = (staff: any) => {
        setEditingId(staff.id);
        setFormData({
            name: staff.name,
            phone: staff.phone,
            role: staff.role,
            email: "staff@example.com", // Placeholder
            zone: "North Zone",        // Placeholder
            address: "123, Main Street, City" // Placeholder
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: "", phone: "", role: "Field Agent", email: "", zone: "", address: "" });
    };

    const { formatCurrency } = useCurrency();

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
                        {formatCurrency(staffList.reduce((sum, s) => sum + s.collectedToday, 0))}
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
                        {filteredStaff.map((staff) => (
                            <StaffCard
                                key={staff.id}
                                staff={staff}
                                onEdit={() => openEditModal(staff)}
                                onDelete={() => handleDelete(staff.id)}
                            />
                        ))}
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
                                                        {staff.name.split(' ').map((n) => n[0]).join('')}
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
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {staff.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="font-mono font-bold text-indigo-300 text-lg">{formatCurrency(staff.collectedToday)}</div>
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

            {/* Add/Edit Staff Modal - Kept Original */}

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

        </div>
    );
}

function StaffCard({ staff, onEdit, onDelete }: any) {
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
                                <Edit size={14} className="text-amber-400" /> Edit
                            </button>
                            <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg text-left transition-colors">
                                <Trash2 size={14} /> Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-5 mb-6">
                <div className="h-20 w-20 rounded-[1.2rem] bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                    {staff.name.split(' ').map((n: string) => n[0]).join('')}
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
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/20'}`}>
                        {staff.status}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1"><TrendingUp size={12} /> COLLECTED TODAY</p>
                    <p className="text-indigo-400 font-bold text-xl">{formatCurrency(staff.collectedToday)}</p>
                </div>
            </div>
        </motion.div>
    )
}
