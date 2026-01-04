"use client";

import { Bell, Moon, Shield, ChevronRight, Wallet, ArrowUpRight, ArrowLeft, User, LogOut, Lock, Sun, ScanFace, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffSettings() {
    const [handoverStatus, setHandoverStatus] = useState<'idle' | 'confirming' | 'requested'>('idle');
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: true,
        biometric: false
    });
    const [isScanning, setIsScanning] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

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

        showToast("Password updated successfully!", "success");
        setIsPassModalOpen(false);
        setPassData({ current: '', new: '', confirm: '' });
    };

    const router = useRouter();

    useEffect(() => {
        // Initialize Theme from LocalStorage or System
        const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setSettings(prev => ({ ...prev, darkMode: isDark }));
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const handleHandover = () => {
        if (handoverStatus === 'idle') setHandoverStatus('confirming');
        else if (handoverStatus === 'confirming') {
            setHandoverStatus('requested');
        }
    };

    const toggleTheme = () => {
        const newMode = !settings.darkMode;
        setSettings(prev => ({ ...prev, darkMode: newMode }));

        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleSetting = (key: keyof typeof settings) => {
        if (key === 'darkMode') {
            toggleTheme();
        } else if (key === 'biometric') {
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
                        RV
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Rahul Varma</h3>
                        <p className="text-xs text-slate-500">Collection Agent • ID: #8833</p>
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
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">₹ 12,500</p>
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
                    icon={settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                    title={settings.darkMode ? "Dark Mode" : "Light Mode"}
                    value={settings.darkMode}
                    onClick={() => toggleSetting('darkMode')}
                />
                <SettingItem
                    icon={<Shield size={20} />}
                    title="Biometric Lock"
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
                    localStorage.removeItem('payment_app_session');
                    router.push('/');
                }}
                className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20 flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
                <LogOut size={20} /> Logout
            </button>

            <p className="text-center text-xs text-slate-500 font-medium mt-8">
                App Version 2.4.0 (Beta)
                <br />
                Powered by Aarya Technologies
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
        </div>
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
