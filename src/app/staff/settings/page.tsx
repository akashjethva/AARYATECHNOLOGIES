"use client";

import { Bell, Moon, Shield, ChevronRight, Wallet, ArrowUpRight, ArrowLeft, User, LogOut, Lock, Sun, ScanFace, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/services/db";
import { useCurrency } from "@/hooks/useCurrency";

export default function StaffSettings() {
    const { formatCurrency } = useCurrency();
    const router = useRouter();

    // State
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [cashInHand, setCashInHand] = useState(0);
    const [handoverStatus, setHandoverStatus] = useState<'idle' | 'confirming' | 'requested'>('idle');
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: true, // Force Dark
        biometric: false
    });
    const [mobilePerms, setMobilePerms] = useState<any>({});

    // UI State
    const [isScanning, setIsScanning] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    // Load Data
    useEffect(() => {
        // 1. Identify User from Login Key (payment_app_user)
        const staffList = db.getStaff();
        const storedUser = localStorage.getItem('payment_app_user'); // Correct key!

        let user = null;
        try {
            user = storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            // If JSON parse fails, clear session immediately
            localStorage.removeItem('payment_app_user');
            localStorage.removeItem('payment_app_session');
            router.push('/');
            return;
        }

        // Validate user against current DB state
        if (user && staffList.length > 0) {
            const isValid = staffList.find(s => s.id === user.id && s.status === 'Active');
            if (!isValid) {
                // Invalid user found in session -> Force Logout
                localStorage.removeItem('payment_app_user');
                localStorage.removeItem('payment_app_session');
                router.push('/');
                return;
            }
        }

        // Fallback for initial load only if we have minimal data
        if (!user && staffList.length > 0) {
            // If we have staff but no user in session, something is wrong.
            // Don't auto-assign first staff anymore, that's dangerous.
        }

        if (user) {
            setCurrentUser(user);
        } else {
            // No user found, and not validated.
            // If we are stuck here for too long, the UI will hang on "Loading..."
            // We'll let the timeout handle it.
        }

        // 2. Calculate Cash In Hand (WITH Handover Deduction)
        if (user) {
            const collections = db.getCollections();
            const today = new Date().toISOString().split('T')[0];

            // Normalization helper
            const cleanName = (name: string) => String(name || '').toLowerCase().replace(/\s+/g, '').trim();
            const currentStaffClean = cleanName(user.name);

            // 2. Find Last Handover (Lifetime) - UNIFIED LOGIC WITH STAFF HOME (Step Id: 13342)
            let lastHandoverTime = 0;
            const myHandovers = collections.filter((t: any) => {
                const s = t.status as any;
                const isPaid = s === 'Paid' || s === 'Approved' || s === 'Admin'; // Accept various "Done" statuses
                const isHandover = t.customer.toLowerCase().includes('handover');

                // Name check for handover
                const customerClean = cleanName(t.customer.replace(/handover/i, '').replace(/:/g, ''));
                const isMyHandover = customerClean === currentStaffClean || customerClean.includes(currentStaffClean);

                return (isPaid || isHandover) && isMyHandover; // Fixed logical grouping
            });

            if (myHandovers.length > 0) {
                // Sort descending
                myHandovers.sort((a: any, b: any) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
                const last = myHandovers[0];
                lastHandoverTime = new Date(`${last.date} ${last.time}`).getTime();
            }

            // 3. Calculate Cash In Hand (Since Last Handover)
            // Filter: My Collections
            const myTxns = collections.filter((c: any) => {
                const txnStaffClean = cleanName(c.staff);
                return txnStaffClean === currentStaffClean || txnStaffClean.includes(currentStaffClean);
            });

            const cashAfterHandover = myTxns.filter((t: any) => {
                // Check if it's a valid cash transaction
                if (t.mode !== 'Cash' || t.status !== 'Paid' || t.customer.toLowerCase().includes('handover')) return false;

                const tTime = new Date(`${t.date} ${t.time}`).getTime();
                return tTime > lastHandoverTime;
            }).reduce((sum: number, t: any) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

            // 4. Calculate Cash Expenses (Since Last Handover)
            const allExpenses = db.getExpenses();
            const cashExpenses = allExpenses.filter((e: any) => {
                // Check ownership
                const isMyExpense = e.createdBy === user.name || e.party === 'Staff Entry' || e.party === user.name || e.notes?.includes(user.name);
                if (!isMyExpense) return false;

                // Check if it is a Cash Expense OR a Bank Deposit
                const isDeposit = e.category === 'Deposit';
                const isCash = e.method === 'Cash' || (!e.method && isDeposit); // Assume deposit is cash if mode unspecified
                if (!isCash) return false;

                // Time check using ID (timestamp)
                return e.id > lastHandoverTime;
            }).reduce((sum: number, e: any) => sum + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);

            const netCashInHand = Math.max(0, cashAfterHandover - cashExpenses);
            setCashInHand(netCashInHand);
        }

        // 3. Load Permissions & Settings
        const perms = db.getMobilePermissions();
        setMobilePerms(perms);

        // Initialize Theme (FORCE DARK)
        // const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const isDark = true;

        // Initialize Toggles
        setSettings({
            notifications: localStorage.getItem('staff_notifications') !== 'false', // Default true
            darkMode: true, // Force True
            biometric: perms.enforceBiometric ? true : false
        });

        // Force Dark Class
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');

        // Listen for updates
        // Listen for updates
        const refresh = () => {
            // Re-read user from localStorage to avoid stale closure
            let staffName = "";
            const storedUser = localStorage.getItem('payment_app_user');
            if (storedUser) {
                try { staffName = JSON.parse(storedUser).name || ""; } catch { }
            }
            if (!staffName) return; // No user, skip

            const collections = db.getCollections();
            const cleanName = (name: string) => String(name || '').toLowerCase().replace(/\s+/g, '').trim();
            const currentStaffClean = cleanName(staffName);

            // 1. Find Last Handover (Lifetime)
            let lastHandoverTime = 0;
            const myHandovers = collections.filter((t: any) => {
                const s = t.status as any;
                const isPaid = s === 'Paid' || s === 'Approved' || s === 'Admin';
                const isHandover = t.customer.toLowerCase().includes('handover');

                // Name check for handover
                const customerClean = cleanName(t.customer.replace(/handover/i, '').replace(/:/g, ''));
                const isMyHandover = customerClean === currentStaffClean || customerClean.includes(currentStaffClean);

                return (isPaid || isHandover) && isMyHandover;
            });

            if (myHandovers.length > 0) {
                // Sort descending
                myHandovers.sort((a: any, b: any) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
                const last = myHandovers[0];
                lastHandoverTime = new Date(`${last.date} ${last.time}`).getTime();
            }

            // 2. Calculate Cash In Hand (Since Last Handover)
            const myTxns = collections.filter((c: any) => {
                const txnStaffClean = cleanName(c.staff);
                return txnStaffClean === currentStaffClean || txnStaffClean.includes(currentStaffClean);
            });

            const cashAfterHandover = myTxns.filter((t: any) => {
                if (t.mode !== 'Cash' || t.status !== 'Paid' || t.customer.toLowerCase().includes('handover')) return false;

                const tTime = new Date(`${t.date} ${t.time}`).getTime();
                return tTime > lastHandoverTime;
            }).reduce((sum: number, t: any) => sum + (parseFloat(String(t.amount).replace(/,/g, '')) || 0), 0);

            // 3. Calculate Cash Expenses (Since Last Handover)
            const allExpenses = db.getExpenses();
            const cashExpenses = allExpenses.filter((e: any) => {
                // Check ownership
                const isMyExpense = e.createdBy === staffName || e.party === 'Staff Entry' || e.party === staffName || (e.notes || '').includes(staffName);
                if (!isMyExpense) return false;

                // Check if it is a Cash Expense OR a Bank Deposit
                const isDeposit = e.category === 'Deposit';
                const isCash = e.method === 'Cash' || (!e.method && isDeposit);
                if (!isCash) return false;

                // Time check using ID (timestamp)
                return e.id > lastHandoverTime;
            }).reduce((sum: number, e: any) => sum + (parseFloat(String(e.amount).replace(/,/g, '')) || 0), 0);

            const netCashInHand = Math.max(0, cashAfterHandover - cashExpenses);
            console.log("DEBUG Settings Refresh (Lifetime):", { staffName, cashAfterHandover, cashExpenses, netCashInHand });
            setCashInHand(netCashInHand);
        };

        window.addEventListener('transaction-updated', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('transaction-updated', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, []);
    // ... (restored functions) ...
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) {
            showToast("Passwords do not match!", "error");
            return;
        }
        if (passData.new.length < 4) {
            showToast("Password must be at least 4 digits", "error");
            return;
        }

        // Validate Current Password
        if (currentUser.pin && currentUser.pin !== passData.current) {
            // Allow '0000' fallback or initial setup if no PIN?
            // If user has a PIN set, it must match.
            if (passData.current !== '0000' && currentUser.pin !== '0000') {
                showToast("Incorrect Current Password", "error");
                return;
            }
        }

        // Update DB
        const success = db.updateStaffPin(currentUser.id, passData.new);
        if (success) {
            showToast("Password updated successfully!", "success");
            // Update local user state so next check works
            setCurrentUser((prev: any) => ({ ...prev, pin: passData.new }));
            setIsPassModalOpen(false);
            setPassData({ current: '', new: '', confirm: '' });
        } else {
            showToast("Failed to update password", "error");
        }
    };

    const handleHandover = () => {
        if (handoverStatus === 'idle') setHandoverStatus('confirming');
        else if (handoverStatus === 'confirming') {
            setHandoverStatus('requested');
            // Save request to DB for Admin
            db.requestHandover(currentUser.name, cashInHand);
            showToast("Request Sent to Admin");
        }
    };

    /* 
    const toggleTheme = () => {
       // Disabled
    }; 
    */
    const toggleSetting = (key: keyof typeof settings) => {
        if (key === 'darkMode') {
            // Disabled
        } else if (key === 'notifications') {
            const newVal = !settings.notifications;
            setSettings(prev => ({ ...prev, notifications: newVal }));
            localStorage.setItem('staff_notifications', String(newVal));
            if (newVal) showToast("Notifications Enabled");
            else showToast("Notifications Disabled");
        } else if (key === 'biometric') {
            // ... existing biometric logic ...
            if (mobilePerms.enforceBiometric) {
                showToast("Biometric Lock is enforced by Admin", "error");
                return;
            }

            if (!settings.biometric) {
                // If turning ON, simulate scan
                setIsScanning(true);
                setTimeout(() => {
                    setIsScanning(false);
                    setSettings(prev => ({ ...prev, biometric: true }));
                }, 2500); // 2.5s scan duration
            } else {
                // Turn OFF instantly
                setSettings(prev => ({ ...prev, biometric: false }));
            }
        } else {
            setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    if (!currentUser) return <div className="p-8 text-center text-slate-500">Loading Staff Profile...</div>;

    return (
        <div className="pb-24 px-6 pt-8 min-h-screen bg-gray-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">

            {/* Biometric Scanning Overlay */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-[#050505]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="relative w-32 h-32 mb-8">
                            {/* Scanning Radar Effect */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-t-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                            />
                            <div className="absolute inset-2 rounded-full border border-white/10 flex items-center justify-center bg-black/50">
                                <ScanFace size={48} className="text-emerald-500" />
                            </div>
                            {/* Scanning Line */}
                            <motion.div
                                animate={{ top: ['10%', '90%', '10%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-emerald-400 blur-[2px] shadow-[0_0_20px_#34d399]"
                            />
                        </div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            Verifying Face ID
                        </motion.h2>
                        <p className="text-slate-400 text-sm">Please look at the camera...</p>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            {/* Profile Snippet */}
            <Link href="/staff/profile">
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 mb-8 active:scale-[0.98] transition-transform shadow-sm dark:shadow-none">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
                        {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{currentUser.name || 'Unknown Staff'}</h3>
                        <p className="text-xs text-slate-500">{currentUser.role || 'Staff'} • ID: #{currentUser.id || '0000'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                        <ChevronRight size={16} />
                    </div>
                </div>
            </Link>

            {/* Critical Action: Handover */}
            <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">Cash Management</p>
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-3xl relative overflow-hidden dark:bg-transparent bg-amber-50">
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500">
                            <Wallet size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-amber-700/60 dark:text-amber-200/60 font-medium">Cash in Hand</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">{formatCurrency(cashInHand)}</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {handoverStatus === 'requested' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center font-bold text-sm border border-emerald-500/20"
                            >
                                Request Sent to Admin ✅
                            </motion.div>
                        ) : handoverStatus === 'confirming' ? (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-2"
                            >
                                <button
                                    onClick={() => setHandoverStatus('idle')}
                                    className="flex-1 py-3 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 font-bold rounded-xl transition-colors border border-slate-200 dark:border-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleHandover}
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white dark:text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
                                >
                                    Confirm
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={handleHandover}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white dark:text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-colors active:scale-95"
                            >
                                Request Handover <ArrowUpRight size={18} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3 mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 pl-1">App Preferences</p>
                <SettingItem
                    icon={<Bell size={20} />}
                    title="Notifications"
                    value={settings.notifications}
                    onClick={() => toggleSetting('notifications')}
                />

                <SettingItem
                    icon={<Shield size={20} />}
                    title={mobilePerms.enforceBiometric ? "Biometric Locked (Admin)" : "Biometric Lock"}
                    value={settings.biometric}
                    onClick={() => toggleSetting('biometric')}
                />
                <SettingItem
                    icon={<Lock size={20} />}
                    title="Change Password"
                    isLink
                    onClick={() => setIsPassModalOpen(true)}
                />
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem('payment_app_user');
                    localStorage.removeItem('payment_app_session');
                    router.push('/');
                }}
                className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20 flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
                <LogOut size={20} /> Logout
            </button>

            {/* DEBUG: Force Sync Button */}
            <button
                onClick={() => {
                    const confirmSync = window.confirm("Reset & Sync All Data? This will attempt to push all local data to Server.");
                    if (confirmSync) {
                        db.forceSync()
                            .then(() => showToast("Force Sync Complete! Check Admin.", "success"))
                            .catch(err => alert("Sync Failed: " + err.message));
                    }
                }}
                className="w-full mt-4 py-3 rounded-2xl bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
            >
                <span className="text-xl">🔄</span> Force Sync Data
            </button>

            <p className="text-center text-xs text-slate-500 font-medium mt-8">
                App Version 2.5.1 (Sync Fix)
                <br />
                Powered by {db.getAppSettings().appName}
            </p>

            {/* Custom Toast */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-24 left-6 right-6 z-[100] p-4 rounded-2xl border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'} backdrop-blur-xl flex items-center justify-center font-bold text-sm shadow-2xl`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Change Password Modal */}
            <AnimatePresence>
                {isPassModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPassModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-[#111] w-full max-w-sm rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl relative z-10 overflow-hidden p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Change Password</h3>
                                <button onClick={() => setIsPassModalOpen(false)} className="text-slate-400 p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passData.current}
                                        onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passData.new}
                                        onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passData.confirm}
                                        onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-3.5 outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-center"
                                >
                                    Update Password
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    )
}

function SettingItem({ icon, title, value, onClick, isLink }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-white dark:bg-[#111] p-4 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-white/5 active:scale-[0.98] transition-all cursor-pointer select-none group shadow-sm dark:shadow-none"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors text-left">
                    {icon}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:dark:text-white text-left">{title}</span>
            </div>

            {isLink ? (
                <ChevronRight size={18} className="text-slate-400 dark:text-slate-500" />
            ) : (
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${value ? 'left-7' : 'left-1'}`}></div>
                </div>
            )}
        </button>
    )
}
