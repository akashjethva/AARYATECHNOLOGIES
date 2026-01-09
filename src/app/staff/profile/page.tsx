"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Shield, LogOut, QrCode, ArrowLeft, Camera, Upload, MapPin, Calendar, X, Sparkles, ChevronRight, Wallet, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/services/db";

export default function StaffProfile() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [cashInHand, setCashInHand] = useState(0);

    useEffect(() => {
        // Calculate Cash in Hand
        const collections = db.getCollections();
        const staffName = "Rahul Varma"; // TODO: Dynamic

        const totalCollections = collections
            .filter(c => c.staff?.toLowerCase() === staffName.toLowerCase() && c.status === 'Paid')
            .reduce((sum, c) => sum + (parseFloat(c.amount.toString().replace(/,/g, '')) || 0), 0);

        // Assuming Expenses module exists or borrowing from logical concept. 
        // If no expenses are tracked per staff yet, we assume 0 or implement a basic fetch if 'expenses' exist in DB.
        // Based on previous files, 'Expense' interface exists.
        const allExpenses = db.getExpenses ? db.getExpenses() : [];
        const totalExpenses = allExpenses
            .filter((e: any) => e.staff?.toLowerCase() === staffName.toLowerCase()) // Assuming expenses have staff field
            .reduce((sum: number, e: any) => sum + (parseFloat(e.amount.toString().replace(/,/g, '')) || 0), 0);

        setCashInHand(totalCollections - totalExpenses);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleHandover = () => {
        const text = `🤝 *CASH HANDOVER REQUEST* 🤝\n\n👤 *Staff:* Rahul Varma\n💰 *Amount:* ₹ ${cashInHand.toLocaleString('en-IN')}\n📅 *Date:* ${new Date().toLocaleDateString()}\n\n_Please confirm pickup._`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="pb-24 px-6 pt-4 min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold">My Profile</h1>
            </div>

            {/* 1. Compact Profile Card (Screenshot Match) */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setIsQRModalOpen(true)}
                className="bg-[#111] border border-white/5 p-4 rounded-[1.5rem] flex items-center gap-4 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer mb-8 shadow-2xl"
            >
                {/* Avatar */}
                <div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg relative shrink-0"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                    {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        "RV"
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center border-2 border-[#111]">
                        <Camera size={10} className="text-white" />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white truncate leading-tight">Rahul Varma</h2>
                    <p className="text-sm text-slate-500 truncate">Senior Field Officer • ID: #RV84</p>
                </div>

                {/* Chevron */}
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                    <ChevronRight size={20} />
                </div>
            </motion.div>


            {/* 2. Cash Management Section (Screenshot Match) */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-1">Cash Management</h3>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#1a1505] border border-amber-500/20 rounded-[2rem] p-6 relative overflow-hidden"
                >
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none"></div>

                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-[#3f2e08] border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-900/20">
                            <Wallet size={28} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-1">Cash in Hand</p>
                            <p className="text-4xl font-black text-amber-500 tracking-tight">₹{cashInHand.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleHandover}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg shadow-amber-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2 relative z-10 hover:brightness-110"
                    >
                        Request Handover <ArrowUpRight size={20} />
                    </button>
                </motion.div>
            </div>

            {/* QR Identity Modal (Hidden but accessible via Profile Card click) */}
            <AnimatePresence>
                {isQRModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm" onClick={() => setIsQRModalOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f1115] w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-1">My QR Code</h3>
                                <p className="text-slate-500 text-xs">Show this for attendance</p>
                            </div>
                            <div className="bg-white p-4 rounded-3xl mx-auto w-fit mb-8 border-4 border-white/10 shadow-xl">
                                <QrCode size={180} className="text-black" />
                            </div>
                            <button
                                onClick={() => setIsQRModalOpen(false)}
                                className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Smooth Details List */}
            <div className="space-y-4 relative z-10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2">Personal Details</p>
                <ProfileItem icon={<Phone size={18} />} label="Phone Number" value="+91 98765 43210" delay={0.2} />
                <ProfileItem icon={<Mail size={18} />} label="Email Address" value="rahul.varma@example.com" delay={0.3} />
                <ProfileItem icon={<MapPin size={18} />} label="Assigned Area" value="Ahmedabad, West Zone" delay={0.4} />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                    if (confirm('Log out?')) router.push('/');
                }}
                className="w-full mt-10 py-4 rounded-2xl bg-[#111] text-rose-500 font-bold border border-white/5 flex items-center justify-center gap-2 hover:bg-rose-950/30 transition-colors active:scale-95"
            >
                <LogOut size={20} /> Sign Out
            </motion.button>
        </div>
    )
}

function ProfileItem({ icon, label, value, delay }: any) {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay }}
            className="bg-[#111] p-4 rounded-2xl flex items-center gap-5 border border-white/5 group hover:border-indigo-500/30 transition-colors"
        >
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all shadow-inner">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-bold text-white text-base">{value}</p>
            </div>
        </motion.div>
    )
}
