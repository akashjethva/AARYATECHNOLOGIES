"use client";

import { ArrowLeft, Search, Filter, FileText, Share2, MapPin, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function StaffHistory() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [activeReceipt, setActiveReceipt] = useState<any>(null); // State for Receipt Modal
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        // Load Collections from LocalStorage
        const storedCollections = localStorage.getItem('payment_app_collections');
        const storedExpenses = localStorage.getItem('payment_app_expenses');

        let allData: any[] = [];

        if (storedCollections) {
            allData = [...allData, ...JSON.parse(storedCollections)];
        }
        if (storedExpenses) {
            // Adapt expenses to look like transactions for the list
            const expenses = JSON.parse(storedExpenses).map((e: any) => ({
                ...e,
                name: e.category, // Use Category as name
                mode: 'Expense', // Mark as Expense type
                type: 'Debit'
            }));
            allData = [...allData, ...expenses];
        }

        // Fallback to Mock Data if no local data
        if (allData.length === 0) {
            allData = [
                { id: 1, name: "Shiv Shakti Traders", time: "10:45 AM", amount: "5,000", type: "Credit", mode: "Cash", date: "Today" },
                { id: 2, name: "Jay Ambe Store", time: "09:30 AM", amount: "2,400", type: "Credit", mode: "Online", date: "Today" },
                { id: 3, name: "Petrol Expense", time: "08:15 AM", amount: "500", type: "Debit", mode: "Expense", date: "Today" },
                { id: 4, name: "Ganesh Provision", time: "04:15 PM", amount: "12,500", type: "Credit", mode: "Cash", date: "Yesterday" },
                { id: 5, name: "Om Enterprise", time: "02:00 PM", amount: "8,200", type: "Credit", mode: "Online", date: "Yesterday" },
            ];
        }

        // Sort by id (timestamp) descending
        allData.sort((a, b) => b.id - a.id);
        setTransactions(allData);
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
        const text = `🧾 *PAYMENT RECEIPT* 🧾\n\n👤 *Customer:* ${item.name || item.customer}\n💰 *Amount:* ₹ ${item.amount}\n📅 *Date:* ${item.date}\n🕓 *Time:* ${item.time}\n💳 *Mode:* ${item.mode}\n🆔 *Transaction ID:* #${item.id}\n\n✅ *Status:* Successful\n\n_Generated via Payment Soft_`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleReceipt = (item: any) => {
        setActiveReceipt(item);
    };

    const handleDownloadPDF = async () => {
        if (isGenerating) return;
        setIsGenerating(true);

        try {
            console.log("Starting PDF generation...");

            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 500));

            const input = document.getElementById('receipt-print-template');
            if (!input) {
                alert("Error: Print template not found!");
                return;
            }

            console.log("Capturing Canvas...");
            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: "#ffffff",
                logging: true,
                useCORS: true,
                x: 0,
                y: 0,
                width: 600,
                windowWidth: 1200
            });
            console.log("Canvas Captured");

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a5'
            });

            const imgWidth = 148;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const cleanName = (activeReceipt?.name || activeReceipt?.customer || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`Receipt_${activeReceipt?.id}_${cleanName}.pdf`);
            console.log("PDF Saved");

        } catch (error: any) {
            console.error("PDF Generation failed", error);
            alert(`Download failed: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
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
                        className="bg-[#1e2128] rounded-3xl p-5 border border-white/5 relative overflow-hidden active:scale-[0.98] transition-transform"
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
                        <div className="flex gap-2">
                            <button onClick={() => handleReceipt(item)} className="flex-1 py-2 rounded-xl bg-indigo-600/10 text-indigo-400 font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-600/20">
                                <FileText size={14} /> Receipt
                            </button>
                            <button onClick={() => handleShare(item)} className="flex-1 py-2 rounded-xl bg-[#16181d] text-slate-400 font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-colors border border-white/5">
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Receipt Modal */}
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
                        <div className="bg-indigo-600 p-6 text-center text-white relative overflow-hidden print:bg-white print:text-black print:p-0 print:mb-10">
                            {/* Pattern Removed */}
                            <h2 className="text-2xl font-bold mb-1 text-white print:text-black print:text-5xl uppercase tracking-widest">PAYMENT RECEIPT</h2>
                            <p className="opacity-80 text-xs tracking-widest uppercase text-white print:text-slate-600 print:text-lg">Transaction Successful</p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6 space-y-6 print:p-0 print:space-y-12">
                            <div className="text-center">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 print:text-xl print:text-slate-600">Amount Paid</p>
                                <h3 className="text-4xl font-black text-slate-900 print:text-8xl">₹ {activeReceipt.amount}</h3>
                            </div>

                            <div className="space-y-4 border-t border-dashed border-slate-200 pt-4 print:border-slate-800">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Payment To</span>
                                    <span className="text-slate-900 text-sm font-bold text-right print:text-3xl">{activeReceipt.name || activeReceipt.customer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Date & Time</span>
                                    <span className="text-slate-900 text-sm font-bold text-right print:text-3xl">{activeReceipt.date}, {activeReceipt.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Transaction ID</span>
                                    <span className="text-slate-900 text-sm font-bold text-right print:text-3xl">#{activeReceipt.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-medium print:text-xl print:text-slate-600 font-bold">Payment Mode</span>
                                    <span className="text-slate-900 text-sm font-bold text-right bg-slate-100 px-2 py-0.5 rounded text-xs uppercase print:bg-transparent print:border-0 print:text-3xl print:p-0">{activeReceipt.mode}</span>
                                </div>
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
                        style={{ backgroundColor: '#4f46e5', color: '#ffffff' }} // Force HEX
                    >
                        {/* Pattern Removed for Reliability */}
                        <h2 className="text-4xl font-extrabold mb-2 uppercase tracking-widest" style={{ color: '#ffffff' }}>PAYMENT RECEIPT</h2>
                        <p className="text-sm tracking-[0.2em] uppercase" style={{ color: '#e0e7ff', opacity: 0.9 }}>Transaction Successful</p>
                    </div>

                    {/* Body */}
                    <div className="px-4 space-y-10">
                        <div className="text-center py-6 border-b-2 border-dashed" style={{ borderColor: '#e2e8f0' }}>
                            <p className="text-lg font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>Amount Paid</p>
                            <h3 className="text-7xl font-black" style={{ color: '#0f172a' }}>₹ {activeReceipt.amount}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Payment To</span>
                                <span className="font-bold text-2xl" style={{ color: '#0f172a' }}>{activeReceipt.name || activeReceipt.customer}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Date & Time</span>
                                <span className="font-bold text-2xl" style={{ color: '#0f172a' }}>{activeReceipt.date}, {activeReceipt.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Transaction ID</span>
                                <span className="font-bold text-2xl" style={{ color: '#0f172a' }}>#{activeReceipt.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl" style={{ color: '#64748b' }}>Payment Mode</span>
                                <span className="font-bold text-2xl uppercase px-4 py-1 rounded-lg" style={{ color: '#0f172a', backgroundColor: '#f1f5f9' }}>{activeReceipt.mode}</span>
                            </div>
                        </div>

                        {/* Footer Branding */}
                        <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: '#f1f5f9' }}>
                            <p className="font-bold text-sm uppercase tracking-widest" style={{ color: '#94a3b8' }}>Generated via Payment Soft</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
