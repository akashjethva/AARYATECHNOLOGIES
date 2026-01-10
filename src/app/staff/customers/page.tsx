"use client";

import { Search, Phone, MapPin, ArrowRight, User, ArrowLeft, X, TrendingUp, History, ShieldCheck, Download, ExternalLink, Calendar, Map, CheckCircle2, ArrowUpRight, ArrowDownRight, Bell, Link as LinkIcon, FileText, CheckCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/services/db";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StaffCustomers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const router = useRouter();

    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        // Initial load
        setCustomers(db.getCustomers());

        // Real-time listener
        const handleUpdate = () => setCustomers(db.getCustomers());
        window.addEventListener('customer-updated', handleUpdate);
        return () => window.removeEventListener('customer-updated', handleUpdate);
    }, []);

    const filtered = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-20 px-6 pt-16 min-h-screen bg-[#0f1115]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-2xl font-bold text-white leading-none">Customers</h1>
            </div>

            {/* Search Bar - Premium */}
            <div className="relative mb-6 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-[#16181d] border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-lg font-medium"
                    placeholder="Search name, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Customer List */}
            <div className="space-y-4">
                {filtered.map((customer, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="bg-[#1e2128] rounded-3xl p-5 border border-white/5 relative overflow-hidden active:scale-[0.95] transition-transform cursor-pointer"
                    >
                        {/* Card Highlight */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-50"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 shadow-inner">
                                    {customer.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{customer.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{customer.city} • {customer.contact}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Balance</p>
                                <p className={`text-lg font-bold ${customer.balance === "0" ? 'text-emerald-500' : 'text-white'}`}>
                                    ₹ {customer.balance}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <a href={`tel:${customer.phone}`} className="flex-1 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-600/20">
                                <Phone size={14} /> Call Now
                            </a>
                            <a
                                href={`geo:0,0?q=${encodeURIComponent(customer.address || `${customer.name} ${customer.city}`)}`}
                                className="flex-1 py-3 rounded-xl bg-[#16181d] text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/5 transition-colors border border-white/5"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin size={14} /> Navigate
                            </a>
                            <Link href="/staff/entry" className="py-3 px-4 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
            {/* Customer Details Modal (Mobileized Deep Dive) */}
            <AnimatePresence>
                {selectedCustomer && (
                    <CustomerDetailsModal
                        customer={selectedCustomer}
                        onClose={() => setSelectedCustomer(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function CustomerDetailsModal({ customer, onClose }: { customer: any, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState("Transaction Timeline");
    const [isGenerating, setIsGenerating] = useState(false);
    const [stats, setStats] = useState({ totalCollections: 0, timeline: [] as any[], trend: [] as number[], lastMonthGrowth: 0 });

    // Helper for robust date parsing
    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        // Handle DD/MM/YYYY format which is common in India
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // Check if first part is year (YYYY/MM/DD) or day (DD/MM/YYYY)
                if (parts[0].length === 4) return new Date(dateStr); // YYYY/MM/DD
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert DD/MM/YYYY to YYYY-MM-DD
            }
        }
        return new Date(dateStr);
    };

    const [trendPeriod, setTrendPeriod] = useState<"1M" | "3M" | "6M" | "1Y">("6M");

    useEffect(() => {
        if (!customer) return;

        // Fetch Real Data
        const allCollections = db.getCollections();

        // Filter for this customer (case insensitive check recommended)
        const customerTxns = allCollections.filter(c =>
            c.customer.toLowerCase().trim() === customer.name.toLowerCase().trim()
        ).sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

        // 1. Total Collections
        const total = customerTxns.reduce((sum, t) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

        // 2. Trend Data Calculation
        const today = new Date();
        let buckets = 6;
        let isWeekly = false;

        switch (trendPeriod) {
            case '1M': buckets = 4; isWeekly = true; break;
            case '3M': buckets = 3; break;
            case '6M': buckets = 6; break;
            case '1Y': buckets = 12; break;
        }

        const trendData = new Array(buckets).fill(0);

        customerTxns.forEach(t => {
            const tDate = parseDate(t.date);
            const amount = parseFloat(String(t.amount).replace(/,/g, '')) || 0;

            if (isWeekly) {
                // Weekly logic (Last 4 weeks)
                const diffTime = today.getTime() - tDate.getTime();
                const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

                if (diffWeeks >= 0 && diffWeeks < buckets) {
                    trendData[buckets - 1 - diffWeeks] += amount;
                }
            } else {
                // Monthly logic
                const monthDiff = (today.getFullYear() - tDate.getFullYear()) * 12 + (today.getMonth() - tDate.getMonth());

                if (monthDiff >= 0 && monthDiff < buckets) {
                    trendData[buckets - 1 - monthDiff] += amount;
                }
            }
        });

        // Normalize trend for graph height (max 100%)
        const maxVal = Math.max(...trendData, 1);
        const normalizedTrend = trendData.map(v => Math.round((v / maxVal) * 100));

        setStats({
            totalCollections: total,
            timeline: customerTxns,
            trend: normalizedTrend,
            lastMonthGrowth: 0
        });

    }, [customer, trendPeriod]);

    const handleDownloadPDF = () => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            const appSettings = db.getAppSettings();
            const companyDetails = db.getCompanyDetails();

            // 1. Logo & Header
            doc.setFillColor(31, 41, 55); // Dark Slate BG
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text(companyDetails.name || appSettings.appName, 15, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Customer Account Statement", 15, 30);

            doc.setTextColor(200, 200, 200);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 20, { align: 'right' });

            // 2. Customer Details
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Customer Profile", 15, 55);

            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text(`Name: ${customer.name}`, 15, 65);
            doc.text(`Contact: ${customer.phone || customer.contact}`, 15, 72);
            doc.text(`City: ${customer.city}`, 15, 79);

            // Financials (Right Side)
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Financial Summary", 120, 55);

            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text(`Current Balance: Rs. ${customer.balance}`, 120, 65);
            doc.text(`Total Paid: Rs. ${stats.totalCollections.toLocaleString('en-IN')}`, 120, 72);

            // 3. Transactions Table
            const tableBody = stats.timeline.map((txn: any) => [
                txn.date,
                txn.time || "-",
                txn.mode,
                `Rs. ${txn.amount}`,
                txn.staff || "Admin",
                txn.status
            ]);

            autoTable(doc, {
                startY: 90,
                head: [['Date', 'Time', 'Mode', 'Amount', 'Received By', 'Status']],
                body: tableBody,
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' }, // Indigo
                alternateRowStyles: { fillColor: [245, 247, 250] },
                styles: { fontSize: 10, cellPadding: 4 },
                margin: { top: 90 }
            });

            // Footer
            const finalY = (doc as any).lastAutoTable.finalY + 20;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text("This is a computer-generated report.", 105, finalY, { align: 'center' });

            doc.save(`${customer.name}_Legder.pdf`);
        } catch (error) {
            console.error("PDF Generate Error", error);
            alert("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                                <div className="flex items-center gap-2">
                                    <span className={`text-white border text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg ${parseFloat(customer.balance) > 0 ? 'bg-rose-600 border-rose-400/20 shadow-rose-900/20' : 'bg-[#059669] border-emerald-400/20 shadow-emerald-900/20'}`}>
                                        {parseFloat(customer.balance) > 0 ? 'Pending' : 'Active'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-slate-400 text-sm mt-2 font-medium">
                                <span className="flex items-center gap-2"><Phone size={16} className="text-slate-500" /> {customer.phone || customer.contact}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                <span className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" /> {customer.city}, East Zone</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className={`h-12 w-12 flex items-center justify-center bg-[#1c1f26] hover:bg-white/10 rounded-2xl transition-colors ${isGenerating ? 'text-indigo-500' : 'text-slate-400 hover:text-white'} border border-white/5`}
                        >
                            {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div> : <Download size={20} />}
                        </button>
                        <button onClick={onClose} className="h-12 w-12 flex items-center justify-center bg-[#1c1f26] hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white border border-white/5">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row" id="report-content">
                    {/* LEFT PANEL - Financial Status */}
                    <div className="w-full md:w-[450px] bg-[#0b0c10] p-8 border-r border-white/5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                        <p className="text-[11px] font-extrabold text-[#64748b] uppercase tracking-[0.2em] mb-2">Financial Status</p>

                        {/* Total Collections Card - Redesigned */}
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group shadow-2xl shadow-indigo-900/40 min-h-[140px] flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
                                <ArrowUpRight size={100} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-2">Total Collections</p>
                                <h4 className="text-[2.75rem] leading-none font-extrabold text-white tracking-tight drop-shadow-sm">₹ {(stats.totalCollections || 0).toLocaleString('en-IN')}</h4>
                                <div className="flex items-center gap-2 mt-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                                    <TrendingUp size={14} className="text-white" />
                                    <span className="text-white text-[10px] font-bold uppercase tracking-wide">Lifetime</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Balance Card - Redesigned */}
                        <div className={`p-6 rounded-[2rem] border relative overflow-hidden group min-h-[140px] flex flex-col justify-center transition-all ${parseFloat(customer.balance) > 0 ? 'bg-gradient-to-br from-[#1a1315] to-[#0f0f10] border-rose-500/30' : 'bg-gradient-to-br from-[#131a15] to-[#0f0f10] border-emerald-500/30'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
                                {parseFloat(customer.balance) > 0 ? <ArrowDownRight size={100} className="text-rose-500" /> : <ShieldCheck size={100} className="text-emerald-500" />}
                            </div>
                            <div className="relative z-10">
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${parseFloat(customer.balance) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Current Balance</p>
                                <h4 className="text-[2.75rem] leading-none font-extrabold text-white tracking-tight">₹ {customer.balance || '0'}</h4>
                                <p className={`text-[10px] font-bold mt-4 uppercase tracking-wide flex items-center gap-2 ${parseFloat(customer.balance) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {parseFloat(customer.balance) > 0 ? <><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Payment Pending</> : <><CheckCircle2 size={14} /> All Clear</>}
                                </p>
                            </div>
                        </div>

                        {/* Collection Trend - High Density Neon Aea Chart */}
                        <div className="bg-[#15171c] p-6 rounded-[2rem] border border-white/5 flex-1 min-h-[280px] flex flex-col relative overflow-hidden shadow-lg">

                            {/* Detailed Header */}
                            <div className="flex justify-between items-center mb-4 relative z-20">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Avg. Monthly</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold text-white tracking-tight">
                                            ₹ {(stats.trend.reduce((a, b) => a + b, 0) / (stats.trend.length || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </h3>
                                    </div>
                                </div>

                                {/* Time Range Selector */}
                                <div className="flex bg-[#0b0c10] rounded-lg p-1 border border-white/5 shadow-inner">
                                    {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setTrendPeriod(period)}
                                            className={`
                                                px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-300
                                                ${trendPeriod === period
                                                    ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/30'
                                                    : 'text-slate-500 hover:text-white hover:bg-white/5'}
                                            `}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Graph Container */}
                            <div className="flex-1 w-full relative z-10 mt-4">
                                {stats.trend.length > 0 ? (
                                    <div className="absolute inset-0">
                                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                            <defs>
                                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                                </linearGradient>
                                                <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                                                </pattern>
                                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            {/* Background Grid Fill */}
                                            <rect width="100" height="100" fill="url(#gridPattern)" />

                                            {/* Vertical Reference Lines */}
                                            {stats.trend.map((_, i) => (
                                                <line
                                                    key={`grid-v-${i}`}
                                                    x1={(i / (stats.trend.length - 1)) * 100}
                                                    y1="0"
                                                    x2={(i / (stats.trend.length - 1)) * 100}
                                                    y2="100"
                                                    stroke="rgba(255,255,255,0.05)"
                                                    strokeWidth="0.2"
                                                />
                                            ))}

                                            {/* Filled Area */}
                                            <path
                                                d={`
                                                    M 0,100 
                                                    ${stats.trend.map((val, i) => {
                                                    const x = (i / (stats.trend.length - 1)) * 100;
                                                    const y = 100 - (val > 0 ? Math.max(val, 10) : 0);
                                                    return `L ${x},${y}`;
                                                }).join(' ')}
                                                    L 100,100 Z
                                                `}
                                                fill="url(#areaGradient)"
                                            />

                                            {/* Stroke Line with Glow */}
                                            <path
                                                d={`
                                                    M 0,${100 - (stats.trend[0] > 0 ? Math.max(stats.trend[0], 10) : 0)}
                                                    ${stats.trend.map((val, i) => {
                                                    const x = (i / (stats.trend.length - 1)) * 100;
                                                    const y = 100 - (val > 0 ? Math.max(val, 10) : 0);
                                                    return `L ${x},${y}`;
                                                }).join(' ')}
                                                `}
                                                fill="none"
                                                stroke="#818cf8"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                filter="url(#glow)"
                                            />

                                            {/* Data Points & Tooltips (Interactive) */}
                                            {stats.trend.map((val, i) => (
                                                <g key={i} className="group/point">
                                                    <circle
                                                        cx={(i / (stats.trend.length - 1)) * 100}
                                                        cy={100 - (val > 0 ? Math.max(val, 10) : 0)}
                                                        r="3"
                                                        className="fill-[#0b0c10] stroke-[#818cf8] stroke-[1.5px] transition-all duration-300 group-hover/point:scale-150 group-hover/point:fill-white cursor-pointer"
                                                    />
                                                    {/* Tooltip */}
                                                    {val > 0 && (
                                                        <foreignObject
                                                            x={Math.min((i / (stats.trend.length - 1)) * 100 - 15, 70)}
                                                            y={(100 - Math.max(val, 10)) - 25}
                                                            width="40"
                                                            height="25"
                                                            className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none"
                                                        >
                                                            <div className="bg-indigo-600 text-white text-[8px] font-bold py-1 px-1.5 rounded shadow-lg text-center transform scale-75 origin-bottom">
                                                                {val}%
                                                            </div>
                                                        </foreignObject>
                                                    )}
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                                        <TrendingUp size={24} className="opacity-20" />
                                        <span className="text-xs">No data for this period</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-2 px-1 relative z-10 border-t border-white/5 pt-3">
                                {trendPeriod === '1M' ? (
                                    <>
                                        <span className="text-[10px] font-bold text-slate-500">Week 1</span>
                                        <span className="text-[10px] font-bold text-slate-500">Week 2</span>
                                        <span className="text-[10px] font-bold text-slate-500">Week 3</span>
                                        <span className="text-[10px] font-bold text-indigo-400">Current</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                                            {trendPeriod === '1Y' ? 'LAST YEAR' : 'PAST'}
                                        </span>
                                        <div className="flex-1 mx-4 h-px bg-white/5 self-center"></div>
                                        <span className="text-[10px] font-bold text-indigo-400 tracking-wider">NOW</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <a href={`whatsapp://send?phone=91${customer.phone || customer.contact}&text=${encodeURIComponent(`Hello ${customer.name}, your current outstanding balance is ₹${customer.balance}.`)}`} className="bg-[#151921] hover:bg-[#1f2937] border border-white/5 rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-black/20">
                                <Bell size={20} className="text-[#818cf8] group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-300 text-center leading-tight tracking-wide">SEND<br />ALERT</span>
                            </a>
                            <a href={`geo:0,0?q=${encodeURIComponent(customer.address || `${customer.name} ${customer.city}`)}`} className="bg-[#064e3b] hover:bg-[#065f46] border border-white/5 rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-emerald-900/20">
                                <MapPin size={20} className="text-white group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-white text-center leading-tight tracking-wide">NAVIGATE</span>
                            </a>
                            <a href={`whatsapp://send?phone=91${customer.phone || customer.contact}&text=${encodeURIComponent(`Hello ${customer.name}, please submit your KYC documents for verification.`)}`} className="bg-[#151921] hover:bg-[#1f2937] border border-white/5 rounded-2xl py-4 px-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-lg shadow-black/20">
                                <LinkIcon size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-300 text-center leading-tight tracking-wide">KYC<br />LINK</span>
                            </a>
                        </div>
                    </div>

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
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 space-y-10">
                            {activeTab === 'Transaction Timeline' && (
                                <div className="space-y-10">
                                    {stats.timeline.length > 0 ? stats.timeline.map((txn: any) => (
                                        <div key={txn.id} className="relative pl-10 border-l border-white/5 pb-2 last:pb-0 last:border-transparent group">
                                            <div className="absolute -left-3.5 top-0 h-7 w-7 rounded-full bg-[#0b0c10] border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">{txn.date}</p>
                                                    <h4 className="text-xl font-bold text-white mb-1">Payment Received</h4>
                                                    <p className="text-sm text-slate-400 font-medium">Processed by <span className="text-slate-200">{txn.staff || 'Staff'}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-emerald-400 mb-1">+ ₹ {txn.amount}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{txn.mode}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-10 text-slate-500">
                                            No transactions found for this customer.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Other tabs can remain static placeholders for now if empty */}
                            {activeTab === 'Communication' && (
                                <div className="text-center text-slate-500 mt-10">No recent communication log.</div>
                            )}
                        </div>

                        {/* Custom Report Banner */}
                        <div className="mt-8 pt-0">
                            <div className="bg-gradient-to-r from-[#1e1b4b] to-[#1e1b4b] border border-indigo-500/30 rounded-[2rem] p-6 flex items-center justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-2xl">
                                <div className="absolute inset-0 bg-[#4f46e5]/10 blur-2xl group-hover:bg-[#4f46e5]/20 transition-colors"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#4338ca] flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                        <FileText size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">Need a custom report?</h4>
                                        <p className="text-indigo-200 text-sm font-medium mt-1">Export specific filters as a PDF or Excel.</p>
                                    </div>
                                </div>
                                <a
                                    href={`whatsapp://send?text=${encodeURIComponent(`*Customer Report: ${customer.name}*\n\nBalance: ₹${customer.balance}\nStatus: ${parseFloat(customer.balance) > 0 ? 'Outstanding' : 'Clear'}\nAddress: ${customer.address || 'N/A'}\n\nGenerated via PaymentSoft`)}`}
                                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 relative z-10 text-sm flex items-center gap-2"
                                >
                                    <MessageCircle size={18} /> Share Report
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    )
}
