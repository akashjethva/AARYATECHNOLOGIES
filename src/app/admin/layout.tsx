"use client";

import { LayoutDashboard, Users, Wallet, FileText, Settings, LogOut, Menu, Bell, Search, Command, User, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect, memo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db, setupFirebaseSync } from "@/services/db";
import { useCurrency } from "@/hooks/useCurrency";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter(); // Initialize router
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState({ name: 'Jayesh Bhai', role: 'Administrator', avatar: '' });

    useEffect(() => {
        const loadProfile = () => setAdminProfile(db.getAdminProfile());
        loadProfile();
        window.addEventListener('admin-profile-updated', loadProfile);
        return () => window.removeEventListener('admin-profile-updated', loadProfile);
    }, []);

    // NEW Notification Listener
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = () => {
        const list = db.getNotifications();
        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.read).length);
    };

    const markAllAsRead = () => {
        db.markNotificationsRead();
        loadNotifications();
    };

    useEffect(() => {
        loadNotifications();
        window.addEventListener('alerts-updated', loadNotifications);
        window.addEventListener('storage', (e) => {
            if (e.key === 'admin_alerts_v1') loadNotifications();
        });
        return () => {
            window.removeEventListener('alerts-updated', loadNotifications);
        };
    }, []);



    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [totalBalance, setTotalBalance] = useState(0);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const { formatCurrency } = useCurrency();

    const calculateBalance = () => {
        // Guard for server-side
        if (typeof window === 'undefined') return 0;

        const collections = db.getCollections();
        const expenses = db.getExpenses();

        if (!collections || !Array.isArray(collections)) return 0;

        // Sync with Dashboard: Exclude HANDOVER transactions
        const totalCollections = collections
            .filter((t: any) => t && t.status === 'Paid' && !String(t.customer).startsWith('HANDOVER:'))
            .reduce((sum: number, t: any) => {
                const amount = parseFloat(String(t.amount).replace(/,/g, ''));
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

        // Sync with Dashboard: Deduct ALL expenses
        const totalExpenses = (expenses || [])
            .reduce((sum: number, e: any) => {
                const amount = parseFloat(String(e.amount).replace(/,/g, ''));
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

        return totalCollections - totalExpenses;
    };

    // Click Outside Handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Start Firebase Sync
        setupFirebaseSync();

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Initial Calculation
        setTotalBalance(calculateBalance());

        // Listen for internal updates (from Dashboard)
        const handleInternalUpdate = () => setTotalBalance(calculateBalance());
        window.addEventListener('transaction-updated', handleInternalUpdate);

        // Listen for cross-tab updates
        const handleStorageUpdate = (e: StorageEvent) => {
            if (e.key === 'transactions') {
                setTotalBalance(calculateBalance());
            }
        };
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener('transaction-updated', handleInternalUpdate);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth < 768) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNotificationClick = (path: string) => {
        setIsNotificationsOpen(false);
        router.push(path);
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans overflow-hidden p-0 md:p-4 gap-4 selection:bg-indigo-500 selection:text-white relative">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sci-Fi Inspired Floating Sidebar */}
            <aside
                className={`
                    fixed md:relative z-50 h-full md:h-auto
                    bg-[#1e293b]/95 backdrop-blur-xl border-r md:border border-white/5 
                    md:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ease-out
                    ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
                    ${!isMobile && isSidebarOpen ? 'w-72' : 'w-24'}
                    ${isMobile ? 'w-[280px]' : ''}
                `}
            >
                {/* Decorative Gradients - Optimized */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]"></div>

                <div className="p-8 pb-4 relative z-10">
                    <div className="p-6 flex flex-col items-center justify-center text-center gap-1 border-b border-white/5 min-h-[100px]">
                        {(isSidebarOpen || isMobile) ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h1 className="text-4xl font-extrabold text-slate-300 tracking-widest leading-none drop-shadow-lg">
                                    AARYA
                                </h1>
                                <p className="text-sm font-bold text-slate-500 tracking-[0.3em] uppercase mt-2">Technologies</p>
                                <p className="text-[10px] bg-rose-500/10 text-rose-500 font-bold px-2 py-0.5 rounded-full inline-block mt-4 border border-rose-500/20">v2.6 (Force Update)</p>
                            </motion.div>
                        ) : (
                            <h1 className="text-2xl font-extrabold text-slate-400">AT</h1>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto relative z-10 scrollbar-hide">
                    <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/dashboard'} delay={0.1} onClick={() => isMobile && setIsSidebarOpen(false)} />
                    <NavItem href="/admin/collections" icon={<Wallet size={20} />} label="Collections" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/collections'} delay={0.2} onClick={() => isMobile && setIsSidebarOpen(false)} />
                    <NavItem href="/admin/staff" icon={<Users size={20} />} label="Agent Management" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/staff'} delay={0.3} onClick={() => isMobile && setIsSidebarOpen(false)} />
                    <NavItem href="/admin/customers" icon={<User size={20} />} label="Customers" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/customers'} delay={0.35} onClick={() => isMobile && setIsSidebarOpen(false)} />
                    <NavItem href="/admin/expenses" icon={<TrendingDown size={20} />} label="Expenses" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/expenses'} delay={0.38} onClick={() => isMobile && setIsSidebarOpen(false)} />

                    <NavItem href="/admin/reports" icon={<FileText size={20} />} label="Reports" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/reports'} delay={0.4} onClick={() => isMobile && setIsSidebarOpen(false)} />
                    <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" isOpen={isSidebarOpen || isMobile} isActive={pathname === '/admin/settings'} delay={0.5} onClick={() => isMobile && setIsSidebarOpen(false)} />

                    <div className="pt-4 border-t border-white/5 mt-4">
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to logout?")) {
                                    localStorage.removeItem('payment_app_session');
                                    router.push('/');
                                }
                            }}
                            className={`flex items-center w-full px-4 py-4 rounded-2xl transition-all duration-200 relative group overflow-hidden text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer`}
                        >
                            <span className={`relative z-10 transition-transform group-hover:scale-110 duration-200`}><LogOut size={20} /></span>
                            {(isSidebarOpen || isMobile) && <span className="ml-4 text-lg font-bold relative z-10 tracking-wide">Logout</span>}
                        </button>
                    </div>
                </nav>

                <div className="p-6 relative z-10">
                    <Link href="/admin/collections" className="block w-full">
                        {(isSidebarOpen || isMobile) ? (
                            <div className="bg-gradient-to-br from-indigo-600/90 to-blue-700/90 p-5 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform active:scale-95">
                                <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                                    <Wallet size={40} />
                                </div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">Total Balance</p>
                                <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
                                <div className="mt-3 text-xs bg-white/20 inline-block px-2 py-1 rounded w-fit backdrop-blur-sm">+12% this week</div>
                                <div className="mt-2 text-[10px] text-blue-200 font-mono opacity-80">v2.6 • Connected ✅</div>
                            </div>
                        ) : (
                            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 cursor-pointer hover:bg-indigo-500 transition-colors">
                                <Wallet size={20} />
                            </div>
                        )}
                    </Link>
                </div>
            </aside>

            {/* Main Content Area - Glass Overlay */}
            <main className="flex-1 bg-[#0f172a] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/5 z-0">
                {/* Background Effects - Optimized */}
                <div className="absolute top-0 left-0 w-full h-96 bg-indigo-600/5 blur-[60px] -z-10"></div>
                <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-600/5 blur-[60px] -z-10"></div>

                {/* Top Header */}
                <header className="h-24 px-8 flex items-center justify-between z-[100] relative">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight capitalize">
                                {pathname.split('/').pop() === 'staff' ? 'Agent Management' : pathname.split('/').pop()}
                            </h2>
                            <p className="text-slate-400 text-sm font-medium hidden sm:block">Welcome back, {adminProfile.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">


                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-3 rounded-2xl transition-colors group ${isNotificationsOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-[#0f172a]"></span>}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                            <h3 className="font-bold text-white">Notifications</h3>
                                            {unreadCount > 0 && <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-lg font-bold">{unreadCount} New</span>}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n.path)}
                                                        className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3"
                                                    >
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${n.type === 'payment' ? 'bg-emerald-500/10' : n.type === 'achievement' ? 'bg-blue-500/10' : 'bg-slate-500/10'} shrink-0 opacity-${n.read ? '50' : '100'}`}>
                                                            {n.type === 'payment' ? <Wallet size={14} className="text-emerald-400" /> : n.type === 'achievement' ? <TrendingUp size={14} className="text-blue-400" /> : <Settings size={14} className="text-slate-400" />}
                                                        </div>
                                                        <div className={n.read ? 'opacity-60' : ''}>
                                                            <p className={`text-sm leading-tight ${n.read ? 'font-medium text-slate-400' : 'font-bold text-white'}`}>{n.title}</p>
                                                            <p className="text-xs text-slate-400 mt-1">{n.desc}</p>
                                                            <p className="text-[10px] text-slate-500 mt-2 font-medium">{n.time}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-slate-500">
                                                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                                    <p className="text-xs font-bold">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-3 border-t border-white/5 flex items-center justify-between gap-2">
                                                {unreadCount > 0 ? (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex-1 py-1"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                ) : <span className="flex-1"></span>}

                                                <div className="w-px h-3 bg-white/10"></div>

                                                <button
                                                    onClick={() => db.clearNotifications()}
                                                    className="text-xs font-bold text-rose-500 hover:text-rose-400 flex-1 py-1"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] cursor-pointer shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                <div className="h-full w-full bg-[#0f172a] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="h-full w-full rounded-[14px]" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-56 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-white/5">
                                            <p className="font-bold text-white">{adminProfile.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{adminProfile.role}</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <button
                                                onClick={() => { setIsProfileOpen(false); router.push('/admin/settings'); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <User size={16} /> My Profile
                                            </button>
                                            <button
                                                onClick={() => { setIsProfileOpen(false); router.push('/admin/settings'); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                <Settings size={16} /> Settings
                                            </button>
                                            <div className="h-px bg-white/5 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to logout?")) {
                                                        localStorage.removeItem('payment_app_session');
                                                        router.push('/');
                                                    }
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 scrollbar-thin scrollbar-thumb-indigo-900/50 hover:scrollbar-thumb-indigo-700/50 pb-32 md:pb-0">
                    {children}
                </div>

                {/* Mobile Bottom Navigation (Admin App Feel) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/10 p-2 z-50 pb-8 safe-area-bottom">
                    <nav className="flex justify-around items-center">
                        <Link href="/admin/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/admin/dashboard' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}>
                            <LayoutDashboard size={24} strokeWidth={pathname === '/admin/dashboard' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Home</span>
                        </Link>
                        <Link href="/admin/collections" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/admin/collections' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}>
                            <Wallet size={24} strokeWidth={pathname === '/admin/collections' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Pay</span>
                        </Link>
                        <div className="mb-8">
                            <Link href="/admin/expenses" className="h-14 w-14 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border-4 border-[#0f172a]">
                                <TrendingDown size={24} />
                            </Link>
                        </div>
                        <Link href="/admin/staff" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/admin/staff' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}>
                            <Users size={24} strokeWidth={pathname === '/admin/staff' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Agents</span>
                        </Link>
                        <Link href="/admin/settings" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/admin/settings' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`}>
                            <Settings size={24} strokeWidth={pathname === '/admin/settings' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Set'gs</span>
                        </Link>
                    </nav>
                </div>

            </main>

            <ConnectionStatus />
        </div>
    );
}

function ConnectionStatus() {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

    useEffect(() => {
        // Simple heuristic to check connection
        if (typeof window === 'undefined') return;

        // Wait a bit for initial connect
        const timer = setTimeout(() => {
            if (navigator.onLine) {
                setStatus('connected');
            } else {
                setStatus('error');
            }
        }, 2000);

        const handleOnline = () => setStatus('connected');
        const handleOffline = () => setStatus('error');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (status === 'connected') return null; // Hide if all good to keep UI clean

    return (
        <div className={`fixed bottom-4 right-4 z-[100] px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 border ${status === 'error' ? 'bg-rose-500 text-white border-rose-600' : 'bg-amber-500 text-white border-amber-600'}`}>
            <div className={`w-2 h-2 rounded-full ${status === 'error' ? 'bg-white blink' : 'bg-white animate-pulse'}`}></div>
            {status === 'error' ? 'Offline / Sync Error' : 'Connecting to Server...'}
        </div>
    );
}

const NavItem = memo(({ icon, label, isOpen, href, isActive, onClick }: any) => {
    return (
        <Link href={href} className="block w-full" onClick={onClick}>
            <div
                className={`flex items-center w-full px-4 py-4 rounded-2xl transition-all duration-200 relative group overflow-hidden ${isActive ? 'bg-white text-indigo-950 font-bold shadow-lg shadow-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"></div>}

                <span className={`relative z-10 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-indigo-600' : ''}`}>{icon}</span>
                {isOpen && <span className="ml-4 text-lg font-bold relative z-10 tracking-wide">{label}</span>}

                {!isActive && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>}
            </div>
        </Link>
    )
});
