"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Mail, Phone, MapPin, Building2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CompanyProfile() {
    const router = useRouter();
    const [company, setCompany] = useState({
        companyName: "Aarya Technologies",
        email: "contact@aaryatech.io",
        website: "www.aaryatech.io",
        address: "Ahmedabad, Gujarat",
        logo: "",
        gstNumber: ""
    });

    useEffect(() => {
        const saved = localStorage.getItem('payment_app_company_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCompany(prev => ({
                    ...prev,
                    companyName: parsed.companyName || prev.companyName,
                    email: parsed.email || prev.email,
                    website: parsed.website || prev.website,
                    address: parsed.address || prev.address,
                    logo: parsed.logo || prev.logo
                }));
            } catch (e) {
                console.error("Failed to load company settings", e);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#0f1115] text-white p-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-xl font-bold">Company Profile</h1>
            </div>

            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden mb-8"
            >
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-[1px] shadow-xl mb-6 overflow-hidden">
                        <div className="w-full h-full rounded-3xl bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                            {company.logo ? (
                                <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-cyan-400">
                                    {company.companyName === "Aarya Technologies" ? "AT" : company.companyName.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-2">{company.companyName}</h2>
                    <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">Innovating the future of digital payments and financial solutions.</p>
                </div>
            </motion.div>

            {/* Info Grid */}
            <div className="space-y-4">
                <InfoCard icon={<Globe />} label="Website" value={company.website} color="text-blue-400" bg="bg-blue-400/10" />
                <InfoCard icon={<Mail />} label="Email" value={company.email} color="text-purple-400" bg="bg-purple-400/10" />
                <InfoCard icon={<Phone />} label="Support" value="+91 98765 43210" color="text-emerald-400" bg="bg-emerald-400/10" />
                <InfoCard icon={<MapPin />} label="Headquarters" value={company.address} color="text-rose-400" bg="bg-rose-400/10" />
            </div>

            {/* About Section */}
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-indigo-400" />
                    About Us
                </h3>
                <div className="bg-[#1e2128] rounded-3xl p-6 border border-white/5 text-slate-400 text-sm leading-relaxed">
                    <p>
                        {company.companyName} is a premier software solutions provider, dedicated to streamlining business operations through cutting-edge ERP and payment systems. Established in 2024, we serve over 500+ clients across the state.
                    </p>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">© 2026 {company.companyName}</p>
                <p className="text-[10px] text-slate-700 mt-1">Version 2.0.1 (Stable)</p>
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value, color, bg }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#1e2128] p-4 rounded-2xl border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-white font-bold">{value}</p>
                </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                <ExternalLink size={16} />
            </button>
        </motion.div>
    );
}
