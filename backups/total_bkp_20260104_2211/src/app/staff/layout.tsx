"use client";

import { Home, Plus, History, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isActive = (path: string) => pathname === path;

    // Auth Check
    useEffect(() => {
        const session = localStorage.getItem('payment_app_session');
        if (session !== 'staff') {
            router.push('/');
        }
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

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#0f1115] font-sans transition-colors duration-300 flex flex-col">
            {/* Main Content Area */}
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
