"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Smartphone, ShieldCheck, ArrowLeft, Lock, KeyRound, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'pin'>('role');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff' | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem('payment_app_session');
    if (session === 'admin') router.push('/admin/dashboard');
    if (session === 'staff') router.push('/staff/home');
  }, []);

  const handleRoleSelect = (role: 'admin' | 'staff') => {
    setSelectedRole(role);
    setStep('pin');
    setPin("");
    setError(false);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(false);

    // Mock Authentication Logic
    setTimeout(() => {
      let isValid = false;
      if (selectedRole === 'admin' && pin === '1234') isValid = true;
      if (selectedRole === 'staff' && pin === '0000') isValid = true;

      if (isValid) {
        localStorage.setItem('payment_app_session', selectedRole!);
        if (selectedRole === 'admin') router.push('/admin/dashboard');
        if (selectedRole === 'staff') router.push('/staff/home');
      } else {
        setError(true);
        setLoading(false);
        setPin("");
      }
    }, 800);
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Auto-submit when PIN length is 4
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[0%] left-[20%] w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">

          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 rotate-3 hover:rotate-6 transition-transform">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Payment Entry Reports</h1>
                <p className="text-slate-400 font-medium">Secure Login Portal</p>
              </div>

              <div className="space-y-4">
                {/* Admin Panel button removed as per user request for Staff-only app */}

                <button
                  onClick={() => handleRoleSelect('staff')}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-2xl flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Smartphone size={22} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-white text-lg">Agent Portal</h3>
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Manage Daily Collections</p>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Developed By</p>
                <p className="text-sm font-black text-slate-500 tracking-wide">AARYA TECHNOLOGIES</p>
              </div>
            </motion.div>
          )}

          {/* Step 2: PIN Entry */}
          {step === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <button
                onClick={() => setStep('role')}
                className="absolute top-8 left-8 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>

              <div className="text-center mt-4 mb-8">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${error ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-white'}`}>
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : <Lock size={24} />}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedRole === 'admin' ? 'Admin Access' : 'Staff Access'}</h2>
                <p className={`text-sm mt-1 transition-colors ${error ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                  {error ? 'Incorrect PIN. Try again.' : 'Enter 4-digit security PIN'}
                </p>
              </div>

              {/* PIN Dots */}
              <div className={`flex justify-center gap-4 mb-8 ${error ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? (selectedRole === 'admin' ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-pink-500 shadow-[0_0_10px_#ec4899]') : 'bg-white/10'}`}
                  ></div>
                ))}
              </div>

              {/* Verified Badge Check Animation could go here */}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleDigitClick(num.toString())}
                    className="h-16 w-full rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 text-white font-bold text-2xl flex items-center justify-center transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <div className="h-16 w-full"></div>
                <button
                  onClick={() => handleDigitClick("0")}
                  className="h-16 w-full rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 text-white font-bold text-2xl flex items-center justify-center transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handleDelete}
                  className="h-16 w-full rounded-2xl hover:bg-white/10 active:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
                >
                  <ArrowLeft size={24} /> {/* Using ArrowLeft as Backspace icon */}
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
