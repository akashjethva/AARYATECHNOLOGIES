"use client";

import { useState } from 'react';
import { Check, AlertCircle, X, MoreHorizontal, CreditCard, Download, Calendar, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';

interface Transaction {
    id: number | string;
    time: string;
    customer: string;
    amount: string;
    staff: string;
    mode: string;
    status: "Verified" | "Pending" | "Failed";
    date?: string;
    remarks?: string;
}

interface TransactionProps extends Transaction {
    onVerify?: (id: number | string) => void;
    onView?: (item: Transaction) => void;
    onReceipt?: (item: Transaction) => void;
    onDelete?: (id: number | string) => void;
}

export function EnhancedTransactionItem({ id, time, customer, amount, staff, mode, status, date, remarks, onVerify, onView, onReceipt, onDelete }: TransactionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const { formatCurrency } = useCurrency();

    const statusConfig = {
        'Verified': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Check },
        'Pending': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertCircle },
        'Failed': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: X }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const StatusIcon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <div
                className={`flex items-center justify-between p-5 rounded-3xl hover:bg-white/5 border transition-all cursor-pointer ${isExpanded ? 'bg-white/5 border-indigo-500/30' : 'border-transparent hover:border-white/5'
                    }`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 flex-1">
                    {/* Avatar with Status Indicator */}
                    <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/40 group-hover:scale-105 transition-all duration-300">
                            {customer[0]}
                        </div>
                        {/* Status Dot */}
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#1e293b] ${config.bg} flex items-center justify-center`}>
                            <StatusIcon size={10} className={config.color} />
                        </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors text-lg truncate">{customer}</h4>
                            {status !== 'Verified' && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${config.border} ${config.color} ${config.bg} shadow-sm`}>
                                    {status}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                <Calendar size={12} className="opacity-60" />
                                {time}
                            </span>
                            {date && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span className="text-[10px] text-slate-500 font-bold">{date}</span>
                                </>
                            )}
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Activity size={12} className="opacity-60" />
                                {staff}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Amount & Mode */}
                <div className="text-right mr-4">
                    <h4 className="font-bold text-white text-xl tracking-tight mb-1">
                        {formatCurrency(parseFloat(amount.replace(/,/g, '') || '0'))}
                    </h4>
                    <div className="flex items-center justify-end gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${mode === 'Cash' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                            mode === 'UPI' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                                'text-purple-400 bg-purple-500/10 border-purple-500/20'
                            }`}>
                            {mode}
                        </span>
                    </div>
                </div>

                {/* Quick Actions Menu */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsActionMenuOpen(!isActionMenuOpen);
                        }}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                        <MoreHorizontal size={20} className="text-slate-400" />
                    </button>

                    <AnimatePresence>
                        {isActionMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => { onVerify?.(id); setIsActionMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${status === 'Verified' ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                                >
                                    {status === 'Verified' ? <AlertCircle size={16} /> : <Check size={16} />}
                                    {status === 'Verified' ? 'Mark as Pending' : 'Mark as Verified'}
                                </button>
                                <button
                                    onClick={() => { onView?.({ id, time, customer, amount, staff, mode, status, date, remarks }); setIsActionMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                                >
                                    <CreditCard size={16} className="text-blue-400" />
                                    View Details
                                </button>
                                <button
                                    onClick={() => { onReceipt?.({ id, time, customer, amount, staff, mode, status, date, remarks }); setIsActionMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                                >
                                    <Download size={16} className="text-indigo-400" />
                                    Download Receipt
                                </button>
                                <div className="h-px bg-white/5 my-1"></div>
                                <button
                                    onClick={() => { onDelete?.(id); setIsActionMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                                >
                                    <X size={16} />
                                    Delete Transaction
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
                {isExpanded && remarks && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-2">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</p>
                                <p className="text-sm text-slate-300 font-medium">{remarks}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
