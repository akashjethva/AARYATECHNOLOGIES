"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Trophy, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadFromStorage, saveToStorage, GoalConfig, INITIAL_GOALS } from '@/utils/storage';
import { useCurrency } from '@/hooks/useCurrency';

type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface GoalTrackerProps {
    currentRevenue?: number; // Pass current revenue to auto-calculate progress
}

export default function GoalTracker({ currentRevenue = 0 }: GoalTrackerProps) {
    const [activePeriod, setActivePeriod] = useState<GoalPeriod>('daily');
    const [goals, setGoals] = useState<Record<string, GoalConfig>>(INITIAL_GOALS);
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [newTarget, setNewTarget] = useState('');
    const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

    // Load goals from storage on mount
    useEffect(() => {
        const savedGoals = loadFromStorage('goals', INITIAL_GOALS);
        setGoals(savedGoals);
    }, []);

    // Auto-update current progress based on transactions
    useEffect(() => {
        if (currentRevenue > 0) {
            setGoals(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                    updated[key] = { ...updated[key], current: currentRevenue };
                });
                saveToStorage('goals', updated);
                return updated;
            });
        }
    }, [currentRevenue]);

    const currentGoal = goals[activePeriod];
    const progress = currentGoal ? Math.min((currentGoal.current / currentGoal.target) * 100, 100) : 0;
    const remaining = currentGoal ? Math.max(currentGoal.target - currentGoal.current, 0) : 0;

    const handleTargetUpdate = () => {
        const targetValue = parseFloat(newTarget.replace(/,/g, ''));
        if (!isNaN(targetValue) && targetValue > 0) {
            const updated = {
                ...goals,
                [activePeriod]: {
                    ...currentGoal,
                    target: targetValue
                }
            };
            setGoals(updated);
            saveToStorage('goals', updated);
            setIsEditingTarget(false);
            setNewTarget('');
        }
    };

    const periodConfig = {
        daily: { icon: Zap, label: 'Daily', color: 'text-blue-400', bg: 'bg-blue-600' },
        weekly: { icon: Calendar, label: 'Weekly', color: 'text-emerald-400', bg: 'bg-emerald-600' },
        monthly: { icon: Target, label: 'Monthly', color: 'text-purple-400', bg: 'bg-purple-600' },
        yearly: { icon: Trophy, label: 'Yearly', color: 'text-amber-400', bg: 'bg-amber-600' }
    };

    const config = periodConfig[activePeriod];
    const Icon = config.icon;

    const { formatCurrency } = useCurrency();

    return (
        <div className="bg-gradient-to-br from-indigo-900/60 to-blue-900/60 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 border border-white/10 relative overflow-hidden backdrop-blur-md">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10">
                {/* Header with Period Selector */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold opacity-80 mb-2 text-sm uppercase tracking-wider">Revenue Goal</h3>
                        <div className="relative">
                            <button
                                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/20 backdrop-blur-sm group"
                            >
                                <Icon size={20} className={config.color} />
                                <span className="font-bold text-lg">{config.label} Target</span>
                                <ChevronDown size={16} className={`transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isPeriodDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                                    >
                                        {(Object.keys(periodConfig) as GoalPeriod[]).map((period) => {
                                            const PeriodIcon = periodConfig[period].icon;
                                            return (
                                                <button
                                                    key={period}
                                                    onClick={() => {
                                                        setActivePeriod(period);
                                                        setIsPeriodDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${activePeriod === period
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <PeriodIcon size={18} className={periodConfig[period].color} />
                                                    {periodConfig[period].label}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Achievement Badge */}
                    {progress >= 100 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-emerald-500/20 border-2 border-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30"
                        >
                            <Trophy size={20} className="text-emerald-400" />
                            <span className="font-bold text-emerald-400">ACHIEVED!</span>
                        </motion.div>
                    )}
                </div>

                {/* Target Amount */}
                <div className="mb-4">
                    {isEditingTarget ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTarget}
                                onChange={(e) => setNewTarget(e.target.value)}
                                placeholder="Enter new target"
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-xl outline-none focus:border-white/50"
                                autoFocus
                            />
                            <button
                                onClick={handleTargetUpdate}
                                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl font-bold transition-all"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingTarget(false);
                                    setNewTarget('');
                                }}
                                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setIsEditingTarget(true);
                                setNewTarget(currentGoal.target.toLocaleString('en-IN'));
                            }}
                            className="group"
                        >
                            <p className="text-sm opacity-60 mb-1 flex items-center gap-2 group-hover:opacity-100 transition-opacity">
                                Target Amount
                                <span className="text-xs opacity-0 group-hover:opacity-100">✏️ Click to edit</span>
                            </p>
                            <h2 className="text-5xl font-extrabold group-hover:text-blue-300 transition-colors">
                                {formatCurrency(currentGoal?.target || 0)}
                            </h2>
                        </button>
                    )}
                </div>

                {/* Progress Stats */}
                <div className="flex items-end gap-6 mb-6">
                    <div>
                        <p className="text-sm opacity-60 mb-1">Achieved</p>
                        <p className="text-3xl font-bold text-emerald-400">
                            {formatCurrency(currentGoal?.current || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm opacity-60 mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-amber-400">
                            {formatCurrency(remaining)}
                        </p>
                    </div>
                    <div className="ml-auto">
                        <p className="text-sm opacity-60 mb-1">Progress</p>
                        <p className="text-4xl font-bold">{progress.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/40 h-4 rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${config.bg} rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] relative`}
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </motion.div>
                </div>

                {/* Period Info */}
                {currentGoal && (
                    <div className="mt-4 flex items-center justify-between text-xs opacity-60">
                        <span>From: {new Date(currentGoal.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        <span>To: {new Date(currentGoal.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
