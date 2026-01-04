"use client";

import { ArrowLeft, Camera, User, X, Check, Banknote, CreditCard, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffEntry() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'Collection',
        customer: '',
        amount: '',
        mode: 'Cash',
        category: '',
        remarks: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);

    // Mock Customers for Search
    const customers = [
        { id: 1, name: "Shiv Shakti Traders", city: "Ahmedabad" },
        { id: 2, name: "Jay Mataji Store", city: "Surat" },
        { id: 3, name: "Ganesh Provision", city: "Rajkot" },
        { id: 4, name: "Om Enterprise", city: "Vadodara" },
        { id: 5, name: "Maruti Nandan", city: "Surat" },
    ];
    const [filteredCustomers, setFilteredCustomers] = useState<{ id: number, name: string, city: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, customer: value });
        if (value.length > 0) {
            const result = customers.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredCustomers(result);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectCustomer = (name: string) => {
        setFormData({ ...formData, customer: name });
        setShowSuggestions(false);
    }

    const handleSubmit = () => {
        if (!formData.customer && formData.type === 'Collection') return; // Only check customer for collection
        if (!formData.category && (formData.type === 'Expense' || formData.type === 'Deposit')) return; // Check category for expense/deposit
        if (!formData.amount) return; // Always check amount

        setLoading(true);

        // Save to Shared LocalStorage for Admin Panel
        const newExEntry = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer: formData.type === 'Collection' ? formData.customer : formData.category || 'Expense',
            amount: Number(formData.amount).toLocaleString(),
            staff: "Rahul Varma", // Hardcoded staff name for now
            mode: formData.mode,
            status: "Verified", // Staff entries auto-verified for demo
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            type: formData.type, // Collection, Expense, Deposit
            remarks: formData.remarks
        };

        const existing = JSON.parse(localStorage.getItem('payment_app_transactions') || '[]');
        localStorage.setItem('payment_app_transactions', JSON.stringify([newExEntry, ...existing]));

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setShowSuccess(true);
        }, 1000);
    }

    const handleWhatsAppShare = () => {
        const partyName = formData.type === 'Collection' ? formData.customer : formData.category;
        const transactionType = formData.type === 'Collection' ? 'payment' : formData.type === 'Expense' ? 'expense' : 'deposit';
        const message = `*Payment Receipt* %0A%0AHello ${partyName}, %0AWe have received your ${transactionType} of *₹ ${formData.amount}* via ${formData.mode}. %0A%0ADate: ${new Date().toLocaleDateString()} %0A%0A*Payment Soft*`;
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const handleDownloadPDF = () => {
        alert("Downloading Receipt PDF...");
        // In real app, this would generate a PDF blob
    };

    if (showSuccess) {
        return (
            <SuccessView
                data={formData}
                onShare={handleWhatsAppShare}
                onDownload={handleDownloadPDF}
                onClose={() => router.push('/staff/home')}
            />
        )
    }

    return (
        <div className="min-h-screen pb-40 relative bg-[#0f1115]">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-96 bg-indigo-600/10 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-full h-64 bg-fuchsia-600/10 blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 relative z-10">
                <Link href="/staff/home" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 backdrop-blur-sm">
                    <X size={24} />
                </Link>
                <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">New Transaction</h1>
                <div className="w-12"></div>
            </div>

            <div className="px-6 flex flex-col items-center relative z-10 max-w-lg mx-auto w-full">

                {/* Modern Glass Tabs - Compact */}
                <div className="flex p-1 rounded-xl bg-black/20 border border-white/5 w-full mb-6 backdrop-blur-xl">
                    {['Collection', 'Expense', 'Deposit'].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                setFormData({ ...formData, type: type as any, customer: '', category: '' });
                            }}
                            className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden ${formData.type === type ?
                                (type === 'Expense' ? 'bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/50' :
                                    type === 'Deposit' ? 'bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50' :
                                        'bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/50')
                                : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Amount Input (Dynamic Center) */}
                <div className="w-full relative mb-6 text-center">
                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 animate-pulse ${formData.type === 'Expense' ? 'text-rose-400' : formData.type === 'Deposit' ? 'text-amber-400' : 'text-indigo-400'}`}>
                        {formData.type === 'Expense' ? 'Amount' : formData.type === 'Deposit' ? 'Deposit Amount' : 'Collection Amount'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <span className={`text-4xl font-light transition-colors relative top-1 ${formData.amount ? 'text-white' : 'text-slate-600'}`}>₹</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="bg-transparent text-6xl font-black text-white outline-none placeholder:text-slate-800 caret-indigo-500 font-sans tracking-tight p-0 m-0"
                            style={{ width: `${Math.max(1, formData.amount.length) * 0.7}em`, textAlign: 'left' }}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Conditional Fields based on Type */}
                <div className="w-full space-y-4">
                    <AnimatePresence mode="wait">
                        {formData.type === 'Collection' ? (
                            <motion.div
                                key="collection"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="bg-[#15171c] rounded-2xl p-1 border border-white/5 shadow-2xl relative z-20">
                                    <div className="bg-[#1e2128]/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <User size={18} className="text-indigo-400" />
                                        </div>
                                        <div className="flex-1 relative">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Name</label>
                                            <input
                                                type="text"
                                                placeholder="Search customer..."
                                                value={formData.customer}
                                                onChange={handleCustomerSearch}
                                                onFocus={() => { if (formData.customer) setShowSuggestions(true); }}
                                                className="w-full bg-transparent text-base font-bold text-white outline-none placeholder:text-slate-600 placeholder:font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && filteredCustomers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e2128] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl max-h-40 overflow-y-auto">
                                            {filteredCustomers.map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => selectCustomer(c.name)}
                                                    className="p-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer flex justify-between items-center bg-[#1e2128]"
                                                >
                                                    <span className="text-sm font-bold text-slate-200">{c.name}</span>
                                                    <span className="text-xs text-slate-500">{c.city}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="other"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="bg-[#15171c] rounded-2xl p-1 border border-white/5 shadow-2xl">
                                    <div className="bg-[#1e2128]/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Building2 size={18} className="text-indigo-400" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                {formData.type === 'Expense' ? 'Category' : 'Deposit To'}
                                            </label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-transparent text-base font-bold text-white outline-none focus:bg-[#1e2128] appearance-none"
                                            >
                                                <option value="" className="bg-[#1e293b] text-slate-500">Select</option>
                                                {formData.type === 'Expense' ? (
                                                    <>
                                                        <option value="Petrol" className="bg-[#1e293b]">Petrol</option>
                                                        <option value="Food" className="bg-[#1e293b]">Food</option>
                                                        <option value="Repair" className="bg-[#1e293b]">Repair</option>
                                                        <option value="Other" className="bg-[#1e293b]">Other</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Office" className="bg-[#1e293b]">Office</option>
                                                        <option value="Bank" className="bg-[#1e293b]">Bank</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Payment Mode Selector - Compact */}
                    {formData.type !== 'Expense' && (
                        <div className="w-full">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Payment Mode</p>
                            <div className="grid grid-cols-3 gap-2">
                                <ModeButton
                                    label="Cash"
                                    icon={<Banknote size={16} />}
                                    active={formData.mode === 'Cash'}
                                    onClick={() => setFormData({ ...formData, mode: 'Cash' })}
                                />
                                <ModeButton
                                    label="UPI"
                                    icon={<div className="font-black text-xs">@</div>}
                                    active={formData.mode === 'UPI'}
                                    onClick={() => setFormData({ ...formData, mode: 'UPI' })}
                                />
                                <ModeButton
                                    label="Cheque"
                                    icon={<CreditCard size={16} />}
                                    active={formData.mode === 'Cheque'}
                                    onClick={() => setFormData({ ...formData, mode: 'Cheque' })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Remarks Field - Compact */}
                    <div className="w-full">
                        <div className="bg-[#15171c]/50 rounded-xl p-3 border border-white/5 flex items-center gap-3 focus-within:border-indigo-500/50 focus-within:bg-[#15171c] transition-all">
                            <div className="text-slate-500">
                                <Camera size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Add remark..."
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Submit Button - Inline with extra margin */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.amount || (formData.type === 'Collection' ? !formData.customer : !formData.category)}
                        className={`w-full py-5 rounded-2xl text-base font-bold uppercase tracking-wider shadow-xl transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 relative overflow-hidden group ${loading || !formData.amount ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                            'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/25'
                            }`}
                    >
                        {/* Button Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={20} strokeWidth={3} />
                                <span>Confirm {formData.type}</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

function SuccessView({ data, onShare, onDownload, onClose }: any) {
    return (
        <div className="min-h-full bg-emerald-500 p-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl relative z-10 text-center"
            >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-emerald-600" strokeWidth={3} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-1">Success!</h2>
                <p className="text-slate-500 text-sm font-medium mb-8">Transaction Recorded Successfully</p>

                <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Amount</p>
                    <p className="text-3xl font-bold text-slate-900 mb-4">₹ {data.amount}</p>

                    <div className="h-px bg-slate-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Party</span>
                        <span className="font-bold text-slate-900">{data.customer || data.category}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={onShare} className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
                        Share on WhatsApp
                    </button>
                    <button onClick={onDownload} className="w-full py-3.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-transform">
                        Download PDF
                    </button>
                    <button onClick={onClose} className="w-full py-3 text-slate-400 font-medium text-sm mt-2 hover:text-slate-600">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

function ModeButton({ label, icon, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${active
                ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                : 'bg-[#1e2128]/50 text-slate-500 border-white/5 hover:border-white/10 hover:bg-[#1e2128] hover:text-slate-400'
                }`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    )
}
