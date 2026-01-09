"use client";

import { Crown, Trophy, TrendingUp, ArrowLeft, Star, Shield, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, Staff, Collection } from "@/services/db";
import { motion } from "framer-motion";

export default function RankPage() {
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<{ id: number; name: string; amount: number; rank: number; role: string; avatar: string }[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<number>(0);
    const [currentUserName, setCurrentUserName] = useState("Rahul Varma"); // Hardcoded for now, should be from Auth

    useEffect(() => {
        // Calculate Rankings based on Today's Collection
        const staff = db.getStaff();
        const collections = db.getCollections();

        // Filter for TODAY's collections only? Or ALL time? Usually "Rank" implies a contest.
        // Let's do "Today's Leaderboard" as default context for a daily collection app.
        const today = new Date().toISOString().split('T')[0];

        const staffPerformance = staff.map(s => {
            const myCollections = collections.filter(c =>
                c.status === 'Paid' &&
                c.date === today &&
                (c.staff?.toLowerCase() === s.name.toLowerCase())
            );

            const total = myCollections.reduce((sum, c) => sum + (parseFloat(c.amount.replace(/,/g, '')) || 0), 0);

            return {
                id: s.id,
                name: s.name,
                role: s.role,
                amount: total,
                // Generate a consistent pseudo-avatar initials
                avatar: s.name.split(' ').map(n => n[0]).join('')
            };
        });

        // Sort by Amount DESC
        const sorted = staffPerformance.sort((a, b) => b.amount - a.amount);

        // Assign Ranks
        const rankedList = sorted.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        setLeaderboard(rankedList);

        // Find current user rank
        const myRank = rankedList.findIndex(r => r.name === currentUserName) + 1;
        setCurrentUserRank(myRank > 0 ? myRank : rankedList.length + 1);

    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="min-h-screen bg-[#0f1115] text-white pb-20 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
            <div className="fixed -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed top-20 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <header className="px-6 pt-8 pb-4 relative z-10 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-95 transition-all hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    LEADERBOARD
                </h1>
            </header>

            {/* Top 3 Podium (Visual) */}
            <div className="px-6 mt-4 mb-8 relative z-10">
                <div className="flex justify-center items-end gap-3 h-48">
                    {/* Rank 2 */}
                    {leaderboard[1] && (
                        <div className="flex flex-col items-center w-1/3">
                            <div className="relative mb-2">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 p-[2px] shadow-lg shadow-slate-500/20">
                                    <div className="w-full h-full bg-[#15171c] rounded-2xl flex items-center justify-center text-sm font-bold border border-white/10">
                                        {leaderboard[1].avatar}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0f1115]">2</div>
                                </div>
                            </div>
                            <div className="w-full bg-gradient-to-t from-slate-800/40 to-slate-800/10 rounded-t-2xl border-x border-t border-white/5 h-24 flex flex-col items-center justify-end p-2 pb-3 backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">{leaderboard[1].name.split(' ')[0]}</span>
                                <span className="text-xs font-bold text-slate-200">{formatCurrency(leaderboard[1].amount)}</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {leaderboard[0] && (
                        <div className="flex flex-col items-center w-1/3 z-20 -mx-2">
                            <div className="relative mb-2">
                                <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-bounce" size={24} fill="currentColor" />
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/30">
                                    <div className="w-full h-full bg-[#15171c] rounded-2xl flex items-center justify-center text-xl font-bold border border-white/10 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
                                        {leaderboard[0].avatar}
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-xs font-black text-black border-4 border-[#0f1115]">1</div>
                                </div>
                            </div>
                            <div className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/5 rounded-t-2xl border-x border-t border-amber-500/20 h-32 flex flex-col items-center justify-end p-2 pb-4 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent"></div>
                                <span className="text-xs font-bold text-white truncate w-full text-center mb-0.5">{leaderboard[0].name.split(' ')[0]}</span>
                                <span className="text-sm font-black text-amber-400">{formatCurrency(leaderboard[0].amount)}</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {leaderboard[2] && (
                        <div className="flex flex-col items-center w-1/3">
                            <div className="relative mb-2">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-700 p-[2px] shadow-lg shadow-orange-700/20">
                                    <div className="w-full h-full bg-[#15171c] rounded-2xl flex items-center justify-center text-sm font-bold border border-white/10">
                                        {leaderboard[2].avatar}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0f1115]">3</div>
                                </div>
                            </div>
                            <div className="w-full bg-gradient-to-t from-orange-900/40 to-orange-900/10 rounded-t-2xl border-x border-t border-white/5 h-20 flex flex-col items-center justify-end p-2 pb-3 backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">{leaderboard[2].name.split(' ')[0]}</span>
                                <span className="text-xs font-bold text-slate-300">{formatCurrency(leaderboard[2].amount)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="px-5 space-y-3 relative z-10 pb-10">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2 uppercase tracking-widest mb-1">
                    <span>Rank</span>
                    <span>Collection</span>
                </div>

                {leaderboard.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm relative overflow-hidden ${item.name === currentUserName ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-[#15171c]/80 border-white/5'}`}
                    >
                        {item.name === currentUserName && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}

                        <div className="flex items-center gap-4">
                            <span className={`font-mono font-bold text-lg w-6 text-center ${item.name === currentUserName ? 'text-indigo-400' : 'text-slate-500'}`}>#{item.rank}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                                    {item.avatar}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${item.name === currentUserName ? 'text-white' : 'text-slate-300'}`}>{item.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{item.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`font-bold ${item.name === currentUserName ? 'text-indigo-300' : 'text-slate-200'}`}>{formatCurrency(item.amount)}</p>
                        </div>
                    </motion.div>
                ))}

                {leaderboard.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Trophy size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-sm font-bold text-slate-400">No collections today yet.</p>
                        <p className="text-xs text-slate-600 mt-1">Accept payments to climb the leaderboard!</p>
                    </div>
                )}
            </div>

            {/* My Rank Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0f1115]/90 backdrop-blur-xl border-t border-white/10 p-5 z-20 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
                        {currentUserRank}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Rank</p>
                        <p className="text-white font-bold">Good Job!</p>
                    </div>
                </div>
                <button onClick={() => router.push('/staff/entry')} className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                    Collect Now
                </button>
            </div>
        </div>
    );
}
