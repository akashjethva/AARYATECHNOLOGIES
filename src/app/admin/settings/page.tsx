"use client";

import {
    Save, Building2, Bell, Shield, Database, Mail, Globe, Lock, Upload,
    CheckCircle, X, AlertCircle, Info, LayoutGrid, Users, MapPin, CreditCard,
    LayoutDashboard, Plus, Trash2, FileText, ShieldCheck, LogOut, Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: LayoutDashboard },
        { id: 'company', label: 'Company Profile', icon: Building2 },
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
                        {activeTab === 'company' && <CompanySettings />}
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
        const saved = localStorage.getItem('admin_general_settings');
        if (saved) setSettings(JSON.parse(saved));
    }, []);

    const handleChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('admin_general_settings', JSON.stringify(settings));
            // Dispatch event for instant update across app
            window.dispatchEvent(new Event('currency-change'));
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

function CompanySettings() {
    const [company, setCompany] = useState({
        name: 'Akashohk1',
        gst: '24ABCDE1234F1Z5',
        email: 'admin@aaryatech.com',
        mobile: '+91 98765 43210',
        website: 'www.aaryatech.com',
        address: '405, Silicon Valley, Near Shivranjani Cross Roads, Satellite, Ahmedabad - 380015'
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
        const saved = localStorage.getItem('admin_company_settings');
        if (saved) setCompany(JSON.parse(saved));
    }, []);

    const handleChange = (field: string, value: string) => {
        setCompany(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('admin_company_settings', JSON.stringify(company));
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
                <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-slate-600 relative overflow-hidden group cursor-pointer">
                    <Upload size={24} className="text-slate-400 group-hover:text-white transition-colors" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white">Upload</span>
                    </div>
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
    const [zones, setZones] = useState([
        { id: 1, name: 'Ahmedabad (East)', active_staff: 12, collections: '₹ 2.5L' },
        { id: 2, name: 'Surat Market', active_staff: 8, collections: '₹ 1.8L' },
        { id: 3, name: 'Vadodara Central', active_staff: 5, collections: '₹ 1.2L' },
        { id: 4, name: 'Rajkot Hub', active_staff: 4, collections: '₹ 85k' },
    ]);
    const [newZone, setNewZone] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    useEffect(() => {
        const saved = localStorage.getItem('admin_zones');
        if (saved) setZones(JSON.parse(saved));
    }, []);

    const saveZones = (updatedZones: any[]) => {
        setZones(updatedZones);
        localStorage.setItem('admin_zones', JSON.stringify(updatedZones));
    };

    const handleAddZone = () => {
        if (!newZone.trim()) return;
        const updated = [...zones, { id: Date.now(), name: newZone, active_staff: 0, collections: '₹ 0' }];
        saveZones(updated);
        setNewZone('');
        setToast({ show: true, message: 'New Zone Added Successfully!', type: 'success' });
    };

    const handleDeleteZone = (id: number) => {
        saveZones(zones.filter(z => z.id !== id));
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
                                <p className="text-slate-400 text-xs font-bold mt-0.5">{zone.active_staff} Staff Active • {zone.collections} Revenue</p>
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
        const saved = localStorage.getItem('admin_notification_settings');
        if (saved) setNotifs(JSON.parse(saved));
    }, []);

    const handleToggle = (key: string) => {
        setNotifs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('admin_notification_settings', JSON.stringify(notifs));
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

    useEffect(() => {
        const saved = localStorage.getItem('admin_security_settings');
        if (saved) setSecurity(JSON.parse(saved));
    }, []);

    const handleToggle = (key: string) => {
        const updated = { ...security, [key]: !security[key as keyof typeof security] };
        setSecurity(updated);
        localStorage.setItem('admin_security_settings', JSON.stringify(updated));
        setToast({ show: true, message: `${key === 'twoFactor' ? '2FA' : 'Force Logout'} setting updated!`, type: 'success' });
    };

    const handlePasswordUpdate = () => {
        setLoading(true);
        setTimeout(() => {
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
                    <input type="password" placeholder="Current Password" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-normal" />
                    <input type="password" placeholder="New Password" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-normal" />
                    <input type="password" placeholder="Confirm New Password" className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all font-bold placeholder:font-normal" />
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
    )
}

function BackupSettings() {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

    return (
        <div className="space-y-8">
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
