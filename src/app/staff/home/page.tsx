"use client";

import { Wallet, TrendingUp, Bell, MapPin, Power, ChevronRight, Zap, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function StaffHome() {
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [company, setCompany] = useState({
        companyName: "Aarya Technologies",
        logo: ""
    });
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const router = useRouter();

    // Load initial status
    useEffect(() => {
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
    }, []);

    const toggleDuty = () => {
        const newStatus = !isOnDuty;
        setIsOnDuty(newStatus);

        // Save to LocalStorage for Admin Visibility
        const statusData = {
            name: "Rahul Varma", // Hardcoded for this demo
            status: newStatus ? "Online" : "Offline",
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('payment_app_staff_status', JSON.stringify(statusData));

        // Show Custom Toast
        setToast({
            show: true,
            message: newStatus ? "You are now ON DUTY" : "You are now OFF DUTY",
            type: newStatus ? 'success' : 'error'
        });

        // Hide after 2 seconds
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2000);
    };

    return (
        <div className="pb-24 min-h-screen relative overflow-hidden bg-transparent">

            {/* Custom Toast Notification */}
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
                                    {company.logo ? (
                                        <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-cyan-500/10"></div>
                                            <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
                                                {company.companyName === "Aarya Technologies" ? "AT" : company.companyName.substring(0, 2).toUpperCase()}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>

                    <Link href="/staff/profile">
                        <div className="group cursor-pointer">
                            <p className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Welcome Back</p>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Rahul Varma
                                <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </h1>
                        </div>
                    </Link>
                </div>

                <button
                    onClick={toggleDuty}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl relative overflow-hidden group active:scale-95 ${isOnDuty ? 'bg-indigo-600 shadow-indigo-500/40 text-white' : 'bg-white dark:bg-[#1a1a1a] text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-none'}`}
                >
                    <Power size={20} strokeWidth={3} className="relative z-10" />
                    {isOnDuty && <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-fuchsia-600 opacity-100 group-hover:scale-110 transition-transform"></div>}
                </button>
            </header>

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
                                        <span className="text-[10px] font-bold text-slate-300">8 Visits</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total Collection</p>
                                <div className="flex items-end gap-1 mb-4">
                                    <span className="text-2xl font-light text-slate-500 mb-1">₹</span>
                                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tighter drop-shadow-lg">24,500</h2>
                                </div>

                                {/* Inner Stats Grid - Compact */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm border border-white/5 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                            <span className="text-xs">💵</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-medium uppercase">Cash</p>
                                            <p className="text-xs font-bold text-slate-200">₹ 14,200</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-2 backdrop-blur-sm border border-white/5 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                            <span className="text-xs">📱</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-medium uppercase">Online</p>
                                            <p className="text-xs font-bold text-slate-200">₹ 10,300</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1 px-1">
                                        <span>Daily Goal</span>
                                        <span>48%</span>
                                    </div>
                                    <div className="bg-white/5 h-1 w-full rounded-full overflow-hidden backdrop-blur-sm">
                                        <div className="h-full bg-indigo-500 w-[48%] shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full relative">
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
                            onClick={() => alert("Leaderboard Feature Coming Soon!")}
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
                        {[1, 2, 3].map((i, idx) => (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={i}
                                className="flex items-center justify-between p-4 bg-[#111] rounded-3xl border border-white/5 relative overflow-hidden group hover:bg-[#161616] transition-colors active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center font-bold text-slate-300 text-sm border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                        ST
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">Shiv Shakti Traders</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Today, 10:45 AM</p>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <p className="font-bold text-white text-base">₹ 5,000</p>
                                    <p className="text-[10px] text-emerald-500 font-bold flex justify-end items-center gap-1"><Zap size={10} fill="currentColor" /> Received</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

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
