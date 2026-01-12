"use client";

import {
    Save, Building2, Bell, Shield, Database, Mail, Globe, Lock, Upload,
    CheckCircle, X, AlertCircle, Info, LayoutGrid, Users, MapPin, CreditCard,
    LayoutDashboard, Plus, Trash2, FileText, ShieldCheck, LogOut, Phone, User, Smartphone, Key, CalendarClock, ScanFace
} from "lucide-react";
import { useState, useEffect, useRef } from "react"; // Added useRef
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/services/db";
import { useCurrency } from "@/hooks/useCurrency";

// Helper for Image Upload
// Helper for Image Upload with Compression
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // Allow up to 5MB input, we will compress it down
            alert("File size too large. Max 5MB allowed.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG at 70% quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                // Final safety check
                if (dataUrl.length > 900 * 1024) { // If still > 900KB
                    alert("Image is too complex to compress. Please try a simpler image.");
                } else {
                    callback(dataUrl);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: LayoutDashboard },
        { id: 'admin', label: 'Admin Profile', icon: User },
        { id: 'company', label: 'Company Profile', icon: Building2 },
        { id: 'mobile', label: 'Mobile App Controls', icon: Smartphone },
        { id: 'zones', label: 'Zones & Areas', icon: MapPin },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'backup', label: 'Backup & Data', icon: Database },
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-80 shrink-0">
                    <div className="sticky top-8">
                        <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                            <h2 className="text-2xl font-extrabold text-white mb-6 px-4">Settings</h2>
                            <div className="space-y-2 relative z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-left group ${activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Status */}
                        {/* Quick Status */}
                        <SystemStatusCard />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#1e293b]/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden"
                    >

                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'admin' && <AdminProfileSettings />}
                        {activeTab === 'company' && <CompanySettings />}
                        {activeTab === 'mobile' && <MobileAppControls />}
                        {activeTab === 'zones' && <ZoneSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'backup' && <BackupSettings />}

                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function GeneralSettings() {
    const [settings, setSettings] = useState({
        appName: 'Akashohk1 Admin',
        currency: 'INR (₹)',
        language: 'English',
        timezone: '(GMT+05:30) India Standard Time',
        dateFormat: 'DD/MM/YYYY',
        financialYear: 'April 1st',
        theme: 'Dark Mode',
        rowsPerPage: '10',
        lowBalanceThreshold: '5000'
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const saved = db.getAppSettings();
        setSettings(prev => ({ ...prev, ...saved }));
    }, []);

    const handleChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            db.saveAppSettings(settings);
            // specific events are already dispatched by db.saveAppSettings
            window.dispatchEvent(new Event('currency-change')); // keep for currency specific listeners if any
            setToast({ show: true, message: 'General Settings Saved Successfully!', type: 'success' });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">General Settings</h3>
                <p className="text-slate-400">Configure basic application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Application Name" value={settings.appName} onChange={(e: any) => handleChange('appName', e.target.value)} placeholder="Enter app name" />
                <SelectGroup label="Currency" options={['INR (₹)', 'USD ($)', 'EUR (€)']} value={settings.currency} onChange={(e: any) => handleChange('currency', e.target.value)} />
                <SelectGroup label="Language" options={['English', 'Gujarati', 'Hindi']} value={settings.language} onChange={(e: any) => handleChange('language', e.target.value)} />
                <SelectGroup label="Timezone" options={['(GMT+05:30) India Standard Time', '(GMT+00:00) UTC', '(GMT-05:00) Eastern Time']} value={settings.timezone} onChange={(e: any) => handleChange('timezone', e.target.value)} />
                <SelectGroup label="Date Format" options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} value={settings.dateFormat} onChange={(e: any) => handleChange('dateFormat', e.target.value)} />
                <SelectGroup label="Financial Year Start" options={['April 1st', 'January 1st']} value={settings.financialYear} onChange={(e: any) => handleChange('financialYear', e.target.value)} />
                <SelectGroup label="Theme Preference" options={['Dark Mode', 'Light Mode', 'System Default']} value={settings.theme} onChange={(e: any) => handleChange('theme', e.target.value)} />
                <SelectGroup label="Default Rows Per Page" options={['10', '25', '50', '100']} value={settings.rowsPerPage} onChange={(e: any) => handleChange('rowsPerPage', e.target.value)} />
                <InputGroup label="Low Balance Threshold (₹)" value={settings.lowBalanceThreshold} onChange={(e: any) => handleChange('lowBalanceThreshold', e.target.value)} placeholder="Ex. 5000" />
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AdminProfileSettings() {
    const [profile, setProfile] = useState({
        name: 'Jayesh Bhai',
        role: 'Administrator',
        email: 'admin@aaryatech.com',
        phone: '+91 98765 43210',
        password: 'password123',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const saved = db.getAdminProfile();
        setProfile(saved);
    }, []);

    const handleChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!profile.name) {
            setToast({ show: true, message: 'Name is required.', type: 'error' });
            return;
        }
        setLoading(true);
        setTimeout(() => {
            db.saveAdminProfile(profile);
            setToast({ show: true, message: 'Admin Profile Updated!', type: 'success' });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Admin Profile</h3>
                <p className="text-slate-400">Manage your administrator account details.</p>
            </div>

            <div className="flex items-center gap-6 p-6 bg-[#0f172a]/50 rounded-2xl border border-white/5">
                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="admin-avatar-upload"
                        onChange={(e) => handleImageUpload(e, (base64) => handleChange('avatar', base64))}
                    />
                    <label
                        htmlFor="admin-avatar-upload"
                        className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] shadow-lg relative overflow-hidden group cursor-pointer block"
                    >
                        <div className="h-full w-full bg-[#0f172a] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                            <img src={profile.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={24} className="text-white" />
                            </div>
                        </div>
                    </label>
                    {profile.avatar && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChange('avatar', '');
                            }}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg hover:bg-rose-600 transition-colors z-[20]"
                            title="Remove Photo"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>
                <div>
                    <h4 className="text-white font-bold text-lg">{profile.name}</h4>
                    <p className="text-slate-400 text-sm mt-1">{profile.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Full Name" value={profile.name} onChange={(e: any) => handleChange('name', e.target.value)} icon={<User size={16} />} />
                <InputGroup label="Role / Designation" value={profile.role} onChange={(e: any) => handleChange('role', e.target.value)} icon={<ShieldCheck size={16} />} />
                <InputGroup label="Email ID" value={profile.email} onChange={(e: any) => handleChange('email', e.target.value)} icon={<Mail size={16} />} />
                <InputGroup label="Phone Number" value={(profile as any).phone || ''} onChange={(e: any) => handleChange('phone', e.target.value)} icon={<Phone size={16} />} />
                <div className="md:col-span-2">
                    <InputGroup label="Login Password" value={(profile as any).password || ''} onChange={(e: any) => handleChange('password', e.target.value)} icon={<Lock size={16} />} type="password" />
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CompanySettings() {
    const [company, setCompany] = useState({
        name: 'Akashohk1',
        gst: '24ABCDE1234F1Z5',
        email: 'admin@aaryatech.com',
        mobile: '+91 98765 43210',
        website: 'www.aaryatech.com',
        address: '405, Silicon Valley, Near Shivranjani Cross Roads, Satellite, Ahmedabad - 380015',
        logo: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const saved = db.getCompanyDetails();
        setCompany(saved);
    }, []);

    const handleChange = (field: string, value: string) => {
        setCompany(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            db.saveCompanyDetails(company);
            setToast({ show: true, message: 'Company Profile Saved Successfully!', type: 'success' });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Company Profile</h3>
                <p className="text-slate-400">Manage your business details and branding.</p>
            </div>

            <div className="flex items-center gap-6 p-6 bg-[#0f172a]/50 rounded-2xl border border-white/5">
                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="company-logo-upload"
                        onChange={(e) => handleImageUpload(e, (base64) => handleChange('logo', base64))}
                    />
                    <label
                        htmlFor="company-logo-upload"
                        className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-slate-600 relative overflow-hidden group cursor-pointer block"
                    >
                        {company.logo ? (
                            <img src={company.logo} alt="Logo" className="h-full w-full object-cover rounded-full" />
                        ) : (
                            <Upload size={24} className="text-slate-400 group-hover:text-white transition-colors" />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-white">Upload</span>
                        </div>
                    </label>
                    {company.logo && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleChange('logo', '');
                            }}
                            className="absolute -top-1 -right-1 bg-rose-500 text-white p-1.5 rounded-full shadow-lg hover:bg-rose-600 transition-colors z-[20]"
                            title="Remove Logo"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>
                <div>
                    <h4 className="text-white font-bold text-lg">Company Logo</h4>
                    <p className="text-slate-400 text-sm mt-1">Recommended size: 512x512px. Max 2MB.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Company Name" value={company.name} onChange={(e: any) => handleChange('name', e.target.value)} />
                <InputGroup label="GST / VAT Number" value={company.gst} onChange={(e: any) => handleChange('gst', e.target.value)} />
                <InputGroup label="Email Address" value={company.email} onChange={(e: any) => handleChange('email', e.target.value)} icon={<Mail size={16} />} />
                <InputGroup label="Mobile Number" value={company.mobile} onChange={(e: any) => handleChange('mobile', e.target.value)} icon={<Phone size={16} />} />
                <InputGroup label="Website" value={company.website} onChange={(e: any) => handleChange('website', e.target.value)} icon={<Globe size={16} />} />
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Address</label>
                    <textarea
                        rows={3}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none"
                        value={company.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                    ></textarea>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ZoneSettings() {
    const [zones, setZones] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [newZone, setNewZone] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Load Data
    useEffect(() => {
        const loadData = () => {
            const z = db.getZones();
            setZones(z);

            // Calculate Dynamic Stats per Zone
            const staff = db.getStaff();
            const txns = db.getCollections();
            const zoneStats: any = {};

            z.forEach((zone: any) => {
                // Active Staff in this Zone (assuming staff have a 'zone' field, or we check if their transactions are here?)
                // For now, let's map Staff by their 'zone' field if it exists.
                // Note: Staff interface needs 'zone' field populated in DB.
                const activeStaffCount = staff.filter((s: any) => s.status === 'Active' && s.zone === zone.name).length;

                // Revenue from this Zone (based on Customer City matching Zone Name)
                // This aligns with Reports logic
                const zoneRevenue = txns
                    .filter((t: any) => {
                        // Find customer for this txn
                        const customer = db.getCustomers().find((c: any) => c.name === t.customer);
                        return t.status === 'Paid' && customer?.city === zone.name;
                    })
                    .reduce((sum: number, t: any) => sum + (parseFloat(t.amount.replace(/,/g, '')) || 0), 0);

                zoneStats[zone.id] = { active_staff: activeStaffCount, collections: formatCurrency(zoneRevenue) };
            });
            setStats(zoneStats);
        };

        loadData();
        window.addEventListener('zone-updated', loadData);
        window.addEventListener('transaction-updated', loadData); // Re-calc revenue
        window.addEventListener('staff-updated', loadData); // Re-calc staff
        return () => {
            window.removeEventListener('zone-updated', loadData);
            window.removeEventListener('transaction-updated', loadData);
            window.removeEventListener('staff-updated', loadData);
        };
    }, [formatCurrency]);

    const handleAddZone = () => {
        if (!newZone.trim()) return;
        // Check duplicate
        if (zones.some(z => z.name.toLowerCase() === newZone.toLowerCase())) {
            setToast({ show: true, message: 'Zone already exists!', type: 'error' });
            return;
        }

        db.saveZone({ id: Date.now(), name: newZone });
        setNewZone('');
        setToast({ show: true, message: 'New Zone Added Successfully!', type: 'success' });
    };

    const handleDeleteZone = (id: number) => {
        db.deleteZone(id);
        setToast({ show: true, message: 'Zone Deleted Successfully!', type: 'success' });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Zones & Areas</h3>
                <p className="text-slate-400">Manage operational zones for staff and reports.</p>
            </div>

            {/* Add New Zone */}
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Add New Zone</label>
                    <input
                        type="text"
                        value={newZone}
                        onChange={(e) => setNewZone(e.target.value)}
                        placeholder="Ex. Surat City"
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600"
                    />
                </div>
                <button
                    onClick={handleAddZone}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 h-[62px]"
                >
                    <Plus size={24} />
                    Add Zone
                </button>
            </div>

            {/* Zone List */}
            <div className="grid grid-cols-1 gap-4">
                {zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-5 bg-[#0f172a] hover:bg-[#1e293b] rounded-2xl border border-white/5 group transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">{zone.name}</h4>
                                <p className="text-slate-400 text-xs font-bold mt-0.5">{stats[zone.id]?.active_staff || 0} Staff Active • {stats[zone.id]?.collections || formatCurrency(0)} Revenue</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {zones.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <MapPin size={48} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 font-bold">No zones added yet.</p>
                </div>
            )}

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MobileAppControls() {
    const [perms, setPerms] = useState({
        requireGPS: false,
        allowBackdated: true,
        showCustomerContact: true,
        allowShareReceipt: true,
        enforceBiometric: false
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const saved = db.getMobilePermissions();
        setPerms(saved);
    }, []);

    const handleToggle = (key: string) => {
        setPerms(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            db.saveMobilePermissions(perms);
            setToast({ show: true, message: 'Mobile Permissions Updated!', type: 'success' });
            setLoading(false);
        }, 800);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Mobile App Controls</h3>
                <p className="text-slate-400">Configure permissions and features for the Staff Mobile App.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${perms.requireGPS ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500'}`}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white text-left">Require GPS Location</h4>
                            <p className="text-slate-400 text-sm">Force staff to enable GPS before making an entry.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={perms.requireGPS} onChange={() => handleToggle('requireGPS')} />
                        <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${perms.allowBackdated ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500'}`}>
                            <CalendarClock size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white text-left">Allow Backdated Entries</h4>
                            <p className="text-slate-400 text-sm">Allow staff to select past dates for transactions.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={perms.allowBackdated} onChange={() => handleToggle('allowBackdated')} />
                        <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${perms.showCustomerContact ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500'}`}>
                            <Phone size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white text-left">Show Customer Contact Info</h4>
                            <p className="text-slate-400 text-sm">Allow staff to see full phone numbers of customers.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={perms.showCustomerContact} onChange={() => handleToggle('showCustomerContact')} />
                        <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${perms.enforceBiometric ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500'}`}>
                            <ScanFace size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white text-left">Enforce Biometric Security</h4>
                            <p className="text-slate-400 text-sm">Require FaceID/Fingerprint to open the app.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={perms.enforceBiometric} onChange={() => handleToggle('enforceBiometric')} />
                        <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NotificationSettings() {
    const [notifs, setNotifs] = useState({
        dailyReport: true,
        paymentAlerts: true,
        staffLogin: false,
        lowBalance: true,
        updates: true
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const saved = db.getNotificationSettings();
        setNotifs(saved);
    }, []);

    const handleToggle = (key: string) => {
        setNotifs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            db.saveNotificationSettings(notifs);
            setToast({ show: true, message: 'Notification Preferences Saved!', type: 'success' });
            setLoading(false);
        }, 800);
    };

    const handleTestNotification = () => {
        setToast({ show: true, message: 'Test Notification Sent Successfully!', type: 'success' });
        window.dispatchEvent(new Event('test-notification'));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Notifications</h3>
                    <p className="text-slate-400">Control how and when you receive alerts.</p>
                </div>
                <button
                    onClick={handleTestNotification}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-colors font-bold text-sm"
                >
                    <Bell size={16} />
                    Test Alerts
                </button>
            </div>

            <div className="space-y-4">
                <ToggleItem
                    icon={<FileText size={24} />}
                    title="Daily Collection Report"
                    description="Receive a daily summary of total collections via SMS/Email."
                    checked={notifs.dailyReport}
                    onChange={() => handleToggle('dailyReport')}
                />
                <ToggleItem
                    icon={<CreditCard size={24} />}
                    title="New Payment Alerts"
                    description="Get notified instantly when a staff member adds a new entry."
                    checked={notifs.paymentAlerts}
                    onChange={() => handleToggle('paymentAlerts')}
                />
                <ToggleItem
                    icon={<Users size={24} />}
                    title="Staff Login Alerts"
                    description="Notify admin when staff members log in to their app."
                    checked={notifs.staffLogin}
                    onChange={() => handleToggle('staffLogin')}
                />
                <ToggleItem
                    icon={<AlertCircle size={24} />}
                    title="Low Balance Warnings"
                    description="Alert when customer credit limit is exceeded."
                    checked={notifs.lowBalance}
                    onChange={() => handleToggle('lowBalance')}
                />
                <ToggleItem
                    icon={<Database size={24} />}
                    title="System Updates"
                    description="Receive notifications about software updates and maintenance."
                    checked={notifs.updates}
                    onChange={() => handleToggle('updates')}
                />
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function SecuritySettings() {
    const [security, setSecurity] = useState({
        twoFactor: false,
        forceLogout: true
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    useEffect(() => {
        const saved = db.getAdminSecurity();
        setSecurity(saved);
    }, []);

    const handleToggle = (key: string) => {
        const updated = { ...security, [key]: !security[key as keyof typeof security] };
        setSecurity(updated);
        db.saveAdminSecurity(updated);
        setToast({ show: true, message: `${key === 'twoFactor' ? '2FA' : 'Force Logout'} setting updated!`, type: 'success' });
    };

    const handlePasswordUpdate = () => {
        if (!currentPin || !newPin || !confirmPin) {
            setToast({ show: true, message: 'All fields are required', type: 'error' });
            return;
        }

        if (newPin !== confirmPin) {
            setToast({ show: true, message: 'New passwords do not match', type: 'error' });
            return;
        }

        if (newPin.length !== 4) {
            setToast({ show: true, message: 'PIN must be exactly 4 digits', type: 'error' });
            return;
        }

        if (!db.verifyAdminPin(currentPin)) {
            setToast({ show: true, message: 'Incorrect Current Password', type: 'error' });
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const updated = { ...security, pin: newPin };
            db.saveAdminSecurity(updated);
            setSecurity(updated);
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
            setLoading(false);
            setToast({ show: true, message: 'Password Updated Successfully!', type: 'success' });
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Security</h3>
                <p className="text-slate-400">Protect your account and data.</p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl md:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                    <Lock className="text-orange-400" size={24} />
                    <h4 className="text-lg font-bold text-orange-100">Change Password</h4>
                </div>
                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="Current Password (PIN)"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-normal"
                    />
                    <input
                        type="password"
                        placeholder="New Password (4 Digit PIN)"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        maxLength={4}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-normal"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        maxLength={4}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-normal"
                    />
                    <button
                        onClick={handlePasswordUpdate}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <ToggleItem
                    icon={<ShieldCheck size={24} />}
                    title="Two-Factor Authentication (2FA)"
                    description="Require an OTP code in addition to password for login."
                    checked={security.twoFactor}
                    onChange={() => handleToggle('twoFactor')}
                />
                <ToggleItem
                    icon={<LogOut size={24} />}
                    title="Force Logout Inactive Staff"
                    description="Automatically logout staff apps after 1 hour of inactivity."
                    checked={security.forceLogout}
                    onChange={() => handleToggle('forceLogout')}
                />
            </div>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BackupSettings() {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Reset Security State
    const [resetStep, setResetStep] = useState<'idle' | 'password' | 'otp'>('idle');
    const [verifyPin, setVerifyPin] = useState('');
    const [verifyOtp, setVerifyOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [resetError, setResetError] = useState('');

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleBackup = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setToast({ show: true, message: 'Backup Created Successfully!', type: 'success' });
        }, 2000);
    };

    const initiateReset = () => {
        setResetStep('password');
        setVerifyPin('');
        setVerifyOtp('');
        setResetError('');
        setGeneratedOtp('');
    };

    const handleVerifyPin = () => {
        if (db.verifyAdminPin(verifyPin)) {
            setResetStep('otp');
            setResetError('');
        } else {
            setResetError('Incorrect Admin PIN');
        }
    };

    const handleSendOtp = () => {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(otp);

        // Send Notification
        db.addNotification({
            id: Date.now(),
            title: "Security Verification Code",
            desc: `Your Reset OTP is: ${otp}`,
            time: "Just now",
            type: "system",
            path: "#",
            read: false
        });

        setToast({ show: true, message: 'OTP sent to Notifications', type: 'success' });
    };

    const handleVerifyOtpAndReset = async () => {
        if (verifyOtp === generatedOtp) {
            setLoading(true); // Reusing loading state or adding a new one ideally, but distinct state 'isResetting' would be better.
            // Let's assume loading state is fine or just add a toast.
            // Actually, best to just await and then redirect.
            await db.resetAllData();
            // Data reset complete, redirecting
            window.location.href = '/';
        } else {
            setResetError('Invalid OTP');
        }
    };

    return (
        <div className="space-y-8 relative">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Data Management</h3>
                <p className="text-slate-400">Backup and restore your application data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Last Backup</p>
                        <h4 className="text-2xl font-bold text-white">Jan 03, 2026</h4>
                        <p className="text-slate-500 text-sm">10:00 AM (Auto)</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Secure
                    </div>
                </div>
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Data Size</p>
                        <h4 className="text-2xl font-bold text-white">45.2 MB</h4>
                        <p className="text-slate-500 text-sm">Including 1250 transaction records</p>
                    </div>
                    <Database className="text-indigo-500 opacity-20 absolute right-6 bottom-6 transform scale-150" size={48} />
                </div>
            </div>

            <div className="pt-6">
                <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                    <Upload size={20} className={loading ? 'animate-bounce' : ''} />
                    {loading ? 'Creating Backup...' : 'Backup Now'}
                </button>
                <p className="text-slate-500 mt-4 text-sm">Manual backups are saved to your local server storage.</p>
            </div>

            {/* Danger Zone */}
            <div className="pt-8 mt-8 border-t border-white/5">
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl">
                    <h4 className="text-xl font-bold text-rose-500 mb-2 flex items-center gap-2">
                        <AlertCircle size={24} />
                        Danger Zone
                    </h4>
                    <p className="text-slate-400 text-sm mb-6">
                        Resetting the application will permanently delete all data including customers, transactions, staff, and settings. This action cannot be undone.
                    </p>
                    <button
                        onClick={initiateReset}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Trash2 size={20} />
                        Reset Application Data
                    </button>
                </div>
            </div>

            {/* Reset Security Modal */}
            <AnimatePresence>
                {resetStep !== 'idle' && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setResetStep('idle')}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl relative z-10 p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Security Check</h3>
                                <button onClick={() => setResetStep('idle')} className="text-slate-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {resetStep === 'password' && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                                            <Key size={32} />
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium">Verify Admin PIN to proceed</p>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Enter PIN"
                                        value={verifyPin}
                                        onChange={(e) => setVerifyPin(e.target.value)}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all font-bold text-center tracking-widest text-lg placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-600"
                                        autoFocus
                                    />
                                    {resetError && <p className="text-rose-500 text-xs font-bold text-center">{resetError}</p>}
                                    <button
                                        onClick={handleVerifyPin}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20"
                                    >
                                        Verify PIN
                                    </button>
                                </div>
                            )}

                            {resetStep === 'otp' && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                            <Smartphone size={36} />
                                        </div>
                                        <h4 className="text-white font-bold text-lg">2-Step Verification</h4>
                                        <p className="text-slate-400 text-sm mt-1">We've sent an OTP to your notifications.</p>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="XXXX"
                                            maxLength={4}
                                            value={verifyOtp}
                                            onChange={(e) => setVerifyOtp(e.target.value)}
                                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-center tracking-[0.5em] text-2xl placeholder:font-normal placeholder:tracking-widest placeholder:text-slate-700"
                                        />
                                        <button
                                            onClick={handleSendOtp}
                                            className="absolute right-2 top-2 bottom-2 px-4 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg text-xs font-bold transition-colors border border-white/5 active:bg-slate-600 shadow-sm"
                                        >
                                            {generatedOtp ? 'Resend' : 'Send'}
                                        </button>
                                    </div>

                                    {generatedOtp && (
                                        <div className="text-center">
                                            <p className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                                                <CheckCircle size={12} />
                                                OTP Sent successfully! Check Bell Icon.
                                            </p>
                                        </div>
                                    )}

                                    {resetError && <p className="text-rose-500 text-sm font-bold text-center bg-rose-500/10 py-2 rounded-lg">{resetError}</p>}

                                    <button
                                        onClick={handleVerifyOtpAndReset}
                                        disabled={!generatedOtp || verifyOtp.length !== 4}
                                        className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 mt-4 text-lg active:scale-[0.98]"
                                    >
                                        <Trash2 size={20} />
                                        Confirm & Reset Data
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 right-10 z-[100] bg-[#1e293b] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 min-w-[320px]"
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-auto text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* Helper Components */
function InputGroup({ label, value, onChange, placeholder, icon }: any) {
    return (
        <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
                <input
                    type="text"
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600 ${icon ? 'pl-12' : ''}`}
                />
            </div>
        </div>
    );
}

function SelectGroup({ label, options, value, onChange }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-bold text-lg appearance-none cursor-pointer"
                >
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ title, description, checked, onChange, icon }: any) {
    return (
        <div
            onClick={onChange}
            className="flex items-center justify-between p-5 bg-[#0f172a] rounded-2xl border border-white/5 hover:bg-[#1e293b] transition-colors group cursor-pointer"
        >
            <div className="flex items-center gap-4">
                {icon && (
                    <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        {icon}
                    </div>
                )}
                <div>
                    <h4 className="font-bold text-white text-lg">{title}</h4>
                    <p className="text-slate-400 text-xs font-bold mt-1">{description}</p>
                </div>
            </div>
            <button
                className={`w-14 h-8 rounded-full transition-colors relative ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${checked ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>
    )
}

function SaveChangesButton({ onClick, loading }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            <Save size={20} className={loading ? 'animate-spin' : 'group-hover:animate-bounce'} />
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
    )
}

function SystemStatusCard() {
    const [status, setStatus] = useState('operational'); // operational, offline
    const [lastChecked, setLastChecked] = useState('Just now');

    useEffect(() => {
        // Ensure this only runs on the client
        if (typeof window === 'undefined') return;

        const updateStatus = () => {
            if (navigator.onLine) {
                setStatus('operational');
            } else {
                setStatus('offline');
            }
            setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        // Initial check
        updateStatus();

        // Periodic check simulation
        const interval = setInterval(() => {
            setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 60000);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className={`mt-8 bg-gradient-to-br backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl text-center transition-colors duration-500
            ${status === 'operational' ? 'from-indigo-900/50 to-blue-900/50' : 'from-rose-900/50 to-red-900/50'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-500
                ${status === 'operational' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {status === 'operational' ? <Shield size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-white font-bold text-lg">System Status</h3>
            <p className={`font-bold mt-1 text-sm transition-colors duration-500 ${status === 'operational' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status === 'operational' ? 'All Systems Operational' : 'System Offline / Disconnected'}
            </p>
            <p className="text-slate-400 text-xs mt-4">Last checked: {lastChecked}</p>
        </div>
    );
}
