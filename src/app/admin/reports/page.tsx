"use client";

import { FileText, Download, Calendar, ArrowUpRight, TrendingUp, Users, Wallet, CreditCard, ChevronDown, Filter, PieChart, MapPin, Share2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { db, Collection, Expense } from "@/services/db";
import { useCurrency } from "@/hooks/useCurrency";
import jsPDF from 'jspdf';

export default function ReportsPage() {
    const [chartPeriod, setChartPeriod] = useState<'Week' | 'Month' | 'Year'>('Year');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedDate, setSelectedDate] = useState('Jan 2026');
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedStat, setSelectedStat] = useState('revenue');
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

    // Real Data State
    const [transactions, setTransactions] = useState<Collection[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const loadData = () => {
            setTransactions(db.getCollections());
            setExpenses(db.getExpenses());
            setStaffList(db.getStaff());
            setZones(db.getZones());
        };
        loadData();
        window.addEventListener('transaction-updated', loadData);
        window.addEventListener('expense-updated', loadData);
        window.addEventListener('zone-updated', loadData);
        return () => {
            window.removeEventListener('transaction-updated', loadData);
            window.removeEventListener('expense-updated', loadData);
            window.removeEventListener('zone-updated', loadData);
        };
    }, []);

    // 1. Calculate Stats
    const totalRevenue = transactions
        .filter(t => t.status === 'Paid')
        .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

    const cashCollection = transactions
        .filter(t => t.status === 'Paid' && t.mode === 'Cash')
        .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

    const upiCollection = transactions
        .filter(t => t.status === 'Paid' && t.mode !== 'Cash')
        .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

    const totalExpense = expenses
        .reduce((sum, e) => sum + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);

    // Calc Percentages
    const netTotal = totalRevenue || 1; // Avoid NaN
    const cashPct = Math.round((cashCollection / netTotal) * 100);
    const upiPct = Math.round((upiCollection / netTotal) * 100);
    const otherPct = 100 - cashPct - upiPct; // Remainder (usually 0 if only Cash/UPI)

    // Dynamic Trend Logic (Month over Month)
    const getTrendStats = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const getMonthData = (month: number, year: number) => {
            const mTransactions = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === month && d.getFullYear() === year && t.status === "Paid";
            });
            const mExpenses = expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });

            const revenue = mTransactions.reduce((s, t) => s + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);
            const expense = mExpenses.reduce((s, e) => s + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);
            const netRevenue = revenue; // Using Gross Revenue as 'Net Revenue' title usually implies for these dashboards, or if calc is Revenue - Expense
            // Note: In Dashboard 'Net Revenue' was Gross - Expense. Here title is "Net Revenue" but variable used was `totalRevenue` (which is gross collection).
            // I will match the value displayed in the card. Card displays `totalRevenue` (lines 44-46) which is just Sum of Paid Transactions.
            // So for trend, I will compare Sum of Paid Transactions.

            const cash = mTransactions.filter(t => t.mode === 'Cash').reduce((s, t) => s + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);
            const upi = revenue - cash;

            return { revenue, expense, cash, upi };
        };

        const current = getMonthData(currentMonth, currentYear);
        const last = getMonthData(lastMonth, lastMonthYear);

        const calc = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        return {
            revenue: calc(current.revenue, last.revenue).toFixed(1),
            expense: calc(current.expense, last.expense).toFixed(1),
            cash: calc(current.cash, last.cash).toFixed(1),
            upi: calc(current.upi, last.upi).toFixed(1)
        };
    };

    const trends = getTrendStats();
    const formatTrend = (val: string) => {
        const num = Number(val);
        return (num > 0 ? "+" : "") + val + "%";
    };

    const getGraphTitle = () => {
        switch (selectedStat) {
            case 'revenue': return 'Revenue Trends';
            case 'collection': return 'Cash Collection Trends';
            case 'upi': return 'Digital / UPI Trends';
            case 'expense': return 'Operational Expenses';
            default: return 'Revenue Trends';
        }
    }

    const getReportStyles = () => {
        return `
                <html>
                <head>
                    <title>Report - ${new Date().toLocaleDateString()}</title>
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
                <body>`;
    };

    const handleExport = () => {
        setIsExporting(true);

        try {
            const printWindow = window.open('', '', 'width=800,height=600');
            if (!printWindow) {
                alert("Please allow popups to download the report.");
                setIsExporting(false);
                return;
            }

            const htmlContent = getReportStyles() + `
                    <div class="header">
                        <div class="logo-container">
                             <span class="logo-text">${db.getAppSettings().appName}</span>
                        </div>
                        <div class="invoice-title">
                            REPORT<br>
                            <span style="font-size: 14px; font-weight: normal;">Generated on ${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
            `;

            // Note: This handleExport logic seems incomplete in the snippet but we are fixing the window duplication first
            // We'll just return it as before if it was returning string, but here we are writing to it? 
            // The previous logic was returning string. 

            return htmlContent;
        } catch (e) {
            console.error("Error generating report header", e);
            return "";
        }
    };

    const handleDownloadReport = (type: string) => {
        const doc = new jsPDF();
        const today = db.formatDate(new Date());
        let yPos = 20;

        // Header
        const company = db.getCompanyDetails();
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(company.name || "Aarya Technologies", 105, yPos, { align: 'center' });

        yPos += 8;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(company.address || "Ahmedabad, Gujarat", 105, yPos, { align: 'center' });

        yPos += 6;
        doc.text(`GST: ${company.gst || 'N/A'}`, 105, yPos, { align: 'center' });
        yPos += 15;

        // Report Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');

        if (type === 'daily') {
            doc.text('Daily Collection Summary', 105, yPos, { align: 'center' });
            yPos += 15;

            const dailyTxns = transactions.filter(t => t.date === new Date().toISOString().split('T')[0] && t.status === 'Paid');
            const total = dailyTxns.reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Collected: ${formatCurrency(total).replace('₹', 'Rs.')}`, 20, yPos);
            yPos += 7;
            doc.text(`Transactions: ${dailyTxns.length}`, 20, yPos);
            yPos += 12;

            // Table
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('ID', 20, yPos);
            doc.text('Customer', 45, yPos);
            doc.text('Staff', 90, yPos);
            doc.text('Mode', 120, yPos);
            doc.text('Amount', 160, yPos, { align: 'right' });
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            dailyTxns.slice(0, 25).forEach(t => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(t.id.substring(0, 12), 20, yPos);
                doc.text(t.customer.substring(0, 20), 45, yPos);
                doc.text(t.staff.substring(0, 15), 90, yPos);
                doc.text(t.mode, 120, yPos);
                doc.text(t.amount, 160, yPos, { align: 'right' });
                yPos += 6;
            });

            doc.save(`Daily_Collection_${new Date().toISOString().split('T')[0]}.pdf`);

        } else if (type === 'gst') {
            doc.text(`Monthly GST Report (${db.getFinancialYear()})`, 105, yPos, { align: 'center' });
            yPos += 15;

            const currentMonth = new Date().getMonth();
            const monthlyTxns = transactions.filter(t => new Date(t.date).getMonth() === currentMonth && t.status === 'Paid');
            const totalRevenue = monthlyTxns.reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);
            const gstAmount = totalRevenue * 0.18;
            const netAmount = totalRevenue - gstAmount;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Gross Revenue: ${formatCurrency(totalRevenue).replace('₹', 'Rs.')}`, 20, yPos);
            yPos += 7;
            doc.text(`Taxable Value: ${formatCurrency(netAmount).replace('₹', 'Rs.')}`, 20, yPos);
            yPos += 7;
            doc.text(`GST (18%): ${formatCurrency(gstAmount).replace('₹', 'Rs.')}`, 20, yPos);

            doc.save(`GST_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } else if (type === 'expense') {
            doc.text('Expense Dictionary', 105, yPos, { align: 'center' });
            yPos += 15;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Title', 20, yPos);
            doc.text('Party', 70, yPos);
            doc.text('Category', 110, yPos);
            doc.text('Amount', 160, yPos, { align: 'right' });
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            expenses.slice(0, 30).forEach(e => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(e.title.substring(0, 25), 20, yPos);
                doc.text(e.party.substring(0, 20), 70, yPos);
                doc.text(e.category.substring(0, 20), 110, yPos);
                doc.text(formatCurrency(e.amount).replace('₹', 'Rs.'), 160, yPos, { align: 'right' });
                yPos += 6;
            });

            doc.save(`Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } else if (type === 'staff') {
            doc.text('Staff Efficiency Scorecard', 105, yPos, { align: 'center' });
            yPos += 15;

            const staffStats = staffList.map(s => {
                const myTxns = transactions.filter(t => t.staff.includes(s.name.split(' ')[0]) && t.status === 'Paid');
                const total = myTxns.reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);
                return { name: s.name, role: s.role, count: myTxns.length, total };
            }).sort((a, b) => b.total - a.total);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Rank', 20, yPos);
            doc.text('Staff', 40, yPos);
            doc.text('Role', 90, yPos);
            doc.text('Txns', 125, yPos);
            doc.text('Total', 160, yPos, { align: 'right' });
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            staffStats.slice(0, 30).forEach((s, i) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`#${i + 1}`, 20, yPos);
                doc.text(s.name.substring(0, 25), 40, yPos);
                doc.text(s.role.substring(0, 20), 90, yPos);
                doc.text(String(s.count), 125, yPos);
                doc.text(formatCurrency(s.total).replace('₹', 'Rs.'), 160, yPos, { align: 'right' });
                yPos += 6;
            });

            doc.save(`Staff_Scorecard_${new Date().toISOString().split('T')[0]}.pdf`);

        } else if (type === 'pending') {
            doc.text('Pending Transactions', 105, yPos, { align: 'center' });
            yPos += 15;

            const pendingTxns = transactions.filter(t => t.status === 'Processing');

            if (pendingTxns.length === 0) {
                doc.setFontSize(11);
                doc.text('No pending transactions found.', 105, yPos, { align: 'center' });
            } else {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('ID', 20, yPos);
                doc.text('Customer', 50, yPos);
                doc.text('Staff', 100, yPos);
                doc.text('Amount', 160, yPos, { align: 'right' });
                yPos += 5;

                doc.setFont('helvetica', 'normal');
                pendingTxns.slice(0, 30).forEach(t => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    doc.text(t.id.substring(0, 15), 20, yPos);
                    doc.text(t.customer.substring(0, 25), 50, yPos);
                    doc.text(t.staff.substring(0, 20), 100, yPos);
                    doc.text(t.amount, 160, yPos, { align: 'right' });
                    yPos += 6;
                });
            }

            doc.save(`Pending_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } else if (type === 'route') {
            doc.text('Zone Coverage Analysis', 105, yPos, { align: 'center' });
            yPos += 15;

            const zonePerformance = transactions
                .filter(t => t.status === 'Paid')
                .reduce((acc, t) => {
                    const customer = db.getCustomers().find(c => c.name.toLowerCase() === t.customer.toLowerCase());
                    const zone = customer?.city || 'General';
                    acc[zone] = (acc[zone] || 0) + (parseFloat(t.amount.replace(/,/g, '')) || 0);
                    return acc;
                }, {} as Record<string, number>);

            const sortedZones = Object.entries(zonePerformance)
                .map(([name, amount]) => ({ name, amount }))
                .sort((a, b) => b.amount - a.amount);

            const totalZoneRevenue = sortedZones.reduce((sum, z) => sum + z.amount, 0);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Zone', 20, yPos);
            doc.text('Revenue', 100, yPos);
            doc.text('Share', 160, yPos, { align: 'right' });
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            sortedZones.forEach(z => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(z.name.substring(0, 30), 20, yPos);
                doc.text(formatCurrency(z.amount).replace('₹', 'Rs.'), 100, yPos);
                doc.text(`${Math.round((z.amount / totalZoneRevenue) * 100)}%`, 160, yPos, { align: 'right' });
                yPos += 6;
            });

            doc.save(`Zone_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    };

    // 6. Zone / City Performance (Synced with Settings > Zones)
    // Calculate revenue for each defined zone
    const zoneStats = zones.map(zone => {
        const revenue = transactions
            .filter(t => t.status === 'Paid')
            .filter(t => {
                const customer = db.getCustomers().find(c => c.name.toLowerCase() === t.customer.toLowerCase());
                // Match customer city to zone name (Case insensitive)
                return customer?.city?.toLowerCase() === zone.name.toLowerCase();
            })
            .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

        return { name: zone.name, amount: revenue };
    });

    // Sort by revenue
    const sortedZones = zoneStats.sort((a, b) => b.amount - a.amount);

    // Calculate Percentages for Bar Width
    const maxZoneAmount = sortedZones.length > 0 ? sortedZones[0].amount : 0;

    // 7. Dynamic Chart Data Aggregation
    const chartData = React.useMemo(() => {
        const weeklyData = new Array(7).fill(0);
        const monthlyData = new Array(5).fill(0);
        const yearlyData = new Array(12).fill(0);

        // Parse Selected Date (e.g., "Jan 2026")
        const [selMonthStr, selYearStr] = selectedDate.split(' ');
        const currentYear = parseInt(selYearStr) || new Date().getFullYear();

        // Map Month String to Index
        const monthMap: { [key: string]: number } = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
        const currentMonth = monthMap[selMonthStr] ?? new Date().getMonth();

        const now = new Date(); // Current date for week calc based on actual current week (or should this also be based on selected date? Usually 'Week' view implies *current* week, but 'Month' view implies *selected* month)
        // Let's assume Week view is always "Current real-time Week" for now, but Month/Year views respect the Dropdown.
        // Actually, for consistency, if I select "Dec 2025", Month view should show Dec 2025 weeks.

        // Helper: Get Start of Selected Month (for Week calc if we want to be specific, but 'Week' usually means 'This Week')
        // Let's keep 'Week' as relative to TODAY for utility, but 'Month' and 'Year' relative to SELECTION.

        const startOfWeek = new Date(now);
        const dayOfWeek = startOfWeek.getDay() || 7; // 1=Mon, 7=Sun
        if (dayOfWeek !== 1) startOfWeek.setHours(-24 * (dayOfWeek - 1));
        else startOfWeek.setHours(0, 0, 0, 0); // It is Monday



        // Helper to parse amount
        const parseAmount = (amt: any) => parseFloat(String(amt).replace(/,/g, '')) || 0;

        // Select Source Data
        let sourceData: any[] = [];
        if (selectedStat === 'expense') {
            sourceData = expenses.filter(e => e.status !== 'Rejected');
        } else {
            sourceData = transactions.filter(t => t.status === 'Paid');
            if (selectedStat === 'collection') sourceData = sourceData.filter(t => t.mode === 'Cash');
            if (selectedStat === 'upi') sourceData = sourceData.filter(t => t.mode !== 'Cash');
        }

        sourceData.forEach(item => {
            const date = new Date(item.date);
            // Fallback if invalid date
            if (isNaN(date.getTime())) return;

            const amt = parseAmount(item.amount);

            // Year Data (Jan-Dec of current year)
            if (date.getFullYear() === currentYear) {
                yearlyData[date.getMonth()] += amt;
            }

            // Month Data (Weeks of current month)
            // Logic: Floor((Date - 1) / 7) gives 0-4
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                const day = date.getDate();
                const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
                monthlyData[weekIndex] += amt;
            }

            // Week Data (Current Week Mon-Sun)
            const timeDiff = date.getTime() - startOfWeek.getTime();
            const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

            if (daysDiff >= 0 && daysDiff < 7) {
                weeklyData[daysDiff] += amt;
            }
        });

        return {
            Week: { data: weeklyData, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
            Month: { data: monthlyData, labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'] },
            Year: { data: yearlyData, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
        };

    }, [transactions, expenses, selectedStat, selectedDate]);

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
                            <ChevronDown size={16} className={`text - slate - 500 transition - transform ${isDateOpen ? 'rotate-180' : ''} `} />
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

            {/* Top Stats Cards - SMART GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                <StatCard
                    title="Net Revenue"
                    value={formatCurrency(totalRevenue)}
                    trend={formatTrend(trends.revenue)}
                    color="bg-blue-600"
                    icon={<TrendingUp />}
                    isActive={selectedStat === 'revenue'}
                    onClick={() => setSelectedStat('revenue')}
                    type="revenue"
                />
                <StatCard
                    title="Cash Collection"
                    value={formatCurrency(cashCollection)}
                    trend={formatTrend(trends.cash)}
                    color="bg-emerald-600"
                    icon={<Wallet />}
                    isActive={selectedStat === 'collection'}
                    onClick={() => setSelectedStat('collection')}
                    type="collection"
                />
                <StatCard
                    title="Digital / UPI"
                    value={formatCurrency(upiCollection)}
                    trend={formatTrend(trends.upi)}
                    color="bg-purple-600"
                    icon={<CreditCard />}
                    isActive={selectedStat === 'upi'}
                    onClick={() => setSelectedStat('upi')}
                    type="upi"
                />
                <StatCard
                    title="Operational Exp."
                    value={formatCurrency(totalExpense)}
                    trend={formatTrend(trends.expense)}
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
                            <div className="flex bg-[#0f172a]/80 p-1.5 rounded-xl border border-white/5 backdrop-blur-md gap-4">
                                {['Week', 'Month', 'Year'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setChartPeriod(period as any)}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${chartPeriod === period ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Animated Bar Chart */}
                        <div className="h-72 flex justify-between gap-3 relative z-10 px-2 group">
                            <ChartBars
                                data={chartData[chartPeriod].data}
                                labels={chartData[chartPeriod].labels}
                                statType={selectedStat}
                            />
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
                                <ReportItem title="Daily Collection Summary" subtitle="Selected: Today" onClick={() => handleDownloadReport('daily')} />
                                <ReportItem title="Monthly Tax / GST Report" subtitle={db.getFinancialYear()} onClick={() => handleDownloadReport('gst')} />
                                <ReportItem title="Expense & Payout Dictionary" subtitle="All Verified Entries" onClick={() => handleDownloadReport('expense')} />
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
                                <ReportItem title="Staff Efficiency Scorecard" subtitle="Monthly Performance" onClick={() => handleDownloadReport('staff')} />
                                <ReportItem title="Pending Handovers List" subtitle="Live Status" onClick={() => handleDownloadReport('pending')} />
                                <ReportItem title="Route Coverage Analysis" subtitle="Zone-wise Report" onClick={() => handleDownloadReport('route')} />
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
                                        const appName = db.getAppSettings().appName;
                                        const text = `${appName} Report\n\nCollection Modes: \n• Cash: ${cashPct}% (${formatCurrency(cashCollection)}) \n• UPI: ${upiPct}% (${formatCurrency(upiCollection)}) \n\nNet Collection: ${formatCurrency(totalRevenue)} `;
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

                        {/* Custom SVG Donut Chart - Dynamic */}
                        <div className="relative w-64 h-64 mx-auto my-8 group cursor-pointer hover:scale-105 transition-transform duration-500">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                {/* Circle Background */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />

                                {/* Segments - Dynamic */}
                                {/* Cash */}
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                    stroke="#10b981"
                                    strokeWidth="12"
                                    strokeDasharray={`${(cashPct / 100) * 251.2} 251.2`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 group-hover:stroke-width-14"
                                />
                                {/* UPI - Starts where Cash ends */}
                                {upiPct > 0 && (
                                    <circle
                                        cx="50" cy="50" r="40"
                                        fill="transparent"
                                        stroke="#8b5cf6"
                                        strokeWidth="12"
                                        strokeDasharray={`${(upiPct / 100) * 251.2} 251.2`}
                                        strokeDashoffset={`${-(cashPct / 100) * 251.2} `}
                                        strokeLinecap="round"
                                        className="drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000 delay-100 group-hover:stroke-width-14"
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-extrabold text-white">{cashPct}%</span>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Cash</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <ChartLegend color="bg-emerald-500" label="Cash Payment" value={`${formatCurrency(cashCollection)} (${cashPct}%)`} />
                            <ChartLegend color="bg-purple-500" label="UPI / Online" value={`${formatCurrency(upiCollection)} (${upiPct}%)`} />
                            <ChartLegend color="bg-amber-500" label="Other" value={`${otherPct}% `} />
                        </div>

                        {/* Smart Insight Box */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20 bg-indigo-500 w-20 h-20 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
                            <div className="flex gap-3 relative z-10">
                                <div className="bg-indigo-500 text-white p-2 rounded-lg h-fit shadow-lg shadow-indigo-500/20">
                                    <TrendingUp size={16} />
                                </div>
                                <div>
                                    <h4 className="text-indigo-200 font-bold text-sm">Real-time Insight</h4>
                                    <p className="text-indigo-100/80 text-xs mt-1 leading-relaxed">
                                        You have collected <span className="text-white font-bold">{formatCurrency(totalRevenue)}</span> today.
                                        {cashPct > upiPct ? " Cash is the dominant mode." : " Digital payments are trending."}
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
                            {sortedZones.length > 0 ? (
                                sortedZones.slice(0, 3).map((z, i) => (
                                    <ZoneBar
                                        key={z.name}
                                        name={z.name}
                                        amount={formatCurrency(z.amount)}
                                        pct={maxZoneAmount ? (z.amount / maxZoneAmount) * 100 : 0}
                                        color={i === 0 ? "bg-blue-500" : i === 1 ? "bg-indigo-500" : "bg-cyan-500"}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-slate-500 text-sm font-bold py-4">No zone data available</p>
                            )}
                        </div>
                        <button
                            onClick={() => setIsZoneModalOpen(true)}
                            className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm text-slate-300 hover:text-white transition-colors border border-white/5"
                        >
                            View All Zones
                        </button>
                    </div>

                    {/* All Zones Modal */}
                    <AnimatePresence>
                        {isZoneModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsZoneModalOpen(false)}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden max-h-[80vh] flex flex-col"
                                >
                                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                        <h3 className="text-xl font-bold text-white">All Zones Performance</h3>
                                        <button onClick={() => setIsZoneModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-4">
                                        {sortedZones.length > 0 ? (
                                            sortedZones.map((z, i) => (
                                                <ZoneBar
                                                    key={z.name}
                                                    name={z.name}
                                                    amount={formatCurrency(z.amount)}
                                                    pct={maxZoneAmount ? (z.amount / maxZoneAmount) * 100 : 0}
                                                    color={i === 0 ? "bg-blue-500" : i === 1 ? "bg-indigo-500" : i === 2 ? "bg-cyan-500" : "bg-slate-500"}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-center text-slate-500 text-sm font-bold py-4">No zone data available</p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </div>

            </div>

        </div>
    );
}

// Sub-components

function ChartBars({ data, labels, statType = 'revenue' }: { data: number[], labels: string[], statType?: string }) {

    // Normalize data for visualization (height 0-100%)
    const maxVal = Math.max(...data, 1);
    const normalizedData = data.map(val => (val / maxVal) * 100);

    return (
        <>
            {normalizedData.map((h: number, i: number) => (
                <div key={`${i}`} className="flex-1 flex flex-col justify-end group cursor-pointer h-full relative items-center">

                    {/* Hover Tooltip/Value */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-indigo-950 font-bold text-xs py-1.5 px-3 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none transform translate-y-2 group-hover:translate-y-0 z-20 whitespace-nowrap">
                        {data[i].toLocaleString('en-IN')}
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
                                    : 'bg-gradient-to-t from-indigo-600 via-purple-500 to-cyan-400'
                                } `}
                        >
                            {/* Inner Shine */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 rounded-r-full pointer-events-none"></div>

                            {/* Top Cap Highlight */}
                            <div className="absolute top-0 w-full h-1 bg-white/50 rounded-full shadow-[0_0_10px_white]"></div>
                        </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 text-center mt-4 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                        {labels[i]}
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
    bg - [#1e293b] / 60 backdrop - blur - xl p - 6 rounded - [2rem] relative overflow - hidden group
    hover: -translate - y - 1 transition - all duration - 300 shadow - xl cursor - pointer
                ${isActive ? 'border-2 border-indigo-500/50 shadow-indigo-500/10' : 'border border-white/5'}
    `}
        >
            <div className={`absolute top - 0 right - 0 p - 4 opacity - 10 group - hover: opacity - 20 transition - opacity ${color} w - 32 h - 32 rounded - full blur - 2xl translate - x - 8 - translate - y - 8`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p - 4 rounded - 2xl bg - [#0f172a] text - white shadow - inner border border - white / 5 group - hover: scale - 110 transition - transform ${isActive ? 'bg-indigo-600' : ''} `}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                <span className={`text - xs font - bold px - 3 py - 1.5 rounded - xl ${color} bg - opacity - 10 text - white border border - white / 10 flex items - center gap - 1`}>
                    {trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                    {trend}
                </span>
            </div>
            <div className="relative z-10 mt-4">
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
                <p className={`text - xs font - bold uppercase tracking - wider mt - 1 opacity - 80 ${isActive ? 'text-indigo-300' : 'text-slate-400'} `}>{title}</p>
            </div>
        </div>
    )
}

function ReportItem({ title, subtitle, onClick }: any) {
    return (
        <div onClick={onClick} className="flex items-center justify-between p-4 bg-[#0f172a] hover:bg-white/5 rounded-2xl border border-white/5 group cursor-pointer transition-all active:scale-[0.98]">
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
                <div className={`w - 3 h - 3 rounded - full ${color} shadow - [0_0_8px_currentColor]`}></div>
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
                    animate={{ width: `${pct}% ` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h - full ${color} rounded - full relative overflow - hidden`}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </motion.div>
            </div>
        </div>
    )
}
