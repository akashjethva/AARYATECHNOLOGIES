"use client";

import { Wallet, TrendingUp, Bell, MapPin, Power, ChevronRight, Zap, CheckCircle, XCircle, ShieldCheck, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// ... imports
import { db, Collection } from "@/services/db";

export default function StaffHome() {
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [company, setCompany] = useState({
        companyName: db.getAppSettings().appName,
        logo: ""
    });
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const router = useRouter();

    const [collections, setCollections] = useState<Collection[]>([]);
    const [stats, setStats] = useState({ total: 0, cash: 0, online: 0, visits: 0 });
    const [recentTxns, setRecentTxns] = useState<Collection[]>([]);
    const [selectedTxn, setSelectedTxn] = useState<Collection | null>(null);

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [myNotifications, setMyNotifications] = useState<any[]>([]);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifs = () => {
            // Retrieve Dynamic Staff Name
            let staffName = "Rahul Varma";
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('payment_app_user');
                if (storedUser) {
                    try { staffName = JSON.parse(storedUser).name || staffName; } catch { }
                }
            }

            // Get Notifications from DB (already synced via Firestore)
            const notifs = db.getStaffNotifications(staffName);
            setMyNotifications(notifs);
        };

        fetchNotifs();
        // Listen for updates (triggered by setupFirebaseSync)
        const handleUpdate = () => fetchNotifs();
        window.addEventListener('staff-notif-updated', handleUpdate);
        return () => window.removeEventListener('staff-notif-updated', handleUpdate);
    }, []);

    // Load initial status & Data
    useEffect(() => {
        // ... existing status logic ...
        const savedStatus = localStorage.getItem('payment_app_staff_status');
        if (savedStatus) {
            try {
                const parsed = JSON.parse(savedStatus);
                if (parsed.name === 'Rahul Varma') {
                    setIsOnDuty(parsed.status === 'Online');
                }
            } catch (e) { }
        }

        const savedCompany = localStorage.getItem('payment_app_company_settings');
        if (savedCompany) {
            try {
                const parsed = JSON.parse(savedCompany);
                setCompany(prev => ({
                    ...prev,
                    companyName: parsed.companyName || prev.companyName,
                    logo: parsed.logo || prev.logo
                }));
            } catch (e) { }
        }

        // Fetch Live Collections
        const loadCollections = () => {
            const allCollections = db.getCollections();
            const allExpenses = db.getExpenses();
            const today = new Date().toISOString().split('T')[0];

            // Helper
            const cleanName = (name: string) => String(name || '').toLowerCase().replace(/\s+/g, '').trim();

            // DYNAMIC STAFF NAME RECOVERY
            let staffName = "Rahul Varma"; // Fallback
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('payment_app_user');
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        if (parsed.name) staffName = parsed.name;
                    } catch (e) { console.error("Error parsing user", e); }
                }
            }
            const currentStaffClean = cleanName(staffName);

            console.log("DEBUG: Staff Logged In:", staffName);

            // 1. Get ALL My Transactions (Lifetime)
            const myTxns = allCollections.filter(t => {
                const txnStaffClean = cleanName(t.staff);
                return txnStaffClean === currentStaffClean || txnStaffClean.includes(currentStaffClean);
            });

            // 2. Find Last Handover (Lifetime)
            let lastHandoverTime = 0;
            const myHandovers = allCollections.filter(t => {
                const s = t.status as any;
                const isPaid = s === 'Paid' || s === 'Approved' || s === 'Admin'; // Accept various "Done" statuses
                const isHandover = t.customer.toLowerCase().includes('handover');
                if (!isPaid || !isHandover) return false;

                const customerClean = cleanName(t.customer.replace(/handover/i, '').replace(/:/g, ''));
                return customerClean === currentStaffClean || customerClean.includes(currentStaffClean);
            });

            if (myHandovers.length > 0) {
                // Sort descending
                myHandovers.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
                const last = myHandovers[0];
                lastHandoverTime = new Date(`${last.date} ${last.time}`).getTime();
            }

            // 3. Calculate Cash In Hand (Since Last Handover)
            const cashCollected = myTxns.filter(t => {
                // Check if it's a valid cash transaction
                if (t.mode !== 'Cash' || t.status !== 'Paid' || t.customer.toLowerCase().includes('handover')) return false;

                const tTime = new Date(`${t.date} ${t.time}`).getTime();
                return tTime > lastHandoverTime;
            }).reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

            // 4. Calculate Cash Expenses (Since Last Handover)
            const cashExpenses = allExpenses.filter(e => {
                // Check ownership
                const isMyExpense = e.createdBy === staffName || e.party === 'Staff Entry' || e.party === staffName || e.notes?.includes(staffName);
                if (!isMyExpense) return false;

                const isCash = e.method === 'Cash' || !e.method;
                if (!isCash) return false;

                // Time check using ID (timestamp)
                return e.id > lastHandoverTime;
            }).reduce((sum, e) => sum + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);

            const netCashInHand = Math.max(0, cashCollected - cashExpenses);

            // 5. Calculate Consolidated Online Collection (All Time)
            const allTimeOnlineCollected = myTxns.filter(t => t.mode !== 'Cash' && t.status === 'Paid')
                .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

            // 6. Today's Visits (Activity)
            const todaysTxns = myTxns.filter(t => t.date === today && !t.customer.toLowerCase().includes('handover'));

            setStats({
                total: netCashInHand + allTimeOnlineCollected,
                cash: netCashInHand,
                online: allTimeOnlineCollected,
                visits: todaysTxns.length
            });

            // Recent Activity (Show last 5)
            const myCollections = allCollections.filter(t => {
                const txnStaffClean = cleanName(t.staff);
                const isMyTxn = txnStaffClean === currentStaffClean || txnStaffClean.includes(currentStaffClean);

                const customerClean = cleanName(t.customer);
                const isHandoverType = t.customer.toLowerCase().includes('handover');
                const isMyHandover = isHandoverType && customerClean.includes(currentStaffClean);
                return isMyTxn || isMyHandover;
            });

            // Format Expenses for Activity Feed
            const myExpenses = allExpenses
                .filter((e: any) => e.createdBy === staffName || e.party === 'Staff Entry' || e.party === staffName || e.notes?.includes(staffName))
                .map((e: any) => ({
                    id: `EXP-${e.id}`,
                    customer: e.party,
                    amount: String(e.amount),
                    date: e.date,
                    time: new Date(e.id).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    status: 'Paid' as any, // Cast to satisfy type, display logic handles isExpense
                    mode: e.method || 'Cash',
                    type: 'Expense',
                    isExpense: true,
                    category: e.category,
                    title: e.title,
                    staff: e.createdBy || staffName,
                    contact: '',
                    remarks: e.notes || ''
                }));

            // Merge and Sort
            const relevantHistory = [...myCollections, ...myExpenses]
                .sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`);
                    const dateB = new Date(`${b.date} ${b.time}`);
                    return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 5);

            console.log("DEBUG: All Collections Count:", allCollections.length);
            console.log("DEBUG: Relevant History Count:", relevantHistory.length);
            console.log("DEBUG: Relevant History:", relevantHistory.map(t => ({ customer: t.customer, date: t.date, time: t.time })));
            setRecentTxns(relevantHistory);
        };

        loadCollections();
        window.addEventListener('transaction-updated', loadCollections);
        window.addEventListener('storage', loadCollections); // Cross-tab sync
        return () => {
            window.removeEventListener('transaction-updated', loadCollections);
            window.removeEventListener('storage', loadCollections);
        };
    }, []);

    const toggleDuty = () => {
        // ... existing toggleDuty logic ...
        const newStatus = !isOnDuty;
        setIsOnDuty(newStatus);
        const statusData = {
            name: "Rahul Varma", // Hardcoded for this demo
            status: newStatus ? "Online" : "Offline",
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('payment_app_staff_status', JSON.stringify(statusData));
        setToast({
            show: true,
            message: newStatus ? "You are now ON DUTY" : "You are now OFF DUTY",
            type: newStatus ? 'success' : 'error'
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN').format(val);

    return (
        <div className="pb-24 pt-8 min-h-screen relative overflow-hidden bg-transparent">
            {/* ... toast & background ... */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl"
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle size={20} className="text-emerald-500 fill-emerald-500/10" />
                        ) : (
                            <XCircle size={20} className="text-rose-500 fill-rose-500/10" />
                        )}
                        <span className="font-bold text-sm text-slate-800 dark:text-white">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient Background Glows - Only in Dark Mode */}
            <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="hidden dark:block absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="px-6 pt-6 pb-2 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer" onClick={() => router.push('/staff/company-profile')}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-blue-600 dark:to-cyan-500 p-[1px] shadow-md border border-slate-100 dark:border-none">
                                <div className="w-full h-full rounded-2xl bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-cyan-500/10"></div>
                                        <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
                                            AT
                                        </span>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="/staff/profile">
                        <div className="group cursor-pointer">
                            <p className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Welcome Back</p>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {(() => {
                                    // Quick fix to show correct name in header too
                                    if (typeof window !== 'undefined') {
                                        const storedUser = localStorage.getItem('payment_app_user');
                                        if (storedUser) {
                                            try { return JSON.parse(storedUser).name || "Rahul Varma" } catch (e) { }
                                        }
                                    }
                                    return "Rahul Varma";
                                })()}
                                <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </h1>
                        </div>
                    </Link>
                </div>

                <button
                    onClick={() => setShowNotifications(true)}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 flex items-center justify-center relative active:scale-95 transition-all shadow-sm"
                >
                    <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                    {myNotifications.some(n => !n.read) && (
                        <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#1a1a1a]"></span>
                    )}
                </button>
            </header>

            {/* Notification Modal */}
            <AnimatePresence>
                {showNotifications && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNotifications(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 bottom-0 right-0 w-full max-w-sm bg-[#0f172a] z-[120] border-l border-white/10 flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]/80 backdrop-blur-xl">
                                <h2 className="text-xl font-bold text-white">Notifications</h2>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {/* Clear All Button */}
                            {myNotifications.length > 0 && (
                                <div className="px-4 py-2 border-b border-white/10">
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('staff_notifications_list', JSON.stringify([]));
                                            setMyNotifications([]);
                                        }}
                                        className="w-full py-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                        Clear All Notifications
                                    </button>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {myNotifications.length > 0 ? (
                                    myNotifications.map((notif: any) => {
                                        // Handle timestamp (number) or time (string/date)
                                        const notifTime = notif.timestamp || notif.time;
                                        let timeDisplay = "";
                                        try {
                                            const dateObj = new Date(notifTime);
                                            if (!isNaN(dateObj.getTime())) {
                                                timeDisplay = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            } else {
                                                timeDisplay = "Just now";
                                            }
                                        } catch {
                                            timeDisplay = "Just now";
                                        }

                                        return (
                                            <div key={notif.id} className={`p-4 rounded-2xl border border-white/5 ${notif.read ? 'bg-white/5 opacity-60' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-white text-sm">{notif.title || "Notification"}</h3>
                                                    <span className="text-[10px] text-slate-500">{timeDisplay}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                        <Bell size={48} className="opacity-20" />
                                        <p className="text-sm font-medium">No notifications yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Manual Logout (Fallback) */}
                            <div className="p-4 border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-xl">
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.href = '/';
                                    }}
                                    className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
                                >
                                    <Power size={18} />
                                    Logout
                                </button>
                                <p className="text-[10px] text-slate-500 text-center mt-2">
                                    Use this if you are stuck or need to switch accounts.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="px-6 space-y-8 relative z-10 mt-6">

                {/* Hero Card - The Showstopper */}
                <Link href="/staff/history">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full relative rounded-[2rem] overflow-hidden group border border-white/10 bg-[#15171c] shadow-2xl transition-transform active:scale-[0.98]"
                    >
                        {/* Subtle Gradient Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[80px]"></div>

                        <div className="relative z-10 p-5 flex flex-col justify-between min-h-[160px]">
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg group-hover:bg-white/10 transition-colors">
                                    <Wallet className="text-indigo-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-500/20">
                                        <TrendingUp size={10} className="text-emerald-400" />
                                        <span className="text-[10px] font-bold text-emerald-400">+12%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/5">
                                        <span className="text-[10px] font-bold text-slate-300">{stats.visits} Visits</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Cash In Hand</p>
                                    <div className="flex items-end gap-1 mb-2">
                                        <span className="text-2xl font-light text-slate-500 mb-1.5">₹</span>
                                        <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-xl">
                                            {formatCurrency(stats.cash)}
                                        </h2>
                                    </div>

                                    {/* Progress Bar (Moved here to stay under total) */}
                                    <div className="w-32 mt-2">
                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                                            <span>Goal</span>
                                            <span>48%</span>
                                        </div>
                                        <div className="bg-white/5 h-1.5 w-full rounded-full overflow-hidden backdrop-blur-sm">
                                            <div className="h-full bg-indigo-500 w-[48%] shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full relative"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Inner Stats Grid - Vertical Stack on Right */}
                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <div className="bg-black/30 rounded-xl p-2.5 backdrop-blur-md border border-white/5 flex items-center justify-between gap-3 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                                <span className="text-md">📊</span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total</p>
                                                <p className="text-lg font-black text-white leading-none mt-0.5">₹ {formatCurrency(stats.total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 rounded-xl p-2.5 backdrop-blur-md border border-white/5 flex items-center justify-between gap-3 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                                <span className="text-md">📱</span>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Online</p>
                                                <p className="text-lg font-black text-white leading-none mt-0.5">₹ {formatCurrency(stats.online)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Neo-Action Grid */}
                <div className="pt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Quick Actions</p>
                    <div className="grid grid-cols-4 gap-3">
                        <NeoButton
                            icon="📍"
                            label="Route"
                            color="from-amber-400 to-orange-500"
                            delay={0.1}
                            onClick={() => window.open('https://www.google.com/maps', '_blank')}
                        />
                        <NeoButton
                            icon="💸"
                            label="Deposit"
                            color="from-emerald-400 to-teal-500"
                            delay={0.2}
                            onClick={() => router.push('/staff/entry')}
                        />
                        <NeoButton
                            icon="🚀"
                            label="Rank"
                            color="from-rose-400 to-pink-500"
                            delay={0.3}
                            onClick={() => router.push('/staff/rank')}
                        />
                        <NeoButton
                            icon="⚡"
                            label="More"
                            color="from-blue-400 to-cyan-500"
                            delay={0.4}
                            onClick={() => router.push('/staff/settings')}
                        />
                    </div>
                </div>

                {/* Live Feed - Floating Glass Style */}
                <div>
                    <div className="flex justify-between items-end mb-5 px-1">
                        <h3 className="text-lg font-bold text-white tracking-tight">Recent Activity</h3>
                        <Link href="/staff/history" className="text-xs font-bold text-indigo-400 flex items-center gap-1">View All <ChevronRight size={12} /></Link>
                    </div>

                    <div className="space-y-3">
                        {recentTxns.length > 0 ? recentTxns.map((txn, idx) => {
                            const isHandover = txn.customer.toLowerCase().startsWith('handover:');
                            const isExpense = (txn as any).isExpense || txn.amount.startsWith('-'); // Check isExpense flag or negative amount
                            const isDebit = isHandover || isExpense;

                            const displayName = isHandover ? "Handover to Admin" : txn.customer;
                            // Format amount: If Debit, ensure minus sign.
                            const amountVal = parseFloat(String(txn.amount).replace(/,/g, ''));
                            // If isDebit and positive, make negative for display. If already negative, keep it.
                            const finalDisplayAmount = isDebit ? ` - ₹ ${formatCurrency(Math.abs(amountVal))}` : `₹ ${formatCurrency(amountVal)}`;

                            return (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={txn.id || idx}
                                    onClick={() => setSelectedTxn(txn)}
                                    className="flex items-center justify-between p-4 bg-[#111] rounded-3xl border border-white/5 relative overflow-hidden group hover:bg-[#161616] transition-colors active:scale-95 transition-transform cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-inner group-hover:scale-105 transition-transform ${isDebit ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-[#1a1a1a] text-slate-300 border-white/5'}`}>
                                            {isHandover ? <ShieldCheck size={20} /> : (isExpense ? <Banknote size={20} /> : txn.customer.substring(0, 2).toUpperCase())}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm transition-colors ${isDebit ? 'text-rose-400' : 'text-white group-hover:text-indigo-400'}`}>{displayName}</p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Today, {txn.time || 'Now'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className={`font-bold text-base ${isDebit ? 'text-rose-400' : 'text-white'}`}>{finalDisplayAmount}</p>
                                        <p className={`text-[10px] font-bold flex justify-end items-center gap-1 ${isExpense ? 'text-rose-500' : txn.status === 'Paid' ? 'text-emerald-500' : txn.status === 'Visit' ? 'text-blue-500' : 'text-amber-500'}`}>
                                            <Zap size={10} fill="currentColor" /> {isExpense ? 'Expense' : txn.status}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="text-center py-8 opacity-50 text-sm text-slate-500">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction Details Modal */}
                <AnimatePresence>
                    {selectedTxn && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTxn(null)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 bg-[#0f172a] rounded-t-[2.5rem] p-6 z-[120] border-t border-white/10"
                            >
                                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                                        <span className="text-3xl font-bold text-indigo-400">₹</span>
                                    </div>
                                    <h2 className="text-4xl font-bold text-white mb-2">₹ {formatCurrency(parseFloat(selectedTxn.amount))}</h2>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedTxn.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {selectedTxn.status}
                                    </div>
                                </div>

                                <div className="space-y-4 bg-white/5 rounded-3xl p-5 border border-white/5 mb-6">
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <span className="text-slate-400 text-sm font-medium">Customer</span>
                                        <span className="text-white font-bold">{selectedTxn.customer}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <span className="text-slate-400 text-sm font-medium">Date & Time</span>
                                        <span className="text-white font-bold">{selectedTxn.date}, {selectedTxn.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm font-medium">Payment Mode</span>
                                        <span className="text-white font-bold">{selectedTxn.mode}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedTxn(null)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold active:scale-95 transition-transform"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => router.push('/staff/history')}
                                        className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                                    >
                                        View History
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

// ... NeoButton component ...


function NeoButton({ icon, label, color, delay, onClick }: any) {
    return (
        <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay }}
            onClick={onClick}
            className="flex flex-col items-center gap-2 group"
        >
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${color} p-[1px] shadow-lg transition-transform active:scale-95 group-hover:-translate-y-1`}>
                <div className="w-full h-full rounded-[1.5rem] bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden group-hover:bg-opacity-90 transition-all">
                    <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{icon}</span>
                </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
        </motion.button>
    )
}
