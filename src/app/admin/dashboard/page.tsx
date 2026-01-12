"use client";

import { Wallet, Users, ArrowUpRight, Plus, Activity, CreditCard, MoreHorizontal, TrendingUp, Calendar, Filter, X, Check, ChevronDown, Download, AlertCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import GoalTracker from "@/components/GoalTracker";
import { EnhancedTransactionItem } from "@/components/EnhancedTransactionItem";
import { db, Collection, Expense } from "@/services/db"; // Use proper service

import { useCurrency } from "@/hooks/useCurrency";
import jsPDF from 'jspdf';

// Helper to get formatted date string (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function AdminDashboard() {
    // Load from db service
    const [transactions, setTransactions] = useState<Collection[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]); // Add Expenses State
    const [isLoaded, setIsLoaded] = useState(false);
    const { formatCurrency } = useCurrency();

    // Customer Sync Logic
    const [customers, setCustomers] = useState<{ id: number, name: string }[]>([]);

    // Staff Sync Logic for Proper Dashboard Sync
    const [staffList, setStaffList] = useState<{ id: number; name: string; status?: string }[]>([]);
    useEffect(() => {
        const loadStaff = () => setStaffList(db.getStaff());
        loadStaff();
        window.addEventListener('staff-updated', loadStaff);
        return () => window.removeEventListener('staff-updated', loadStaff);
    }, []);

    useEffect(() => {
        setCustomers(db.getCustomers());
        const handleCustUpdate = () => setCustomers(db.getCustomers());
        window.addEventListener('customer-updated', handleCustUpdate);
        return () => window.removeEventListener('customer-updated', handleCustUpdate);
    }, []);

    // Initial Load
    useEffect(() => {
        const loadData = () => {
            setTransactions(db.getCollections());
            setExpenses(db.getExpenses());
        };
        loadData();
        setIsLoaded(true);

        const handleUpdate = () => {
            setTransactions(db.getCollections());
            setExpenses(db.getExpenses()); // Refresh expenses too
        };

        window.addEventListener('transaction-updated', handleUpdate);
        window.addEventListener('expense-updated', handleUpdate); // Listen for expense updates

        return () => {
            window.removeEventListener('transaction-updated', handleUpdate);
            window.removeEventListener('expense-updated', handleUpdate);
        };
    }, []);

    // Calculate Stats
    // Helper for Trend Calculation (Current Month vs Last Month)
    const calculateTrend = (data: any[], type: 'revenue' | 'expense' | 'cash' | 'digital') => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const getSum = (month: number, year: number) => {
            return data
                .filter(item => {
                    const d = new Date(item.date);
                    // Filter by specific type logic if needed
                    if (type === 'cash' && item.mode !== 'Cash') return false;
                    if (type === 'digital' && item.mode === 'Cash') return false;
                    if (type === 'revenue' && item.customer?.startsWith('HANDOVER:')) return false;

                    return d.getMonth() === month && d.getFullYear() === year && (!item.status || item.status === 'Paid');
                })
                .reduce((sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0), 0);
        };

        const currentSum = getSum(currentMonth, currentYear);
        const lastSum = getSum(lastMonth, lastMonthYear);

        if (lastSum === 0) return currentSum > 0 ? 100 : 0;
        return ((currentSum - lastSum) / lastSum) * 100;
    };

    // Calculate Trends
    const revenueTrend = Number(calculateTrend(transactions, 'revenue').toFixed(0)); // Approx for Net Revenue (using Gross for trend proxy or strictly net? Let's use Gross for trend simplicity or calculate proper Net)
    // Actually, for "Available Cash" (Net), we should ideally compare (Rev-Exp) vs (LastRev-LastExp).
    // Let's refine the helper to allow calculating Net Trend.

    // Better Trend Logic:
    const getMonthlyStats = (monthOffset: number) => {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year && t.status === 'Paid' && !t.customer.startsWith('HANDOVER:');
        });
        const monthExps = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const gross = monthTxns.reduce((s, t) => s + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);
        const exp = monthExps.reduce((s, e) => s + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);

        const cash = monthTxns.filter(t => t.mode === 'Cash').reduce((s, t) => s + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);
        const digital = gross - cash;

        return { net: gross - exp, cash, digital, expense: exp };
    };

    const thisMonth = getMonthlyStats(0);
    const lastMonth = getMonthlyStats(1);

    const calcPerc = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const trends = {
        net: calcPerc(thisMonth.net, lastMonth.net).toFixed(1),
        cash: calcPerc(thisMonth.cash, lastMonth.cash).toFixed(1),
        digital: calcPerc(thisMonth.digital, lastMonth.digital).toFixed(1),
        expense: calcPerc(thisMonth.expense, lastMonth.expense).toFixed(1)
    };

    // 1. Total Revenue (Net Income = Gross - Expense)
    // 1. Total Revenue (Net Income = Gross - Expense)
    // 1. Total Revenue (Net Income = Gross - Expense)
    // EXCLUDE Handover transactions (Internal transfers)
    const grossRevenue = transactions
        .filter(t => t.status === 'Paid' && !t.customer.startsWith('HANDOVER:'))
        .reduce((sum, t) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

    // 4. Operational Expenses (Moved up for calculation)
    const totalExpense = expenses
        .reduce((sum, e) => sum + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);

    const totalRevenue = grossRevenue - totalExpense;

    // 2. Cash Collection
    // EXCLUDE Handover transactions
    const cashCollection = transactions
        .filter(t => t.status === 'Paid' && t.mode === 'Cash' && !t.customer.startsWith('HANDOVER:'))
        .reduce((sum, t) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

    // 3. Digital / UPI Collection (Derived as Gross - Cash)
    const digitalCollection = grossRevenue - cashCollection;

    // 5. Staff Leaderboard Calculation (Synced with Active Staff)
    const staffPerformance = transactions
        .filter(t => t.status === 'Paid' && !t.customer.startsWith('HANDOVER:'))
        .reduce((acc, t) => {
            // Normalize name: remove trailing dots, inconsistent spacing
            // HARDENED: Force string conversion to prevent crash if staff is not string
            let staffName = String(t.staff || 'Unknown').replace(/\.$/, '').trim();

            // Try to map to active staff if close match
            const matchedStaff = staffList.find(s =>
                s && s.name && ( // Ensure staff object and name exist
                    String(s.name).toLowerCase() === staffName.toLowerCase() ||
                    String(s.name).toLowerCase().startsWith(staffName.toLowerCase()) ||
                    staffName.toLowerCase().startsWith(String(s.name).toLowerCase())
                )
            );

            const finalName = matchedStaff ? matchedStaff.name : staffName;

            acc[finalName] = (acc[finalName] || 0) + (parseFloat(String(t.amount).replace(/,/g, '')) || 0);
            return acc;
        }, {} as Record<string, number>);


    const topPerformers = staffList
        .map(staff => {
            if (!staff || !staff.name) return { name: 'Unknown', amount: 0 };
            const amount = staffPerformance[staff.name] || 0;
            return { name: staff.name, amount };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Show Top 5 to include more staff


    // 6. Pending Handover Calculation
    const rawPending = transactions
        .filter(t => t.status === 'Paid' && t.mode === 'Cash') // Cash Only
        .reduce((acc, t) => {
            // Check if this is a Handover record
            if (t.customer.startsWith('HANDOVER: ')) {
                const staffName = t.customer.replace('HANDOVER: ', '').trim();
                const amount = parseFloat(String(t.amount).replace(/,/g, '')) || 0;

                // Match Logic
                const matchedStaff = staffList.find(s =>
                    s && s.name && (
                        String(s.name).toLowerCase() === staffName.toLowerCase() ||
                        staffName.toLowerCase().startsWith(String(s.name).toLowerCase())
                    )
                );
                const finalName = matchedStaff ? matchedStaff.name : staffName;

                // Subtract from balance
                acc[finalName] = (acc[finalName] || 0) - amount;
                return acc;
            }

            const staffName = String(t.staff || 'Unknown');
            const matchedStaff = staffList.find(s =>
                s && s.name && (
                    String(s.name).toLowerCase() === staffName.toLowerCase() ||
                    staffName.toLowerCase().startsWith(String(s.name).toLowerCase())
                )
            );
            const finalName = matchedStaff ? matchedStaff.name : staffName;

            acc[finalName] = (acc[finalName] || 0) + (parseFloat(String(t.amount).replace(/,/g, '')) || 0);
            return acc;
        }, {} as Record<string, number>);

    // Deduct Cash Expenses
    const pendingHandover = { ...rawPending };
    expenses.forEach(e => {
        if (e.method === 'Cash' && e.status !== 'Rejected' && e.createdBy) {
            const amount = parseFloat(String(e.amount)) || 0;
            const staffName = e.createdBy;

            const matchedStaff = staffList.find(s =>
                s && s.name && (
                    String(s.name).toLowerCase() === staffName.toLowerCase() ||
                    staffName.toLowerCase().startsWith(String(s.name).toLowerCase())
                )
            );
            const finalName = matchedStaff ? matchedStaff.name : staffName;

            pendingHandover[finalName] = (pendingHandover[finalName] || 0) - amount;
        }
    });

    const handoverList = Object.entries(pendingHandover)
        .map(([name, amount]) => ({ name, amount }))
        // Also Filter Handover List if needed, but maybe keep pending cash even if staff deleted? 
        // User asked for proper sync, so let's filter to be consistent.
        .filter(h => h && h.name && staffList.some(s => s && s.name === h.name) && h.amount > 0)
        .sort((a, b) => b.amount - a.amount);

    const totalPendingHandover = handoverList.reduce((sum, h) => sum + h.amount, 0);

    // ... (No need for persist effect as methods handle it now, and listener updates local state)

    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportButtonRef = useRef<HTMLButtonElement>(null);
    const [exportMenuPosition, setExportMenuPosition] = useState({ top: 0, left: 0 });

    // Toast State
    const [toastMsg, setToastMsg] = useState('');
    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    // Filter & Search State
    const [dateFilter, setDateFilter] = useState("Jan 2026");
    const dateButtonRef = useRef<HTMLButtonElement>(null);
    const [dateMenuPosition, setDateMenuPosition] = useState({ top: 0, left: 0, width: 0 });

    const handleDateClick = () => {
        if (isDateOpen) {
            setIsDateOpen(false);
        } else {
            if (dateButtonRef.current) {
                const rect = dateButtonRef.current.getBoundingClientRect();
                setDateMenuPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width
                });
                setIsDateOpen(true);
            }
        }
    };

    const handleExportClick = () => {
        if (isExportMenuOpen) {
            setIsExportMenuOpen(false);
        } else {
            if (exportButtonRef.current) {
                const rect = exportButtonRef.current.getBoundingClientRect();
                setExportMenuPosition({
                    top: rect.bottom + 8,
                    left: rect.left
                });
                setIsExportMenuOpen(true);
            }
        }
    };
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState(""); // Specific date filter
    const [showDropdown, setShowDropdown] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customer: "",
        amount: "",
        mode: "Cash",
        staff: "Admin",
        date: getTodayDate(),
        remarks: "",
        status: "Verified" as "Verified" | "Pending" | "Failed"
    });

    const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Jan 2026", "Dec 2025"];
    const filterOptions = ["All", "Cash", "UPI", "Cheque", "Pending", "Verified", "Failed"];



    const handleDateSelect = (option: string) => {
        setDateFilter(option);
        setIsDateOpen(false);
    };

    const handleFilterSelect = (option: string) => {
        setActiveFilter(option);
        setIsFilterOpen(false);
    };

    const handleSaveTransaction = () => {
        if (!formData.customer || !formData.amount) {
            alert("Please fill in Customer Name and Amount");
            return;
        }

        const newTxn: Collection = {
            id: `REC-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customer: formData.customer,
            amount: Number(formData.amount).toLocaleString(),
            staff: formData.staff.split(' ')[0] + ' ' + (formData.staff.split(' ')[1]?.[0] || '') + '.',
            mode: formData.mode as any,
            status: formData.status === "Verified" ? "Paid" : (formData.status as any), // Map Verified -> Paid
            date: formData.date,
            remarks: formData.remarks,
            contact: "+91 00000 00000" // Default
        };

        const updated = db.saveCollection(newTxn);
        setTransactions(updated);
        // Dispatch
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('transaction-updated'));

        setIsEntryModalOpen(false);
        // Reset form
        setFormData({
            customer: "",
            amount: "",
            mode: "Cash",
            staff: "Admin",
            date: getTodayDate(),
            remarks: "",
            status: "Verified"
        });
    };

    // Filter Logic
    const combinedFeed = [
        ...transactions.map(t => ({ ...t, isExpense: false })),
        ...expenses.map(e => ({
            id: `EXP-${e.id}`,
            time: '12:00 PM', // Default for expenses as they lack time field
            customer: e.party || e.title || 'Unknown Party',
            amount: `-${e.amount}`,
            staff: e.createdBy || 'Admin',
            mode: e.method,
            status: e.status === 'Paid' ? 'Verified' : e.status === 'Pending' ? 'Pending' : 'Failed',
            date: e.date,
            remarks: e.notes, // map notes to remarks
            isExpense: true
        }))
    ].sort((a, b) => {
        // Sort by Date Descending
        const dateA = new Date(a.date || '2000-01-01').getTime();
        const dateB = new Date(b.date || '2000-01-01').getTime();
        if (dateA !== dateB) return dateB - dateA;
        // If same date, try time?
        if (dateA !== dateB) return dateB - dateA;

        // Secondary Sort by ID (Timestamp extraction)
        // IDs are either "REC-123456" or "123456"
        const idA = parseInt(String(a.id).replace(/\D/g, '')) || 0;
        const idB = parseInt(String(b.id).replace(/\D/g, '')) || 0;
        return idB - idA; // Descending
    });

    const filteredTransactions = combinedFeed.filter(txn => {
        const matchesSearch = txn.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || txn.mode === activeFilter || txn.status === activeFilter;
        const matchesDate = !filterDate || txn.date === filterDate;
        return matchesSearch && matchesFilter && matchesDate;
    });

    // Action Handlers
    const handleVerifyTransaction = (id: number | string) => {
        // Find item
        const item = transactions.find(t => t.id === id);
        if (item) {
            // Toggle status
            const newStatus = item.status === 'Paid' ? 'Pending' : 'Paid';
            // We need updateCollection in db
            // For now, let's just delete and re-add or implement update?
            // Implementing quick updateshim:
            const updatedItem = { ...item, status: newStatus };
            // Use internal logic since update isn't exposed yet in getCollections
            // Actually I should add updateCollection to db.ts, but for now I can delete then add
            // db.deleteCollection(String(id)); // No need to delete anymore with upsert
            const updatedList = db.saveCollection(updatedItem as Collection);
            setTransactions(updatedList);
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('transaction-updated'));
        }
    };

    const handleDeleteTransaction = (id: number | string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            const updated = db.deleteCollection(String(id));
            setTransactions(updated);
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('transaction-updated'));
        }
    };

    const handleViewTransaction = (item: any) => {
        setFormData({
            customer: item.customer,
            amount: String(item.amount).replace(/,/g, ''),
            mode: item.mode,
            staff: item.staff.replace(/\.$/, ''), // Remove trailing dot if exists
            date: item.date || getTodayDate(),
            remarks: item.remarks || "",
            status: item.status
        });
        setIsEntryModalOpen(true);
    };

    // State for Single Receipt Modal
    const [activeReceipt, setActiveReceipt] = useState<any>(null);

    const handleDownloadReceipt = (item: any) => {
        setActiveReceipt(item);
        // We need a slight delay to let state update and render the modal/hidden view before printing
        // But since we are reusing the Staff History logic, let's keep it simple:
        // Open a "Receipt View" modal which has the download button, OR just auto-download?
        // User asked for "Download Receipt", let's open the receipt modal same as Staff History for consistency.
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 relative printable-area">

            {/* Action Header */}
            {/* Added z-50 to ensure dropdown stacks on top of subsequent elements */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-r from-indigo-900/50 to-blue-900/50 p-8 rounded-[2rem] border border-white/10 relative z-50 backdrop-blur-3xl shadow-2xl overflow-visible">

                {/* Background Effects Container - Clipped */}
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] -z-10">
                    <div className="absolute top-0 right-0 w-[400px] h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 hover:opacity-30 transition-opacity"></div>
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-xs font-bold text-indigo-200 mb-2 shadow-sm backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                        Live Collection Feed
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Overview</h1>
                    <p className="text-slate-300 mt-2 text-lg font-medium max-w-lg">Track your daily income, staff performance, and recent transactions in real-time.</p>
                </div>
                <div className="flex gap-4 relative z-20 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {/* Advanced Export Menu */}
                    <div className="relative shrink-0">
                        <button
                            ref={exportButtonRef}
                            onClick={handleExportClick}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-4 rounded-2xl font-bold flex items-center justify-center transition-all border border-white/5 group relative overflow-hidden"
                            title="Export Report"
                        >
                            <Download size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
                            {isExportMenuOpen && (
                                <motion.div
                                    layoutId="exportGlow"
                                    className="absolute inset-0 bg-indigo-600/20 rounded-2xl"
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </button>
                    </div>

                    {/* Export Menu Portal - Rendered at body level to avoid clipping/positioning issues */}
                    {typeof window !== 'undefined' && isExportMenuOpen && createPortal(
                        <AnimatePresence>
                            {isExportMenuOpen && exportMenuPosition.top > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="fixed w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[10001] p-1"
                                    style={{
                                        top: `${exportMenuPosition.top}px`,
                                        left: `${exportMenuPosition.left}px`
                                    }}
                                >
                                    {/* Invisible full-screen backdrop for click-outside */}
                                    <div
                                        className="fixed inset-0 z-[-1]"
                                        onClick={() => setIsExportMenuOpen(false)}
                                    />

                                    <button
                                        onClick={() => {
                                            const csvContent = "data:text/csv;charset=utf-8,"
                                                + "Time,Customer,Amount,Staff,Mode,Status,Date\n"
                                                + filteredTransactions.map(t => `${t.time},${t.customer},${t.amount},${t.staff},${t.mode},${t.status},${t.date}`).join("\n");
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 group relative z-10"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                            <Download size={16} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Export as CSV</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{filteredTransactions.length} records</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const csvContent = "data:text/csv;charset=utf-8,"
                                                + "Time,Customer,Amount,Staff,Mode,Status,Date\n"
                                                + filteredTransactions.map(t => `${t.time},${t.customer},${String(t.amount).replace(/,/g, '')},${t.staff},${t.mode},${t.status},${t.date}`).join("\n");
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `transaction_report_${new Date().toISOString().split('T')[0]}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 group relative z-10"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <CreditCard size={16} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Export as Excel</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">.CSV format</div>
                                        </div>
                                    </button>

                                    <div className="h-px bg-white/5 my-1 relative z-10"></div>

                                    <button
                                        onClick={() => {
                                            const doc = new jsPDF();
                                            const today = new Date().toLocaleDateString();

                                            // Header
                                            doc.setFontSize(20);
                                            doc.setFont('helvetica', 'bold');
                                            const appName = db.getAppSettings().appName;
                                            doc.text(appName, 105, 20, { align: 'center' });

                                            doc.setFontSize(16);
                                            doc.text('Transaction Report', 105, 30, { align: 'center' });

                                            doc.setFontSize(10);
                                            doc.setFont('helvetica', 'normal');
                                            doc.text(`Generated on: ${today}`, 105, 38, { align: 'center' });

                                            // Stats
                                            const totalAmount = filteredTransactions.reduce((sum, t) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

                                            doc.setFontSize(12);
                                            doc.setFont('helvetica', 'bold');
                                            doc.text(`Total Records: ${filteredTransactions.length}`, 20, 50);
                                            doc.text(`Total Amount: ${formatCurrency(totalAmount).replace('₹', 'Rs.')}`, 20, 58);

                                            // Table Headers
                                            let yPos = 70;
                                            doc.setFillColor(241, 245, 249); // slate-100
                                            doc.rect(20, yPos - 5, 170, 8, 'F');

                                            doc.setFontSize(9);
                                            doc.setFont('helvetica', 'bold');
                                            doc.text('Time', 22, yPos);
                                            doc.text('Customer', 45, yPos);
                                            doc.text('Staff', 95, yPos);
                                            doc.text('Mode', 135, yPos);
                                            doc.text('Amount', 188, yPos, { align: 'right' });

                                            yPos += 8;

                                            // Table Rows
                                            doc.setFont('helvetica', 'normal');
                                            filteredTransactions.forEach((t) => {
                                                if (yPos > 280) {
                                                    doc.addPage();
                                                    yPos = 20;
                                                    // Re-print header on new page? Optional, simplest is just continue rows
                                                }

                                                doc.text(t.time, 22, yPos);
                                                doc.text(t.customer.substring(0, 25), 45, yPos);
                                                doc.text(t.staff.substring(0, 20), 95, yPos);
                                                doc.text(t.mode, 135, yPos);
                                                doc.text(t.amount, 188, yPos, { align: 'right' });

                                                yPos += 7;
                                            });

                                            // Footer
                                            const pageCount = doc.internal.pages.length - 1;
                                            for (let i = 1; i <= pageCount; i++) {
                                                doc.setPage(i);
                                                doc.setFontSize(8);
                                                doc.setTextColor(150);
                                                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
                                            }

                                            doc.save(`Transaction_Report_${new Date().toISOString().split('T')[0]}.pdf`);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 group relative z-10"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                            <Download size={16} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">Export as PDF</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">High Quality Report</div>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        , document.body)}

                    {/* Date Dropdown */}
                    <div className="relative shrink-0">
                        <button
                            ref={dateButtonRef}
                            onClick={handleDateClick}
                            className="bg-white/5 hover:bg-white/15 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg border border-white/10 transition-all backdrop-blur-md min-w-[160px] justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-indigo-300 group-hover:text-white transition-colors" />
                                <span className="text-nowrap">{dateFilter} {activeReceipt ? 'R' : ''}</span>
                            </div>
                            <ChevronDown size={16} className={`text-white/50 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Date Menu Portal */}
                    {typeof window !== 'undefined' && isDateOpen && createPortal(
                        <AnimatePresence>
                            {isDateOpen && dateMenuPosition.top > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="fixed bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[10001] p-1"
                                    style={{
                                        top: `${dateMenuPosition.top}px`,
                                        left: `${dateMenuPosition.left}px`,
                                        width: `${dateMenuPosition.width}px`
                                    }}
                                >
                                    {/* Invisible full-screen backdrop for click-outside */}
                                    <div
                                        className="fixed inset-0 z-[-1]"
                                        onClick={() => setIsDateOpen(false)}
                                    />

                                    {dateOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleDateSelect(opt)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors relative z-10 ${dateFilter === opt ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        , document.body)}

                    <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="bg-white text-indigo-950 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-white/5 transition-transform active:scale-95 shrink-0 whitespace-nowrap"
                    >
                        <Plus size={22} strokeWidth={3} />
                        <span>New Entry</span>
                    </button>
                </div>
            </div>

            {/* Stats Row Breakdown: Revenue, Cash, Digital, Expense */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    title="AVAILABLE CASH"
                    value={formatCurrency(totalRevenue)}
                    icon={<TrendingUp />}
                    trend={`${Number(trends.net) > 0 ? '+' : ''}${trends.net}%`}
                    trendUp={Number(trends.net) >= 0}
                    color="bg-indigo-600"
                    href="/admin/collections"
                />

                <Card
                    title="CASH COLLECTION"
                    value={formatCurrency(cashCollection)}
                    icon={<Wallet />}
                    trend={`${Number(trends.cash) > 0 ? '+' : ''}${trends.cash}%`}
                    trendUp={Number(trends.cash) >= 0}
                    color="bg-emerald-600"
                    href="/admin/collections"
                />

                <Card
                    title="DIGITAL / UPI"
                    value={formatCurrency(digitalCollection)}
                    icon={<CreditCard />}
                    trend={`${Number(trends.digital) > 0 ? '+' : ''}${trends.digital}%`}
                    trendUp={Number(trends.digital) >= 0}
                    color="bg-purple-600"
                    href="/admin/collections"
                />

                <Card
                    title="OPERATIONAL EXP."
                    value={formatCurrency(totalExpense)}
                    icon={<ArrowUpRight />}
                    trend={`${Number(trends.expense) > 0 ? '+' : ''}${trends.expense}%`}
                    trendUp={Number(trends.expense) <= 0} // Green if expense goes down? Actually usually UI shows red if up. Let's keep logic consistent with icon direction.
                    // If trendUp is true (arrow up), it's usually Green for Revenue, but for Expense arrow up is Red.
                    // The Card component uses trendUp to decide Blue(Green) or Rose(Red).
                    // For Expense: Increase (Positive %) -> Bad (Red/Rose) -> trendUp needs to be FALSE for color Rose.
                    // Decrease (Negative %) -> Good (Blue) -> trendUp needs to be TRUE for color Blue.
                    // Wait, Card implementation: trendUp ? 'bg-blue-500' : 'bg-rose-500'.
                    // So for Expense:
                    // If expense increased (+ve), we want RED. So trendUp = false.
                    // If expense decreased (-ve), we want BLUE (Good). So trendUp = true.
                    // My logic: trendUp={Number(trends.expense) <= 0}
                    // If expense is -10% (decreased), -10 <= 0 is true -> Blue. Correct.
                    // If expense is +10% (increased), 10 <= 0 is false -> Red. Correct.
                    color="bg-rose-600"
                    href="/admin/expenses"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Feed */}
                <div className="xl:col-span-2 bg-[#1e293b]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[600px]">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Live Transactions</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Real-time payment feed from field staff</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-1 md:w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600"
                                />
                            </div>

                            {/* Date Filter Input */}
                            <div className="relative">
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-bold uppercase tracking-wider min-w-[150px]"
                                />
                            </div>

                            {/* Filter Button & Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`p-3 rounded-xl transition-colors border ${activeFilter !== 'All' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:text-white'}`}
                                >
                                    <Filter size={20} />
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
                                                    onClick={() => handleFilterSelect(opt)}
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

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((txn) => (
                                <EnhancedTransactionItem
                                    key={txn.id}
                                    {...txn}
                                    status={
                                        (txn.status === 'Paid' ? 'Verified' :
                                            txn.status === 'Processing' ? 'Pending' :
                                                txn.status) as any
                                    }
                                    onVerify={handleVerifyTransaction}
                                    onView={handleViewTransaction}
                                    onReceipt={handleDownloadReceipt}
                                    onDelete={handleDeleteTransaction}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <Filter size={48} className="mb-4 opacity-50" />
                                <p className="font-bold">No transactions found</p>
                                {(searchQuery || activeFilter !== 'All' || filterDate) && (
                                    <button
                                        onClick={() => { setSearchQuery(""); setActiveFilter("All"); setFilterDate(""); }}
                                        className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Widgets */}
                <div className="space-y-6">
                    {/* Staff Leaderboard */}
                    <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-[80px]"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Top Performers</h3>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/10">Lifetime</span>
                            </div>
                            <div className="space-y-5">
                                {topPerformers.length > 0 ? (
                                    topPerformers.map((staff, index) => (
                                        <LeaderboardItem key={staff.name} rank={String(index + 1)} name={staff.name} amount={formatCurrency(staff.amount)} />
                                    ))
                                ) : (
                                    <div className="text-slate-500 text-sm text-center py-4 italic">No performance data yet</div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsHandoverModalOpen(true)}
                                className="block w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-colors border border-white/5 text-center text-indigo-300"
                            >
                                View Pending Handover
                            </button>
                        </div>
                    </div>

                    {/* Advanced Goal Widget */}
                    <GoalTracker currentRevenue={totalRevenue} />
                </div>

            </div>

            {/* New Entry Modal */}
            <AnimatePresence>
                {isEntryModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEntryModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">New Transaction</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-1">Record a new payment collection</p>
                                </div>
                                <button onClick={() => setIsEntryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search or enter customer..."
                                                value={formData.customer}
                                                onFocus={() => setShowDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, customer: e.target.value });
                                                    setShowDropdown(true);
                                                }}
                                                className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600 peer"
                                            />
                                            {/* Autocomplete Dropdown */}
                                            {showDropdown && (
                                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                                                    {customers.filter(c => c.name.toLowerCase().includes(formData.customer.toLowerCase())).length > 0 ? (
                                                        customers.filter(c => c.name.toLowerCase().includes(formData.customer.toLowerCase())).map((c) => (
                                                            <div
                                                                key={c.id}
                                                                onMouseDown={() => {
                                                                    setFormData({ ...formData, customer: c.name });
                                                                    setShowDropdown(false);
                                                                }}
                                                                className="px-5 py-3 hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white font-bold transition-colors"
                                                            >
                                                                {c.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-5 py-3 text-slate-500 text-sm italic">New customer will be created</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Mode</label>
                                        <select
                                            value={formData.mode}
                                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer appearance-none"
                                        >
                                            <option>Cash</option>
                                            <option>UPI</option>
                                            <option>Cheque</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Collected By</label>
                                        <select
                                            value={formData.staff}
                                            onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-lg cursor-pointer appearance-none"
                                        >
                                            <option value="Admin">Admin (Self)</option>
                                            {staffList.filter(s => s.status === 'Active').map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                                        <textarea
                                            placeholder="Add any notes..."
                                            rows={3}
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveTransaction}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center justify-center gap-3 border border-indigo-500/50 mt-6"
                                >
                                    <Plus size={24} strokeWidth={3} /> Save Transaction
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pending Handover Details Modal */}
            <AnimatePresence>
                {isHandoverModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHandoverModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0f172a]/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Pending Handover</h3>
                                    <p className="text-amber-500 text-xs font-bold mt-1">Cash held by staff</p>
                                </div>
                                <button onClick={() => setIsHandoverModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {handoverList.length > 0 ? (
                                    handoverList.map((item) => (
                                        <HandoverItem
                                            key={item.name}
                                            name={item.name}
                                            amount={formatCurrency(item.amount)}
                                            time="Pending"
                                            onAccept={() => {
                                                if (window.confirm(`Accept ₹${item.amount.toLocaleString('en-IN')} from ${item.name}?`)) {
                                                    db.acceptHandover(item.name, item.amount);
                                                    showToast(`Accepted transaction from ${item.name}`);
                                                    setIsHandoverModalOpen(false);
                                                }
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="text-slate-500 text-sm text-center py-4 italic">No pending cash handover</div>
                                )}

                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center px-2">
                                    <span className="text-slate-400 font-bold">Total Pending</span>
                                    <span className="text-2xl font-bold text-white">{formatCurrency(totalPendingHandover)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        // Send notification to Staff App
                                        db.sendStaffNotification("Please settle your cash balance immediately.");
                                        // Show In-App Toast
                                        showToast(`Settlement requests sent to ${handoverList.length} staff members.`);
                                        setIsHandoverModalOpen(false);
                                    }}
                                    className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-600/20 active:scale-95 transition-all">
                                    Request Settlement
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Toast UI */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#1e293b] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-sm tracking-wide">{toastMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Receipt Modal */}
            {activeReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setActiveReceipt(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white text-slate-900 w-full max-w-sm rounded-3xl overflow-hidden relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-indigo-600 p-6 text-center text-white relative print:hidden">
                            <h2 className="text-2xl font-bold mb-1 text-white uppercase tracking-widest">PAYMENT RECEIPT</h2>
                            <p className="opacity-80 text-xs tracking-widest uppercase text-white">Transaction Successful</p>
                        </div>
                        <div className="p-6 space-y-6 print:hidden">
                            <div className="text-center">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Amount Paid</p>
                                <h3 className="text-4xl font-black text-slate-900">{formatCurrency(parseFloat(String(activeReceipt.amount).replace(/,/g, '') || '0'))}</h3>
                            </div>
                            <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Payment To</span>
                                    <span className="text-slate-900 text-sm font-bold text-right">{activeReceipt.customer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Date & Time</span>
                                    <span className="text-slate-900 text-sm font-bold text-right">{activeReceipt.date || getTodayDate()}, {activeReceipt.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Transaction ID</span>
                                    <span className="text-slate-900 text-sm font-bold text-right">#{activeReceipt.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm font-bold">Payment Mode</span>
                                    <span className="text-slate-900 text-sm font-bold text-right bg-slate-100 px-2 py-0.5 rounded text-xs uppercase">{activeReceipt.mode}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
                            <button onClick={() => setActiveReceipt(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Close</button>
                            <button
                                onClick={() => {
                                    const doc = new jsPDF();

                                    // Header Background
                                    doc.setFillColor(79, 70, 229); // Indigo 600
                                    doc.rect(0, 0, 210, 40, 'F');

                                    // Header Text
                                    doc.setTextColor(255, 255, 255);
                                    doc.setFontSize(22);
                                    doc.setFont('helvetica', 'bold');
                                    doc.text("PAYMENT RECEIPT", 105, 18, { align: "center" });

                                    doc.setFontSize(10);
                                    doc.setFont('helvetica', 'normal');
                                    const appName = db.getAppSettings().appName;
                                    doc.text(appName.toUpperCase(), 105, 28, { align: "center" });

                                    // Amount Section
                                    doc.setTextColor(0, 0, 0);
                                    doc.setFontSize(10);
                                    doc.text("AMOUNT PAID", 105, 60, { align: "center" });

                                    doc.setFontSize(30);
                                    doc.setFont('helvetica', 'bold');
                                    doc.text(formatCurrency(parseFloat(String(activeReceipt.amount).replace(/,/g, '') || '0')).replace('₹', 'Rs.'), 105, 75, { align: "center" });

                                    // Divider
                                    doc.setDrawColor(200, 200, 200);
                                    doc.line(20, 90, 190, 90);

                                    // Details
                                    let y = 110;
                                    const addDetail = (label: string, value: string) => {
                                        doc.setFontSize(11);
                                        doc.setTextColor(100, 100, 100);
                                        doc.setFont('helvetica', 'bold');
                                        doc.text(label, 20, y);

                                        doc.setTextColor(0, 0, 0);
                                        doc.text(value, 190, y, { align: "right" });
                                        y += 15;
                                    };

                                    addDetail("Transaction ID", `#${activeReceipt.id}`);
                                    addDetail("Customer Name", activeReceipt.customer);
                                    addDetail("Date & Time", `${activeReceipt.date || getTodayDate()}, ${activeReceipt.time}`);
                                    addDetail("Payment Mode", activeReceipt.mode);
                                    addDetail("Status", "Successful");

                                    // Footer
                                    doc.setFontSize(9);
                                    doc.setTextColor(150, 150, 150);
                                    const appNameFooter = db.getAppSettings().appName;
                                    doc.text(`Generated via ${appNameFooter}`, 105, 280, { align: "center" });

                                    doc.save(`Receipt_${activeReceipt.id}.pdf`);
                                }}
                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                            >
                                Download PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}



        </div >
    );
}


function Card({ title, value, icon, trend, trendUp, color, href, onClick }: any) {
    const Content = (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-[#1e293b]/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer hover:bg-[#1e293b] active:scale-95 transition-all h-full flex flex-col justify-between`}
            onClick={onClick}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color} w-32 h-32 rounded-full blur-3xl translate-x-8 -translate-y-8`}></div>

            <div className="flex justify-between items-start relative z-10 w-full mb-6">
                {/* Icon Box */}
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                    {React.cloneElement(icon, { size: 28 })}
                </div>

                {/* Trend Pill */}
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold ${trendUp ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {trendUp ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                    {trend}
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-4xl font-black text-white tracking-tight mb-2">{value}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
            </div>
        </motion.div>
    );

    if (href && !onClick) {
        return <Link href={href} className="block h-full">{Content}</Link>;
    }
    return Content;
}



function LeaderboardItem({ rank, name, amount }: any) {
    const isFirst = rank === '1';
    return (
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-[#1e293b]/50 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg ${isFirst ? 'bg-amber-400 text-black shadow-amber-400/20' : 'bg-[#0f172a] text-slate-500'}`}>
                {rank}
            </div>
            <div className="flex-1">
                <p className={`font-bold text-base ${isFirst ? 'text-white' : 'text-slate-300'}`}>{name}</p>
            </div>
            <p className="font-bold text-emerald-400 text-lg tracking-tight">{amount}</p>
        </div>
    )
}



function HandoverItem({ name, amount, time, onAccept }: any) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {name[0]}
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">{name}</h4>
                    <p className="text-xs text-slate-500">{time}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="font-bold text-white">{amount}</span>
                {onAccept && (
                    <button
                        onClick={onAccept}
                        title="Accept Payment"
                        className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20"
                    >
                        <Check size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
