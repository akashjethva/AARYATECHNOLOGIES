"use client";

import { FileText, Download, Calendar, ArrowUpRight, TrendingUp, Users, Wallet, CreditCard, ChevronDown, Filter, PieChart, MapPin, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

export default function ReportsPage() {
    const [chartPeriod, setChartPeriod] = useState<'Week' | 'Month' | 'Year'>('Year');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedDate, setSelectedDate] = useState('Jan 2026');
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedStat, setSelectedStat] = useState('revenue');

    const getGraphTitle = () => {
        switch (selectedStat) {
            case 'revenue': return 'Revenue Trends';
            case 'collection': return 'Cash Collection Trends';
            case 'upi': return 'Digital / UPI Trends';
            case 'expense': return 'Operational Expenses';
            default: return 'Revenue Trends';
        }
    }

    const handleExport = () => {
        setIsExporting(true);

        try {
            const printWindow = window.open('', '', 'width=800,height=600');
            if (!printWindow) {
                alert("Please allow popups to download the report.");
                setIsExporting(false);
                return;
            }

            const htmlContent = `
                <html>
                <head>
                    <title>Report - ${selectedDate}</title>
                    <style>
                        @media print { @page { margin: 0; } body { margin: 1.6cm; } }
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                        .logo-container { display: flex; align-items: center; gap: 12px; }
                        .logo-img { height: 80px; width: auto; object-fit: contain; }
                        .logo-text { font-size: 24px; font-weight: 800; color: #000000; letter-spacing: -0.5px; }
                        .invoice-title { font-size: 20px; font-weight: bold; text-align: right; color: #64748b; }
                        .section { margin-bottom: 40px; }
                        .section-title { font-size: 14px; font-weight: bold; color: #475569; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                        .stat-item { padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
                        .stat-label { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
                        .stat-value { font-size: 20px; font-weight: 800; color: #0f172a; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { text-align: left; padding: 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
                        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo-container">
                            <img src="${window.location.origin}/logo_full.png" alt="Logo" class="logo-img" />
                        </div>
                        <div class="invoice-title">FINANCIAL REPORT<br><span style="font-size: 14px; font-weight: normal;">${selectedDate}</span></div>
                    </div>

                    <div class="section">
                        <div class="section-title">Overview</div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-label">Total Revenue</div>
                                <div class="stat-value">₹ 8,45,000</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Net Collections</div>
                                <div class="stat-value">₹ 5,20,000</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Digital Payments</div>
                                <div class="stat-value">₹ 3,25,000</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">Expenses</div>
                                <div class="stat-value" style="color: #ef4444;">₹ 45,000</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">Zone Performance</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Zone / Area</th>
                                    <th>Performance</th>
                                    <th style="text-align: right;">Collection</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Ahmedabad (East)</td>
                                    <td>
                                        <div style="background: #e2e8f0; height: 6px; width: 100px; border-radius: 4px; overflow: hidden;">
                                            <div style="background: #3b82f6; height: 100%; width: 85%;"></div>
                                        </div>
                                    </td>
                                    <td style="text-align: right; font-weight: bold;">₹ 2,50,000</td>
                                </tr>
                                <tr>
                                    <td>Surat Market</td>
                                    <td>
                                        <div style="background: #e2e8f0; height: 6px; width: 100px; border-radius: 4px; overflow: hidden;">
                                            <div style="background: #6366f1; height: 100%; width: 70%;"></div>
                                        </div>
                                    </td>
                                    <td style="text-align: right; font-weight: bold;">₹ 1,80,000</td>
                                </tr>
                                <tr>
                                    <td>Vadodara Central</td>
                                    <td>
                                        <div style="background: #e2e8f0; height: 6px; width: 100px; border-radius: 4px; overflow: hidden;">
                                            <div style="background: #06b6d4; height: 100%; width: 55%;"></div>
                                        </div>
                                    </td>
                                    <td style="text-align: right; font-weight: bold;">₹ 1,20,000</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="footer">
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
        } catch (e) {
            console.error(e);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Analytics & Reports</h1>
                    <p className="text-slate-400 mt-2 font-medium text-lg">Deep dive into your financial performance and operational metrics.</p>
                </div>
                <div className="flex gap-4 relative">
                    {/* Date Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDateOpen(!isDateOpen)}
                            className="flex items-center gap-2 bg-[#1e293b] hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-bold transition-colors border border-white/10 shadow-lg cursor-pointer"
                        >
                            <Calendar size={20} className="text-indigo-400" />
                            <span>{selectedDate}</span>
                            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDateOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                                >
                                    {['Jan 2026', 'Dec 2025', 'Nov 2025', 'Oct 2025'].map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => {
                                                setSelectedDate(date);
                                                setIsDateOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-sm font-bold"
                                        >
                                            {date}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Download size={20} />
                        )}
                        <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="₹ 8,45,000"
                    trend="+12%"
                    color="bg-blue-600"
                    icon={<TrendingUp />}
                    isActive={selectedStat === 'revenue'}
                    onClick={() => setSelectedStat('revenue')}
                    type="revenue"
                />
                <StatCard
                    title="Cash Collection"
                    value="₹ 5,20,000"
                    trend="+8%"
                    color="bg-emerald-600"
                    icon={<Wallet />}
                    isActive={selectedStat === 'collection'}
                    onClick={() => setSelectedStat('collection')}
                    type="collection"
                />
                <StatCard
                    title="Digital / UPI"
                    value="₹ 3,25,000"
                    trend="+15%"
                    color="bg-purple-600"
                    icon={<CreditCard />}
                    isActive={selectedStat === 'upi'}
                    onClick={() => setSelectedStat('upi')}
                    type="upi"
                />
                <StatCard
                    title="Operational Exp."
                    value="₹ 45,000"
                    trend="-2%"
                    color="bg-rose-600"
                    icon={<ArrowUpRight />}
                    isActive={selectedStat === 'expense'}
                    onClick={() => setSelectedStat('expense')}
                    type="expense"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Revenue Analysis */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Interactive Revenue Graph */}
                    <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 relative z-10 gap-6">
                            <div>
                                <h3 key={selectedStat} className="text-2xl font-bold text-white transition-all">{getGraphTitle()}</h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-1">Income Over Time</p>
                            </div>
                            <div className="flex bg-[#0f172a]/80 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                                {['Week', 'Month', 'Year'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setChartPeriod(period as any)}
                                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${chartPeriod === period ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Animated Bar Chart */}
                        <div className="h-72 flex justify-between gap-3 relative z-10 px-2 group">
                            <ChartBars key={`${chartPeriod}-${selectedStat}`} period={chartPeriod} statType={selectedStat} />
                        </div>
                    </div>

                    {/* Detailed Report Download Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Financial Reports</h3>
                                    <p className="text-slate-400 text-sm">Download detailed statements</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <ReportItem title="Daily Collection Summary" subtitle="Selected: Today" />
                                <ReportItem title="Monthly Tax / GST Report" subtitle="FY 2025-26" />
                                <ReportItem title="Expense & Payout Dictionary" subtitle="All Verified Entries" />
                            </div>
                        </div>

                        <div className="bg-[#1e293b]/60 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Staff Insights</h3>
                                    <p className="text-slate-400 text-sm">Performance & Handover data</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <ReportItem title="Staff Efficiency Scorecard" subtitle="Monthly Performance" />
                                <ReportItem title="Pending Handovers List" subtitle="Live Status" />
                                <ReportItem title="Route Coverage Analysis" subtitle="Zone-wise Report" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-8">

                    {/* Payment Mode Distribution (Donut Chart) */}
                    <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Collection Modes</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Payment Method Split</p>
                            </div>
                            <button
                                onClick={() => {
                                    try {
                                        const text = "Payment Soft Report\n\nCollection Modes:\n• Cash: 60% (₹ 5.2L)\n• UPI: 30% (₹ 2.5L)\n• Cheque: 10% (₹ 75k)\n\nNet Collection: ₹ 8.45L";
                                        if (typeof navigator !== 'undefined' && navigator.share) {
                                            navigator.share({
                                                title: 'Payment Collection Report',
                                                text: text,
                                            }).catch(console.error);
                                        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                            navigator.clipboard.writeText(text);
                                            alert('Report summary copied to clipboard!');
                                        } else {
                                            alert('Share not supported on this device.');
                                        }
                                    } catch (err) {
                                        console.error("Share failed:", err);
                                        alert("Could not share report.");
                                    }
                                }}
                                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors active:scale-90"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>

                        {/* Custom SVG Donut Chart */}
                        <div className="relative w-64 h-64 mx-auto my-8 group cursor-pointer hover:scale-105 transition-transform duration-500">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                {/* Circle Background */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />

                                {/* Segments */}
                                {/* Cash: 60% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="100" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 group-hover:stroke-width-14" />
                                {/* UPI: 30% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="175" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000 delay-100 group-hover:stroke-width-14" />
                                {/* Cheque: 10% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000 delay-200 group-hover:stroke-width-14" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-extrabold text-white">60%</span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Cash</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <ChartLegend color="bg-emerald-500" label="Cash Payment" value="₹ 5.2L (60%)" />
                            <ChartLegend color="bg-purple-500" label="UPI / Online" value="₹ 2.5L (30%)" />
                            <ChartLegend color="bg-amber-500" label="Cheque / Draft" value="₹ 75k (10%)" />
                        </div>

                        {/* Smart Insight Box */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20 bg-indigo-500 w-20 h-20 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
                            <div className="flex gap-3 relative z-10">
                                <div className="bg-indigo-500 text-white p-2 rounded-lg h-fit shadow-lg shadow-indigo-500/20">
                                    <TrendingUp size={16} />
                                </div>
                                <div>
                                    <h4 className="text-indigo-200 font-bold text-sm">Smart Insight</h4>
                                    <p className="text-indigo-100/80 text-xs mt-1 leading-relaxed">
                                        Digital payments (UPI) saw a <span className="text-white font-bold">+15% spike</span> this week compared to last month.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Zone Performance Widget */}
                    <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Zone Performance</h3>
                            <MapPin size={18} className="text-slate-400" />
                        </div>
                        <div className="space-y-6">
                            <ZoneBar name="Ahmedabad (East)" amount="₹ 2.5L" pct={85} color="bg-blue-500" />
                            <ZoneBar name="Surat Market" amount="₹ 1.8L" pct={70} color="bg-indigo-500" />
                            <ZoneBar name="Vadodara Central" amount="₹ 1.2L" pct={55} color="bg-cyan-500" />
                        </div>
                        <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm text-slate-300 hover:text-white transition-colors border border-white/5">
                            View All Zones
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}

// Sub-components

function ChartBars({ period, statType = 'revenue' }: { period: 'Week' | 'Month' | 'Year', statType?: string }) {

    // Configuration for different periods
    const chartConfig: any = {
        Week: {
            revenue: [40, 60, 45, 90, 30, 75, 50],
            collection: [30, 50, 40, 80, 20, 70, 40],
            upi: [20, 30, 25, 50, 15, 40, 20],
            expense: [10, 5, 8, 12, 5, 8, 10],
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        Month: {
            revenue: [30, 45, 60, 50, 70],
            collection: [25, 40, 50, 45, 60],
            upi: [15, 20, 30, 25, 35],
            expense: [5, 8, 10, 8, 12],
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
        },
        Year: {
            revenue: [50, 65, 60, 80, 75, 85, 90, 95, 80, 85, 90, 100],
            collection: [40, 55, 50, 70, 65, 75, 80, 85, 70, 75, 80, 90],
            upi: [20, 25, 30, 40, 35, 45, 50, 55, 40, 45, 50, 60],
            expense: [10, 12, 11, 15, 12, 14, 15, 18, 12, 14, 15, 18],
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    };

    const currentData = chartConfig[period][statType] || chartConfig[period].revenue;
    const currentLabels = chartConfig[period].labels;

    return (
        <>
            {currentData.map((h: number, i: number) => (
                <div key={`${period}-${i}`} className="flex-1 flex flex-col justify-end group cursor-pointer h-full relative items-center">

                    {/* Hover Tooltip/Value */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-indigo-950 font-bold text-xs py-1.5 px-3 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none transform translate-y-2 group-hover:translate-y-0 z-20">
                        {h}%
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                    </div>

                    {/* Bar Container */}
                    <div className="relative w-2 md:w-4 lg:w-6 bg-white/5 rounded-full transition-colors h-full flex items-end justify-center overflow-visible">

                        {/* Glow Behind */}
                        <div
                            style={{ height: `${h}%` }}
                            className={`absolute bottom-0 w-full rounded-full blur-md transition-all duration-1000 group-hover:bg-cyan-400/30 ${statType === 'expense' ? 'bg-rose-500/20' : 'bg-cyan-500/20'}`}
                        ></div>

                        {/* Actual Bar */}
                        <div
                            style={{ height: `${h}%` }}
                            className={`w-full rounded-full relative transition-all duration-1000 ease-out group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] 
                                ${statType === 'expense'
                                    ? 'bg-gradient-to-t from-rose-600 via-pink-500 to-orange-400'
                                    : 'bg-gradient-to-t from-indigo-600 via-purple-500 to-cyan-400'}`}
                        >
                            {/* Inner Shine */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 rounded-r-full pointer-events-none"></div>

                            {/* Top Cap Highlight */}
                            <div className="absolute top-0 w-full h-1 bg-white/50 rounded-full shadow-[0_0_10px_white]"></div>
                        </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 text-center mt-4 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                        {currentLabels[i]}
                    </span>
                </div>
            ))}
        </>
    );
}

function StatCard({ title, value, trend, color, icon, isActive, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`
                bg-[#1e293b]/60 backdrop-blur-xl p-6 rounded-[2rem] relative overflow-hidden group 
                hover:-translate-y-1 transition-all duration-300 shadow-xl cursor-pointer
                ${isActive ? 'border-2 border-indigo-500/50 shadow-indigo-500/10' : 'border border-white/5'}
            `}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color} w-32 h-32 rounded-full blur-2xl translate-x-8 -translate-y-8`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-4 rounded-2xl bg-[#0f172a] text-white shadow-inner border border-white/5 group-hover:scale-110 transition-transform ${isActive ? 'bg-indigo-600' : ''}`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${color} bg-opacity-10 text-white border border-white/10 flex items-center gap-1`}>
                    {trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {trend}
                </span>
            </div>
            <div className="relative z-10 mt-4">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
                <p className={`text-xs font-bold uppercase tracking-wider mt-1 opacity-80 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>{title}</p>
            </div>
        </div>
    )
}

function ReportItem({ title, subtitle }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-[#0f172a] hover:bg-white/5 rounded-2xl border border-white/5 group cursor-pointer transition-all active:scale-[0.98]">
            <div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{title}</h4>
                <p className="text-slate-500 text-xs font-bold mt-0.5">{subtitle}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                <Download size={18} />
            </div>
        </div>
    )
}

function ChartLegend({ color, label, value }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_8px_currentColor]`}></div>
                <span className="text-sm font-bold text-slate-300">{label}</span>
            </div>
            <span className="text-sm font-bold text-white">{value}</span>
        </div>
    )
}

function ZoneBar({ name, amount, pct, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                <span>{name}</span>
                <span className="text-white">{amount}</span>
            </div>
            <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </motion.div>
            </div>
        </div>
    )
}
