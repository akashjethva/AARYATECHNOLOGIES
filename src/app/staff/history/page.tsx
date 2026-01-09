"use client";

import { ArrowLeft, Search, Filter, FileText, Share2, MapPin, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { loadFromStorage, INITIAL_TRANSACTIONS } from "@/utils/storage";

// ... imports
import { db, Collection } from "@/services/db";

export default function StaffHistory() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [activeReceipt, setActiveReceipt] = useState<any>(null); // State for Receipt Modal
    const [selectedTxn, setSelectedTxn] = useState<any>(null); // State for Detail Modal
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadData = () => {
            const allCollections = db.getCollections();
            const allExpenses = db.getExpenses();

            // Dynamic Staff Name from LocalStorage
            let staffName = "Rahul Varma"; // Fallback
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('payment_app_user');
                if (storedUser) {
                    try { staffName = JSON.parse(storedUser).name || staffName; } catch { }
                }
            }

            // Normalization Helper
            const cleanName = (name: string) => String(name || '').toLowerCase().replace(/\s+/g, '').trim();
            const currentStaffClean = cleanName(staffName);

            // Filter: My Collections + Handovers
            const staffTxns = allCollections
                .filter(t => {
                    const txnStaffClean = cleanName(t.staff);
                    const isMyTxn = txnStaffClean === currentStaffClean || txnStaffClean.includes(currentStaffClean);

                    const customerClean = cleanName(t.customer);
                    const isHandoverType = t.customer.toLowerCase().includes('handover');
                    const isMyHandover = isHandoverType && customerClean.includes(currentStaffClean);

                    return isMyTxn || isMyHandover;
                })
                .map(t => {
                    const isHandover = t.customer.toLowerCase().includes('handover');
                    return {
                        ...t,
                        name: isHandover ? "Handover to Admin" : t.customer,
                        type: isHandover ? 'Debit' : 'Credit', // Handovers are Debit (Money Out)
                        date: t.date,
                        time: t.time,
                        amount: t.amount,
                        mode: t.mode,
                        id: t.id,
                        status: t.status,
                        remarks: t.remarks,
                        image: t.image,
                        isExpense: false
                    };
                });

            // Filter: My Expenses (party = Staff Entry or made by staff)
            const staffExpenses = allExpenses
                .filter((e: any) => e.createdBy === staffName || e.party === 'Staff Entry' || e.party === staffName || e.notes?.includes(staffName))
                .map((e: any) => ({
                    id: `EXP-${e.id}`,
                    name: e.title || e.category,
                    customer: e.party,
                    type: 'Debit', // Expenses are Debit (Money Out)
                    date: e.date,
                    time: new Date(e.id).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    amount: String(e.amount),
                    mode: e.method || 'Cash',
                    status: e.status || 'Approved',
                    remarks: e.notes,
                    image: e.image,
                    isExpense: true,
                    category: e.category
                }));

            // Combine and sort by Date + Time descending
            const allTxns = [...staffTxns, ...staffExpenses];
            allTxns.sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`);
                const dateB = new Date(`${b.date} ${b.time}`);
                return dateB.getTime() - dateA.getTime();
            });

            setTransactions(allTxns);
        };

        loadData();
        // Listen for updates
        window.addEventListener('transaction-updated', loadData);
        return () => window.removeEventListener('transaction-updated', loadData);
    }, []);

    const filtered = transactions.filter(t => {
        const matchesSearch = (t.name || t.customer || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'All'
            ? true
            : filterType === 'Credit' ? (t.type !== 'Debit')
                : (t.type === 'Debit');

        return matchesSearch && matchesFilter;
    });

    const handleShare = (item: any) => {
        const appName = db.getAppSettings().appName;

        if (item.status === 'Visit') {
            const text = `📝 *VISIT LOGGED* 📝\n\n👤 *Customer:* ${item.name || item.customer}\n📅 *Date:* ${item.date}\n🕓 *Time:* ${item.time}\n📌 *Reason:* ${item.remarks || 'No Payment'}\n🆔 *Ref:* #${item.id}\n\n_Generated via ${appName}_`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        } else {
            const text = `🧾 *PAYMENT RECEIPT* 🧾\n\n👤 *Customer:* ${item.name || item.customer}\n💰 *Amount:* ₹ ${item.amount}\n📅 *Date:* ${item.date}\n🕓 *Time:* ${item.time}\n💳 *Mode:* ${item.mode}\n🆔 *Transaction ID:* #${item.id}\n\n✅ *Status:* Successful\n\n_Generated via ${appName}_`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        }
    };

    const handleReceipt = (item: any) => {
        setActiveReceipt(item);
    };

    const handleDownloadPDF = () => {
        if (!activeReceipt) return;
        const appSettings = db.getAppSettings();
        const companyName = appSettings.appName || "My Company";

        const staffName = "Rahul Varma"; // TODO: Dynamic

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 150]
        });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(companyName, 40, 10, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(activeReceipt.status === 'Visit' ? "Visit Receipt" : "Receipt", 40, 15, { align: 'center' });
        doc.text("------------------------------------------------", 40, 18, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        if (activeReceipt.status !== 'Visit') {
            doc.text(`Rs. ${activeReceipt.amount}`, 40, 28, { align: 'center' });
        } else {
            doc.text("Visit Logged", 40, 28, { align: 'center' });
        }

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        let y = 40;
        const lineHeight = 6;

        doc.text(`Date: ${activeReceipt.date}`, 5, y);
        y += lineHeight;
        doc.text(`Time: ${activeReceipt.time}`, 5, y);
        y += lineHeight;
        doc.text("------------------------------------------------", 40, y, { align: 'center' });
        y += lineHeight;

        const partyLabel = "Customer:";
        const partyValue = activeReceipt.name || activeReceipt.customer;

        doc.setFont("helvetica", "bold");
        doc.text(partyLabel, 5, y);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(partyValue || "", 45);
        doc.text(splitText, 30, y);
        y += (lineHeight * splitText.length);

        if (activeReceipt.status !== 'Visit') {
            doc.setFont("helvetica", "bold");
            doc.text("Mode:", 5, y);
            doc.setFont("helvetica", "normal");
            doc.text(activeReceipt.mode || 'Cash', 30, y);
            y += lineHeight;
        }

        if (activeReceipt.remarks) {
            doc.setFont("helvetica", "bold");
            doc.text(activeReceipt.status === 'Visit' ? "Reason:" : "Remarks:", 5, y);
            doc.setFont("helvetica", "normal");
            const splitRemark = doc.splitTextToSize(activeReceipt.remarks || "", 45);
            doc.text(splitRemark, 30, y);
            y += (lineHeight * splitRemark.length);
        }

        // Pending Balance Logic (Read Current Balance)
        if (activeReceipt.status !== 'Visit') {
            try {
                const customers = db.getCustomers();
                const customer = customers.find(c => c.name.trim() === (activeReceipt.name || activeReceipt.customer).trim());
                if (customer) {
                    // Just show current balance as Pending Balance
                    // Note: This is the balance NOW, not back then.
                    doc.setFont("helvetica", "bold");
                    doc.text("Pending Bal:", 5, y);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Rs. ${customer.balance}`, 30, y);
                    y += lineHeight;
                }
            } catch (e) {
                console.error("Error calculating balance", e);
            }
        }

        y += 5;
        doc.text("------------------------------------------------", 40, y, { align: 'center' });
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.text("Recorded By:", 5, y);
        doc.setFont("helvetica", "normal");
        doc.text(staffName, 30, y);
        y += 10;

        doc.setFontSize(7);
        doc.text("Thank you!", 40, y, { align: 'center' });

        const cleanName = (activeReceipt.name || activeReceipt.customer || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`Receipt_${activeReceipt.id}_${cleanName}.pdf`);
    };


    return (
        <div className="pb-28 px-6 pt-4 min-h-screen bg-[#0f1115] print:bg-white print:pb-0 print:min-h-0" onClick={() => setShowFilter(false)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-50 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-xl font-bold text-white leading-none">History</h1>
                </div>

                {/* Filter Button & Dropdown */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowFilter(!showFilter); }}
                        className={`p-2 rounded-xl transition-colors ${showFilter ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white'}`}
                    >
                        <Filter size={20} />
                    </button>
                    {showFilter && (
                        <div className="absolute right-0 top-full mt-2 w-32 bg-[#1e2128] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <button onClick={() => setFilterType('All')} className={`w-full text-left px-4 py-2 text-sm font-bold ${filterType === 'All' ? 'text-indigo-400 bg-white/5' : 'text-slate-400 hover:bg-white/5'}`}>All</button>
                            <button onClick={() => setFilterType('Credit')} className={`w-full text-left px-4 py-2 text-sm font-bold ${filterType === 'Credit' ? 'text-emerald-400 bg-white/5' : 'text-slate-400 hover:bg-white/5'}`}>Received</button>
                            <button onClick={() => setFilterType('Debit')} className={`w-full text-left px-4 py-2 text-sm font-bold ${filterType === 'Debit' ? 'text-rose-400 bg-white/5' : 'text-slate-400 hover:bg-white/5'}`}>Expenses</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar - Premium Style */}
            <div className="relative mb-6 group print:hidden">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3 bg-[#16181d] border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-lg font-medium text-sm"
                    placeholder="Search transaction..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Transaction List */}
            <div className="space-y-4 print:hidden">
                {filtered.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        <p>No transactions found.</p>
                    </div>
                ) : filtered.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.id}
                        onClick={() => setSelectedTxn(item)}
                        className="bg-[#1e2128] rounded-3xl p-5 border border-white/5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                    >
                        {/* Card Highlight */}
                        <div className={`absolute top-0 left-0 w-1 h-full opacity-50 ${item.type === 'Debit' ? 'bg-gradient-to-b from-rose-500 to-transparent' : 'bg-gradient-to-b from-indigo-500 to-transparent'}`}></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border border-white/5 shadow-inner ${item.type === 'Debit' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {(item.name || item.customer || 'U')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base leading-tight">{item.name || item.customer}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                                        <Calendar size={10} /> {item.date}, {item.time}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${item.mode === 'Cash' ? 'text-emerald-400' : 'text-indigo-400'}`}>{item.mode}</p>
                                <p className={`text-lg font-bold ${item.type === 'Debit' ? 'text-rose-400' : 'text-white'}`}>
                                    {item.type === 'Debit' ? '-' : '+'} ₹ {item.amount}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3 mt-4">
                            <button onClick={(e) => { e.stopPropagation(); handleReceipt(item); }} className="flex-1 py-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-indigo-500/20 text-xs">
                                <div className="w-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                                Receipt
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleShare(item); }} className="flex-1 py-3.5 rounded-xl bg-[#111] border border-white/10 text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-black text-xs">
                                <div className="w-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></div>
                                Share
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transaction Detail Modal (With Attachment) */}
            {selectedTxn && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setSelectedTxn(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1e2128] w-full max-w-sm rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className={`p-6 pb-4 relative ${selectedTxn.status === 'Visit' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                            <button onClick={() => setSelectedTxn(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white transition-colors">
                                <ArrowLeft size={16} /> {/* Using ArrowLeft as 'Back' or can import X */}
                            </button>
                            <h2 className={`text-2xl font-bold mb-1 ${selectedTxn.status === 'Visit' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                {selectedTxn.status === 'Visit' ? 'Visit Details' : 'Payment Details'}
                            </h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedTxn.date} • {selectedTxn.time}</p>
                        </div>

                        {/* Content Scrollable */}
                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            {/* Key Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Customer</p>
                                    <p className="font-bold text-white leading-tight">{selectedTxn.name || selectedTxn.customer}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{selectedTxn.status === 'Visit' ? 'Status' : 'Amount'}</p>
                                    <p className={`font-bold text-lg ${selectedTxn.status === 'Visit' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                        {selectedTxn.status === 'Visit' ? 'Visit Logged' : `₹ ${selectedTxn.amount}`}
                                    </p>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-3">
                                {selectedTxn.status === 'Visit' && (
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-500 text-sm">Reason</span>
                                        <span className="font-bold text-white text-right">{selectedTxn.remarks || 'N/A'}</span>
                                    </div>
                                )}
                                {selectedTxn.status !== 'Visit' && (
                                    <>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-slate-500 text-sm">Payment Mode</span>
                                            <span className="font-bold text-white">{selectedTxn.mode}</span>
                                        </div>
                                        {selectedTxn.remarks && (
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-slate-500 text-sm">Remarks</span>
                                                <span className="font-bold text-white text-right">{selectedTxn.remarks}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-slate-500 text-sm">Transaction ID</span>
                                    <span className="font-mono text-xs text-slate-400">#{selectedTxn.id}</span>
                                </div>
                            </div>

                            {/* Attachment Section */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={12} /> Attachment
                                </p>
                                {selectedTxn.image ? (
                                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 relative group">
                                        <img
                                            src={selectedTxn.image}
                                            alt="Attachment"
                                            className="w-full h-auto max-h-60 object-cover"
                                            onClick={() => window.open(selectedTxn.image, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-none">
                                            <p className="text-white text-xs font-bold">Tap to View Full</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-24 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-slate-600">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                            <FileText size={14} />
                                        </div>
                                        <span className="text-xs font-medium">No Attachment</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-black/20 border-t border-white/5 flex gap-3">
                            <button
                                onClick={() => { setActiveReceipt(selectedTxn); setSelectedTxn(null); }}
                                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                            >
                                View Receipt
                            </button>
                            <button
                                onClick={() => { handleShare(selectedTxn); setSelectedTxn(null); }}
                                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold text-sm border border-white/10 active:scale-95 transition-transform hover:bg-white/10"
                            >
                                Share
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Receipt Modal (Previous Implementation) */}
            {activeReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setActiveReceipt(null)}>
                    <motion.div
                        id="receipt-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white text-slate-900 w-full max-w-sm rounded-3xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Receipt Header */}
                        <div className={`p-6 text-center text-white relative overflow-hidden print:bg-white print:text-black print:p-0 print:mb-10 ${activeReceipt.status === 'Visit' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                            {/* Pattern Removed */}
                            <h2 className="text-2xl font-bold mb-1 text-white print:text-black print:text-5xl uppercase tracking-widest">{activeReceipt.status === 'Visit' ? 'VISIT RECEIPT' : 'PAYMENT RECEIPT'}</h2>
                            <p className="opacity-80 text-xs tracking-widest uppercase text-white print:text-slate-600 print:text-lg">{activeReceipt.status === 'Visit' ? 'Visit Logged' : 'Transaction Successful'}</p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6 space-y-6 print:p-0 print:space-y-12">
                            <div className="text-center">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 print:text-xl print:text-slate-600">{activeReceipt.status === 'Visit' ? 'Reason' : 'Amount Paid'}</p>
                                <h3 className={`font-black text-slate-900 print:text-8xl ${activeReceipt.status === 'Visit' ? 'text-2xl' : 'text-4xl'}`}>
                                    {activeReceipt.status === 'Visit' ? (activeReceipt.remarks || 'No Payment') : `₹ ${activeReceipt.amount}`}
                                </h3>
                            </div>

                            <div className="space-y-4 border-t border-dashed border-slate-200 pt-4 print:border-slate-800">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Party Name</span>
                                    <span className="text-slate-900 text-sm font-bold text-right print:text-3xl">{activeReceipt.name || activeReceipt.customer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Date & Time</span>
                                    <span className="text-slate-900 text-sm font-bold text-right print:text-3xl">{activeReceipt.date}, {activeReceipt.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Ref ID</span>
                                    <span className="text-slate-900 text-sm font-bold text-right print:text-3xl">#{activeReceipt.id}</span>
                                </div>
                                {activeReceipt.status !== 'Visit' && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Payment Mode</span>
                                        <span className="text-slate-900 text-sm font-bold text-right bg-slate-100 px-2 py-0.5 rounded text-xs uppercase print:bg-transparent print:border-0 print:text-3xl print:p-0">{activeReceipt.mode}</span>
                                    </div>
                                )}
                            </div>


                        </div>

                        {/* Receipt Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 no-print">
                            <button
                                onClick={() => setActiveReceipt(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isGenerating}
                                className={`flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-colors ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isGenerating ? 'Downloading...' : 'Download PDF'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Hidden Print Template for PDF Generation */}
            {activeReceipt && (
                // z-index -50 keeps it visible to html2canvas but hidden from user layer
                <div
                    id="receipt-print-template"
                    className="fixed top-0 left-0 z-[-50] w-[600px] p-10 border border-black"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }} // Force HEX
                >
                    {/* Header */}
                    <div
                        className="p-8 text-center relative mb-8 rounded-t-3xl overflow-hidden"
                        style={{ backgroundColor: activeReceipt.status === 'Visit' ? '#2563eb' : '#4f46e5', color: '#ffffff' }} // Force HEX
                    >
                        {/* Pattern Removed for Reliability */}
                        <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-widest" style={{ color: '#ffffff' }}>{activeReceipt.status === 'Visit' ? 'VISIT RECEIPT' : 'PAYMENT RECEIPT'}</h2>
                        <p className="text-sm tracking-[0.2em] uppercase" style={{ color: '#e0e7ff', opacity: 0.9 }}>{activeReceipt.status === 'Visit' ? 'Visit Logged' : 'Transaction Successful'}</p>
                    </div>

                    {/* Body */}
                    <div className="px-4 space-y-10">
                        <div className="text-center py-6 border-b-2 border-dashed" style={{ borderColor: '#e2e8f0' }}>
                            <p className="text-lg font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>{activeReceipt.status === 'Visit' ? 'Reason' : 'Amount Paid'}</p>
                            <h3 className={`font-black ${activeReceipt.status === 'Visit' ? 'text-4xl' : 'text-7xl'}`} style={{ color: '#0f172a' }}>
                                {activeReceipt.status === 'Visit' ? (activeReceipt.remarks || 'No Payment') : `₹ ${activeReceipt.amount}`}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Party Name</span>
                                <span className="font-bold text-2xl" style={{ color: '#0f172a' }}>{activeReceipt.name || activeReceipt.customer}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Date & Time</span>
                                <span className="font-bold text-2xl" style={{ color: '#0f172a' }}>{activeReceipt.date}, {activeReceipt.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Ref ID</span>
                                <span className="font-bold text-2xl" style={{ color: '#0f172a' }}>#{activeReceipt.id}</span>
                            </div>
                            {activeReceipt.status !== 'Visit' && (
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-xl" style={{ color: '#64748b' }}>Payment Mode</span>
                                    <span className="font-bold text-2xl uppercase px-4 py-1 rounded-lg" style={{ color: '#0f172a', backgroundColor: '#f1f5f9' }}>{activeReceipt.mode}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer Branding */}
                        <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: '#f1f5f9' }}>
                            <p className="font-bold text-sm uppercase tracking-widest" style={{ color: '#94a3b8' }}>Generated via Aarya Technologies</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
