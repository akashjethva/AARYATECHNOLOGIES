"use client";

import { Save, User, Bell, Shield, Database, Layout, Building2, Smartphone, Lock, History, Upload, Mail, Globe, CreditCard, MapPin, Plus, Trash2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Layout },
        { id: 'company', label: 'Company Profile', icon: Building2 },
        { id: 'zones', label: 'Zones & Areas', icon: MapPin },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'backup', label: 'Backup & Data', icon: Database },
    ];

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Mobile Tabs (Horizontal Scroll) */}
                <div className="md:hidden w-full sticky top-0 z-30 pt-4 pb-2 bg-[#0f172a]/80 backdrop-blur-xl">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x px-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm snap-start border ${activeTab === tab.id
                                    ? 'bg-[#1e293b] border-indigo-500 text-indigo-400 shadow-indigo-500/10'
                                    : 'bg-[#1e293b] border-white/10 text-slate-400'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Sidebar Navigation */}
                <div className="hidden md:block w-80 shrink-0">
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
                        <div className="mt-8 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl text-center">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-white font-bold text-lg">System Status</h3>
                            <p className="text-emerald-400 font-bold mt-1 text-sm">All Systems Operational</p>
                            <p className="text-slate-400 text-xs mt-4">Last checked: Just now</p>
                        </div>
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
        appName: "Payment Soft Admin",
        currency: "INR (₹)",
        language: "English",
        timezone: "(GMT+05:30) India Standard Time",
        dateFormat: "DD/MM/YYYY",
        financialYear: "April 1st",
        theme: "Dark Mode",
        rowsPerPage: "10"
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('payment_app_settings');
        if (saved) {
            try {
                setSettings({ ...settings, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('payment_app_settings', JSON.stringify(settings));
            setLoading(false);
            setNotification("Settings saved successfully!");
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-bold"
                    >
                        <CheckCircle size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 className="text-2xl font-bold text-white mb-2">General Settings</h3>
                <p className="text-slate-400">Configure basic application preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup
                    label="Application Name"
                    value={settings.appName}
                    onChange={(e: any) => handleChange('appName', e.target.value)}
                    placeholder="Enter app name"
                />
                <SelectGroup
                    label="Currency"
                    options={['INR (₹)', 'USD ($)', 'EUR (€)']}
                    value={settings.currency}
                    onChange={(e: any) => handleChange('currency', e.target.value)}
                />
                <SelectGroup
                    label="Language"
                    options={['English', 'Gujarati', 'Hindi']}
                    value={settings.language}
                    onChange={(e: any) => handleChange('language', e.target.value)}
                />
                <SelectGroup
                    label="Timezone"
                    options={['(GMT+05:30) India Standard Time', '(GMT+00:00) UTC', '(GMT-05:00) Eastern Time']}
                    value={settings.timezone}
                    onChange={(e: any) => handleChange('timezone', e.target.value)}
                />
                <SelectGroup
                    label="Date Format"
                    options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
                    value={settings.dateFormat}
                    onChange={(e: any) => handleChange('dateFormat', e.target.value)}
                />
                <SelectGroup
                    label="Financial Year Start"
                    options={['April 1st', 'January 1st']}
                    value={settings.financialYear}
                    onChange={(e: any) => handleChange('financialYear', e.target.value)}
                />
                <SelectGroup
                    label="Theme Preference"
                    options={['Dark Mode', 'Light Mode', 'System Default']}
                    value={settings.theme}
                    onChange={(e: any) => handleChange('theme', e.target.value)}
                />
                <SelectGroup
                    label="Default Rows Per Page"
                    options={['10', '25', '50', '100']}
                    value={settings.rowsPerPage}
                    onChange={(e: any) => handleChange('rowsPerPage', e.target.value)}
                />
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-center">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>
        </div>
    );
}

function CompanySettings() {
    const [settings, setSettings] = useState({
        companyName: "Aarya Technologies",
        gstNumber: "24ABCDE1234F1Z5",
        email: "admin@aaryatech.com",
        website: "www.aaryatech.com",
        address: "405, Silicon Valley, Near Shivranjani Cross Roads, Satellite, Ahmedabad - 380015",
        logo: "" // Store Base64 string
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('payment_app_company_settings');
        if (saved) {
            try {
                setSettings({ ...settings, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse company settings", e);
            }
        }
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large! Please upload a file smaller than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            try {
                localStorage.setItem('payment_app_company_settings', JSON.stringify(settings));
                setNotification("Company profile updated!");
            } catch (e) {
                console.error("Storage limit exceeded", e);
                setNotification("Error: Image too large for local storage.");
            }
            setLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-bold"
                    >
                        <CheckCircle size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Company Profile</h3>
                <p className="text-slate-400">Manage your business details and branding.</p>
            </div>

            <div className="flex items-center gap-6 p-6 bg-[#0f172a]/50 rounded-2xl border border-white/5">
                <label className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-slate-600 relative overflow-hidden group cursor-pointer hover:border-indigo-500 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />

                    {settings.logo ? (
                        <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Upload size={24} className="text-slate-400 group-hover:text-white transition-colors" />
                    )}

                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white">Change</span>
                    </div>
                </label>
                <div>
                    <h4 className="text-white font-bold text-lg">Company Logo</h4>
                    <p className="text-slate-400 text-sm mt-1">Recommended size: 512x512px. Max 2MB.</p>
                    {settings.logo && (
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, logo: "" }))}
                            className="text-rose-400 text-xs font-bold mt-2 hover:text-rose-300"
                        >
                            Remove Logo
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup
                    label="Company Name"
                    value={settings.companyName}
                    onChange={(e: any) => handleChange('companyName', e.target.value)}
                />
                <InputGroup
                    label="GST / VAT Number"
                    value={settings.gstNumber}
                    onChange={(e: any) => handleChange('gstNumber', e.target.value)}
                />
                <InputGroup
                    label="Email Address"
                    value={settings.email}
                    onChange={(e: any) => handleChange('email', e.target.value)}
                    icon={<Mail size={16} />}
                />
                <InputGroup
                    label="Website"
                    value={settings.website}
                    onChange={(e: any) => handleChange('website', e.target.value)}
                    icon={<Globe size={16} />}
                />
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Address</label>
                    <textarea
                        rows={3}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600 resize-none"
                        value={settings.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                    ></textarea>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-center">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>
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

    const handleAddZone = () => {
        if (!newZone.trim()) return;
        setZones([...zones, { id: Date.now(), name: newZone, active_staff: 0, collections: '₹ 0' }]);
        setNewZone('');
    };

    const handleDeleteZone = (id: number) => {
        setZones(zones.filter(z => z.id !== id));
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

            <div className="pt-8 border-t border-white/5 flex justify-center">
                <SaveChangesButton />
            </div>
        </div>
    );
}

// ... existing NotificationSettings, SecuritySettings, BackupSettings etc.

function NotificationSettings() {
    const [notifications, setNotifications] = useState({
        dailyReport: true,
        newPayment: true,
        staffLogin: false,
        lowBalance: true,
        systemUpdates: true
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('payment_app_notification_settings');
        if (saved) {
            try {
                setNotifications({ ...notifications, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse notification settings", e);
            }
        }
    }, []);

    const handleToggle = (key: string) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('payment_app_notification_settings', JSON.stringify(notifications));
            setLoading(false);
            setNotification("Notification preferences saved!");
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-bold"
                    >
                        <CheckCircle size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Notifications</h3>
                <p className="text-slate-400">Control how and when you receive alerts.</p>
            </div>

            <div className="space-y-4">
                <ToggleItem
                    title="Daily Collection Report"
                    description="Receive a daily summary of total collections via SMS/Email."
                    checked={notifications.dailyReport}
                    onChange={() => handleToggle('dailyReport')}
                />
                <ToggleItem
                    title="New Payment Alerts"
                    description="Get notified instantly when a staff member adds a new entry."
                    checked={notifications.newPayment}
                    onChange={() => handleToggle('newPayment')}
                />
                <ToggleItem
                    title="Staff Login Alerts"
                    description="Notify admin when staff members log in to their app."
                    checked={notifications.staffLogin}
                    onChange={() => handleToggle('staffLogin')}
                />
                <ToggleItem
                    title="Low Balance Warnings"
                    description="Alert when customer credit limit is exceeded."
                    checked={notifications.lowBalance}
                    onChange={() => handleToggle('lowBalance')}
                />
                <ToggleItem
                    title="System Updates"
                    description="Receive notifications about software updates and maintenance."
                    checked={notifications.systemUpdates}
                    onChange={() => handleToggle('systemUpdates')}
                />
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-center">
                <SaveChangesButton onClick={handleSave} loading={loading} />
            </div>
        </div>
    )
}

function SecuritySettings() {
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [securityPrefs, setSecurityPrefs] = useState({
        twoFactor: false,
        forceLogout: true
    });
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('payment_app_security_settings');
        if (saved) {
            try {
                setSecurityPrefs(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse security settings", e);
            }
        }
        const savedRecovery = localStorage.getItem('payment_app_recovery_settings');
        if (savedRecovery) setRecoveryEmail(savedRecovery);
    }, []);

    const handleSaveRecovery = () => {
        if (!recoveryEmail) return;
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('payment_app_recovery_settings', recoveryEmail);
            setLoading(false);
            setNotification("Recovery contact updated!");
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    const handleToggle = (key: string) => {
        const newPrefs = { ...securityPrefs, [key]: !securityPrefs[key as keyof typeof securityPrefs] };
        setSecurityPrefs(newPrefs);
        localStorage.setItem('payment_app_security_settings', JSON.stringify(newPrefs));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setNotification("Error: All fields are required.");
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setNotification("Error: Passwords do not match.");
            setTimeout(() => setNotification(null), 3000);
            return;
        }
        if (passwords.new.length < 6) {
            setNotification("Error: Password must be at least 6 chars.");
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setNotification("Password updated successfully!");
            setPasswords({ current: "", new: "", confirm: "" });
            setTimeout(() => setNotification(null), 3000);
        }, 1500);
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className={`absolute top-0 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-bold text-white ${notification.startsWith('Error') ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    >
                        {notification.startsWith('Error') ? <Lock size={20} /> : <CheckCircle size={20} />}
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

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
                        name="current"
                        value={passwords.current}
                        onChange={handlePasswordChange}
                        placeholder="Current Password"
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                    <input
                        type="password"
                        name="new"
                        value={passwords.new}
                        onChange={handlePasswordChange}
                        placeholder="New Password (min 6 chars)"
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                    <input
                        type="password"
                        name="confirm"
                        value={passwords.confirm}
                        onChange={handlePasswordChange}
                        placeholder="Confirm New Password"
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        Update Password
                    </button>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl md:w-2/3">
                <div className="flex items-center gap-3 mb-4">
                    <Mail className="text-blue-400" size={24} />
                    <h4 className="text-lg font-bold text-blue-100">Account Recovery</h4>
                </div>
                <div className="space-y-4">
                    <p className="text-slate-400 text-sm">If you forget your password, we'll send instructions to this contact.</p>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            placeholder="Enter Recovery Email or Phone"
                            className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleSaveRecovery}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all shrink-0"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <ToggleItem
                    title="Two-Factor Authentication (2FA)"
                    description="Require an OTP code in addition to password for login."
                    checked={securityPrefs.twoFactor}
                    onChange={() => handleToggle('twoFactor')}
                />
                <ToggleItem
                    title="Force Logout Inactive Staff"
                    description="Automatically logout staff apps after 1 hour of inactivity."
                    checked={securityPrefs.forceLogout}
                    onChange={() => handleToggle('forceLogout')}
                />
            </div>
        </div>
    )
}

function BackupSettings() {
    const [lastBackup, setLastBackup] = useState("Never");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    // Load Last Backup Date
    useEffect(() => {
        const saved = localStorage.getItem('payment_app_last_backup');
        if (saved) setLastBackup(saved);
    }, []);

    const handleBackup = () => {
        setLoading(true);
        // Simulate backup process
        setTimeout(() => {
            const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
            localStorage.setItem('payment_app_last_backup', date);
            setLastBackup(date);
            setLoading(false);
            setNotification("Manual backup completed successfully!");
            setTimeout(() => setNotification(null), 3000);
        }, 2000);
    };

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-bold"
                    >
                        <CheckCircle size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h3 className="text-2xl font-bold text-white mb-2">Data Management</h3>
                <p className="text-slate-400">Backup and restore your application data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-40">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Last Backup</p>
                        <h4 className="text-2xl font-bold text-white">{lastBackup}</h4>
                        <p className="text-slate-500 text-sm">{lastBackup === "Never" ? "No backup found" : "Manual Backup"}</p>
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

            <div className="pt-6 flex justify-center">
                <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-transform active:scale-95 flex items-center gap-3"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Upload size={20} />}
                    {loading ? "Backing up..." : "Backup Now"}
                </button>
            </div>
            <p className="text-slate-500 mt-4 text-sm">Manual backups are saved to your local server storage.</p>
        </div>
    )
}

/* Helper Components */
function InputGroup({ label, value, onChange, placeholder, icon, defaultValue }: any) {
    return (
        <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
                <input
                    type="text"
                    value={value}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-[#0f172a] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-bold text-lg placeholder:text-slate-600 ${icon ? 'pl-12' : ''}`}
                />
            </div>
        </div>
    );
}

function SelectGroup({ label, options, value, onChange, defaultValue }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    defaultValue={defaultValue}
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

function ToggleItem({ title, description, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-white/5">
            <div>
                <h4 className="font-bold text-white">{title}</h4>
                <p className="text-slate-400 text-xs mt-1">{description}</p>
            </div>
            <button
                onClick={onChange}
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
            className={`bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group ${loading ? 'opacity-70 cursor-wait' : ''}`}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <Save size={20} className="group-hover:animate-bounce" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
    )
}
