"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Smartphone, ShieldCheck } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleNavigation = (role: 'admin' | 'staff') => {
    setLoading(role);
    // Simulate loading for effect
    setTimeout(() => {
        if (role === 'admin') router.push('/admin/dashboard');
        if (role === 'staff') router.push('/staff/home');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-10">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Payment Soft</h1>
          <p className="text-gray-500 mt-2 font-medium">Secure Collection System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleNavigation('admin')}
            disabled={!!loading}
            className={`w-full group relative flex items-center p-4 rounded-xl border-2 transition-all duration-300 ${
              loading === 'admin' 
                ? 'bg-indigo-600 border-indigo-600 text-white scale-95' 
                : 'bg-white border-indigo-100 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className={`p-3 rounded-lg mr-4 transition-colors ${loading === 'admin' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
              <LayoutDashboard size={24} />
            </div>
            <div className="text-left">
              <h3 className={`font-bold text-lg ${loading === 'admin' ? 'text-white' : 'text-gray-800'}`}>Admin Panel</h3>
              <p className={`text-xs ${loading === 'admin' ? 'text-indigo-200' : 'text-gray-400'}`}>For Business Owners</p>
            </div>
            {loading === 'admin' && <div className="absolute right-4 animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
          </button>

          <button
            onClick={() => handleNavigation('staff')}
            disabled={!!loading}
            className={`w-full group relative flex items-center p-4 rounded-xl border-2 transition-all duration-300 ${
              loading === 'staff' 
                ? 'bg-pink-600 border-pink-600 text-white scale-95' 
                : 'bg-white border-pink-100 hover:border-pink-500 hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className={`p-3 rounded-lg mr-4 transition-colors ${loading === 'staff' ? 'bg-white/20' : 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white'}`}>
              <Smartphone size={24} />
            </div>
            <div className="text-left">
              <h3 className={`font-bold text-lg ${loading === 'staff' ? 'text-white' : 'text-gray-800'}`}>Field Staff</h3>
              <p className={`text-xs ${loading === 'staff' ? 'text-pink-200' : 'text-gray-400'}`}>For Collection Agents</p>
            </div>
            {loading === 'staff' && <div className="absolute right-4 animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
          </button>
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">Protected by Secure 256-bit Encryption</p>
        </div>
      </div>
    </div>
  );
}
