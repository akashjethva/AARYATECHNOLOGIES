"use client";

import { Home, Plus, History, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { db, setupFirebaseSync } from '@/services/db';
import { getFirestore, doc, onSnapshot } from "firebase/firestore"; // Import Firestore directly for status check

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isActive = (path: string) => pathname === path;

    // Auth Check & Sync
    useEffect(() => {
        // Initialize Sync
        setupFirebaseSync();

        const session = localStorage.getItem('payment_app_session');
        if (session !== 'staff') {
            router.push('/');
        }
        // Start Sync (already called above)

        // Heartbeat for Online Status
        const userStr = localStorage.getItem('payment_app_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    // Initial update
                    db.updateStaffLastSeen(user.id);

                    // Periodic update every 30 seconds
                    const interval = setInterval(() => {
                        db.updateStaffLastSeen(user.id);
                    }, 30000);

                    return () => clearInterval(interval);
                }
            } catch (e) {
                console.error("Error parsing staff user for heartbeat", e);
            }
        }
    }, []);

    // Session Validation (Force Logout if Deleted/Inactive)
    useEffect(() => {
        const validateSession = () => {
            const userStr = localStorage.getItem('payment_app_user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const staffList = db.getStaff();

                    // Check if user still exists and is active
                    // We check if ID matches AND status is Active.
                    // If staff list is empty (initial load), skip check to avoid false logout before sync
                    if (staffList.length > 0) {
                        const isValid = staffList.find(s => s.id === user.id && s.status === 'Active');

                        if (!isValid) {
                            console.warn("User no longer valid or deleted. Forcing logout.");
                            localStorage.removeItem('payment_app_session');
                            localStorage.removeItem('payment_app_user');
                            router.push('/');
                        }
                    }
                } catch (e) {
                    // JSON error or other issue -> Invalid session
                    localStorage.removeItem('payment_app_session');
                    router.push('/');
                }
            }
        };

        // Run validation on mount and whenever staff data updates
        validateSession();
        window.addEventListener('staff-updated', validateSession);

        return () => {
            window.removeEventListener('staff-updated', validateSession);
        };
    }, []);

    // Idle Timer (Force Logout)
    useEffect(() => {
        const security = db.getAdminSecurity();
        if (!security.forceLogout) return;

        let timeout: NodeJS.Timeout;
        const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 Hour

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Logout Action
                localStorage.removeItem('payment_app_session');
                localStorage.removeItem('payment_app_user');
                router.push('/');
                // Optionally alert
                // alert("Logged out due to inactivity");
            }, TIMEOUT_DURATION);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer(); // Start initial timer

        return () => {
            clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, []);

    // Theme Initialization - Default to Dark Mode for Premium Feel
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        // Default to 'dark' if no preference is set, or if explicitly set to 'dark'
        // This matches the hardcoded dark styles of other tabs (History, etc.)
        const shouldBeDark = theme === 'dark' || !theme;

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Notification Listener
    const [notifToast, setNotifToast] = useState('');
    useEffect(() => {
        const checkNotifs = () => {
            const list = db.getStaffNotifications();
            if (list && list.length > 0) {
                const latest = list[0];
                // Check if new (within last 5 seconds) to avoid spam on reload
                if (Date.now() - latest.timestamp < 5000) {
                    setNotifToast(latest.message);
                    setTimeout(() => setNotifToast(''), 5000);
                    // Can play sound here
                }
            }
        };

        window.addEventListener('staff-notif-updated', checkNotifs);
        window.addEventListener('storage', (e) => {
            if (e.key === 'staff_notifications_list') checkNotifs();
        });

        return () => {
            window.removeEventListener('staff-notif-updated', checkNotifs);
            window.removeEventListener('storage', checkNotifs); // storage event handler ref mismatch fixed by inline or careful ref
        };
    }, []);


    // Biometric Lock Logic
    const [isLocked, setIsLocked] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);


    useEffect(() => {
        // Check if Lock is Enabled
        const storedSettings = localStorage.getItem('staff_settings');
        if (storedSettings) {
            try {
                const settings = JSON.parse(storedSettings);
                if (settings.biometric) {
                    setIsLocked(true);
                    setIsBiometricSupported(!!window.PublicKeyCredential);
                }
            } catch (e) { }
        }
    }, []);

    const handleUnlock = () => {
        const unlock = () => {
            setIsLocked(false);
            // Optional: Play unlock sound
        };

        if (window.PublicKeyCredential) {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: "Payment App" },
                    user: {
                        id: new Uint8Array(16),
                        name: "User",
                        displayName: "User"
                    },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                    timeout: 60000,
                    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }
                }
            }).then(unlock).catch((e) => {
                console.error(e);
                // If cancelled, stay locked.
                // If not supported error despite check, fallback to simulated tap? 
                // No, let's keep it strict if they have hardware, but allow a "Simulated" text fallback if it fails repeatedly?
                // For now, if error name is 'NotAllowed', do nothing.
                // If other error, maybe force unlock to prevent permanent lockout on buggy devices?
                // Let's rely on the button being clickable again.
            });
        } else {
            // Simulated Unlock for HTTP
            unlock();
        }
    };

    if (isLocked) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mb-8 animate-pulse">
                    <span className="text-4xl">🔒</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">App Locked</h1>
                <p className="text-slate-400 text-sm mb-10 text-center">
                    {window.PublicKeyCredential ? "Scan fingerprint to unlock" : "Tap button to unlock (Simulated Mode)"}
                </p>

                <button
                    onClick={handleUnlock}
                    className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-transform"
                >
                    {window.PublicKeyCredential ? "Scan Fingerprint" : "Unlock App"}
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#0f1115] font-sans transition-colors duration-300 flex flex-col">
            {/* Main Content Area */}
            <OnlineStatus />
            <main className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-[#0f1115] text-slate-900 dark:text-white relative pb-28 transition-colors duration-300">
                {children}
            </main>

            {/* Premium Floating Navigation */}
            <div className="fixed bottom-6 left-6 right-6 z-50">
                <nav className="h-16 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl flex justify-between items-center px-2 shadow-2xl transition-colors duration-300">
                    <NavItem href="/staff/home" icon={<Home size={22} />} active={isActive('/staff/home')} />
                    <NavItem href="/staff/customers" icon={<User size={22} />} active={isActive('/staff/customers')} />

                    {/* Floating Action Button */}
                    <Link href="/staff/entry">
                        <div className="relative -top-8 mx-2 group">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 border-4 border-white dark:border-[#0f1115] transform group-active:scale-95 transition-all">
                                <Plus size={32} strokeWidth={3} />
                            </div>
                        </div>
                    </Link>

                    <NavItem href="/staff/history" icon={<History size={22} />} active={isActive('/staff/history')} />
                    <NavItem href="/staff/settings" icon={<Settings size={22} />} active={isActive('/staff/settings')} />
                </nav>
                <AnimatePresence>
                    {notifToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -50, x: '-50%' }}
                            className="fixed top-6 left-1/2 z-[100] w-[90%] max-w-sm bg-[#1e293b] border border-white/10 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
                        >
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                <span className="text-xl">🔔</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm">New Notification</p>
                                <p className="text-xs text-slate-300">{notifToast}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function NavItem({ href, icon, active }: any) {
    return (
        <Link href={href} className="relative w-12 h-12 flex items-center justify-center">
            {active && (
                <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-slate-100 dark:bg-white/10 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className={`relative z-10 transition-colors duration-300 ${active ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`}>
                {icon}
            </span>
        </Link>
    )
}

// Helper Component for Online Status
function OnlineStatus() {
    const [status, setStatus] = useState<'online' | 'offline'>('online'); // optimistic

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Browser Network Check
        const updateOnlineStatus = () => {
            setStatus(navigator.onLine ? 'online' : 'offline');
        };
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // 2. Firestore Connection Check (More accurate for data sync)
        /*
        try {
            const firestore = getFirestore();
            const connectedRef = doc(firestore, ".info/connected");
            const unsubscribe = onSnapshot(connectedRef, (snap) => {
                const isConnected = snap.data()?.connected;
                if (isConnected === false) {
                     // Only override if browser is online but firestore is not
                     if (navigator.onLine) setStatus('offline');
                } else {
                     setStatus('online');
                }
            });
            return () => {
                window.removeEventListener('online', updateOnlineStatus);
                window.removeEventListener('offline', updateOnlineStatus);
                unsubscribe();
            }
        } catch(e) { console.error(e); }
        */

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    if (status === 'online') return null; // Don't show if everything is good

    return (
        <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white text-xs font-bold text-center py-1 z-[1000] shadow-md animate-pulse">
            You are OFFLINE. Data will sync when connection returns.
        </div>
    );
}
