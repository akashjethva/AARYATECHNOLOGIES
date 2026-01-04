"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Shield, LogOut, QrCode, ArrowLeft, Camera, Upload, MapPin, Calendar, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StaffProfile() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

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

    return (
        <div className="pb-24 px-6 pt-4 min-h-screen bg-[#050505] text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-2xl font-bold">My Profile</h1>
            </div>

            {/* Holographic ID Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative mb-8 group perspective-1000"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 overflow-hidden shadow-2xl">
                    {/* Card Shine Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                    <div className="flex flex-col items-center relative z-10">
                        {/* Profile Photo with Glow */}
                        <div className="relative mb-4 group/photo cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover/photo:opacity-60 transition-opacity"></div>
                            <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-br from-indigo-400 to-fuchsia-500 relative z-10">
                                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-indigo-600 rounded-full p-2 text-white shadow-lg z-20 pointer-events-none">
                                <Upload size={14} />
                            </div>
                        </div>

                        {/* Hidden Input */}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />

                        <h2 className="text-3xl font-bold text-white tracking-tight mb-1">Rahul Varma</h2>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-500/20">
                                Senior Agent
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <Shield size={10} fill="currentColor" /> Verified
                            </span>
                        </div>

                        {/* ID Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 w-full mb-6">
                            <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Employee ID</p>
                                <p className="text-lg font-bold text-white font-mono">RV-8842</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Joined</p>
                                <p className="text-lg font-bold text-white">Jan 2024</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsQRModalOpen(true)}
                            className="w-full bg-white p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors shadow-lg active:shadow-sm"
                        >
                            <div className="text-left">
                                <p className="text-black font-bold text-sm">Scan Identity</p>
                                <p className="text-slate-500 text-xs text-left">Use for attendance & verification</p>
                            </div>
                            <QrCode size={40} className="text-black" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* QR Identity Modal */}
            <AnimatePresence>
                {isQRModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsQRModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#050505] w-full max-w-sm rounded-[3rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Holographic Background */}
                            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="p-8 pb-12 flex flex-col items-center">
                                {/* Close Button */}
                                <div className="w-full flex justify-end mb-4">
                                    <button
                                        onClick={() => setIsQRModalOpen(false)}
                                        className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="text-center mb-10">
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                        Digital Identity <Sparkles className="text-indigo-400" size={20} />
                                    </h3>
                                    <p className="text-slate-400 text-sm px-8">Point the terminal scanner at this code for verification</p>
                                </div>

                                {/* Holographic QR Container */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl group-hover:bg-indigo-500/40 transition-all duration-700"></div>
                                    <div className="bg-white p-6 rounded-[2.5rem] relative z-10 shadow-2xl border-4 border-white/20">
                                        <div className="relative">
                                            <QrCode size={200} className="text-black" />
                                            {/* Scanning Animation */}
                                            <motion.div
                                                animate={{
                                                    top: ["0%", "100%", "0%"]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                                className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20 pointer-events-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 space-y-2 text-center">
                                    <p className="text-white font-bold text-lg">Rahul Varma</p>
                                    <p className="text-indigo-400 text-xs font-mono tracking-widest uppercase">ID: RV-8842-VERIFIED</p>
                                </div>
                            </div>

                            {/* Bottom Footer Decoration */}
                            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500"></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Smooth Details List */}
            <div className="space-y-4 relative z-10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2">Personal Details</p>
                <ProfileItem icon={<Phone size={18} />} label="Phone Number" value="+91 98765 43210" delay={0.1} />
                <ProfileItem icon={<Mail size={18} />} label="Email Address" value="rahul.varma@example.com" delay={0.2} />
                <ProfileItem icon={<MapPin size={18} />} label="Assigned Area" value="Ahmedabad, West Zone" delay={0.3} />
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-10 py-4 rounded-2xl bg-[#111] text-rose-500 font-bold border border-white/5 flex items-center justify-center gap-2 hover:bg-rose-950/30 transition-colors"
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
