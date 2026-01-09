import { db as firestore } from "@/lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";

// Types
export interface Customer {
    id: number;
    name: string;
    contact: string;
    phone: string;
    city: string;
    status: "Active" | "Inactive";
    balance: string;
    email?: string;
    address?: string;
}

export interface Expense {
    id: number;
    title: string;
    party: string;
    amount: number;
    date: string;
    category: string;
    method: string;
    status: string;
    notes?: string;
    image?: string;
    createdBy?: string;
}

export interface Collection {
    id: string;
    customer: string;
    staff: string;
    amount: string;
    status: "Paid" | "Processing" | "Failed" | "Visit";
    date: string;
    mode: "Cash" | "UPI" | "Cheque";
    time: string;
    contact: string;
    remarks: string;
    image?: string;
}

export interface Staff {
    id: number;
    name: string;
    phone: string;
    role: string;
    status: "Active" | "Inactive" | "On Leave";
    collectedToday: number;
    joined: string;
    email?: string;
    zone?: string;
    address?: string;
    pin?: string; // Security PIN for login
    employeeId?: string;
    lastSeen?: number; // Timestamp for online status
}

// Keys
const STORAGE_KEYS = {
    CUSTOMERS: 'admin_customers_v3',
    EXPENSES: 'admin_expenses_v3',
    COLLECTIONS: 'admin_collections_v3',
    DEALERS: 'admin_dealers_v3',
    STAFF: 'admin_staff_v3',
    ZONES: 'admin_zones_v3',
    SETTINGS: 'admin_general_settings',
    COMPANY: 'admin_company_settings',
    ADMIN_PROFILE: 'admin_profile_v1',
    NOTIFICATIONS: 'admin_notification_settings_v1',
    MOBILE_PERMISSIONS: 'admin_mobile_permissions_v1',
    ALERTS: 'admin_alerts_v1',
    ADMIN_SECURITY: 'admin_security_v1'
};

export interface Zone {
    id: number;
    name: string;
}

// Initial Data (Fallback)
const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_COLLECTIONS: Collection[] = [];

const INITIAL_DEALERS: any[] = [];

const INITIAL_STAFF: Staff[] = [];

const INITIAL_ZONES: Zone[] = [];

// Helper for Safe Parsing to prevent App Crashes
const safeParse = (key: string, fallback: any) => {
    if (typeof window === 'undefined') return fallback;
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
        console.error(`Error parsing ${key} from storage:`, e);
        return fallback;
    }
};

// Helper: Remove undefined fields for Firestore (Global Scope)
const sanitizeForFirestore = (data: any) => {
    if (!data || typeof data !== 'object') return data;
    const cleanData: any = {};
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined) {
            // Recursive clean for nested objects
            cleanData[key] = (value && typeof value === 'object' && !Array.isArray(value))
                ? sanitizeForFirestore(value)
                : value;
        } else {
            cleanData[key] = null; // Convert undefined to null
        }
    });
    return cleanData;
};

// Sync Mechanism
let isSyncing = false;

export const setupFirebaseSync = () => {
    if (typeof window === 'undefined' || isSyncing) return;
    isSyncing = true;
    console.log("🔥 Starting Firebase Sync (Fixed)...");

    const mergeAndSave = (key: string, remoteData: any[], eventName: string) => {
        try {
            let local: any[] = [];
            try {
                const stored = localStorage.getItem(key);
                local = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(local)) local = [];
            } catch (e) {
                local = [];
            }
            // Create a map by ID to merge local and remote
            const map = new Map();
            local.forEach((item: any) => {
                if (item && item.id) map.set(String(item.id), item);
            });
            remoteData.forEach((item: any) => {
                if (item && item.id) map.set(String(item.id), item);
            });
            const merged = Array.from(map.values());
            localStorage.setItem(key, JSON.stringify(merged));
            window.dispatchEvent(new Event(eventName));
            console.log(`✅ Synced ${key}: ${merged.length} items`);
        } catch (e) {
            console.error(`Error syncing ${key}`, e);
        }
    };

    // 1. Customers Sync
    onSnapshot(collection(firestore, "customers"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Customer);
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.CUSTOMERS, data, 'customer-updated');
    }, (error) => console.error("Customer Sync Error:", error));

    // 3. Expenses Sync (Fixed Order)
    onSnapshot(collection(firestore, "expenses"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Expense);
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.EXPENSES, data, 'expense-updated');
    }, (error) => console.error("Expenses Sync Error:", error));

    // 2. Collections Sync
    onSnapshot(collection(firestore, "collections"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Collection);
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.COLLECTIONS, data, 'transaction-updated');
    }, (error) => console.error("Collections Sync Error:", error));

    // 4. Dealers Sync
    onSnapshot(collection(firestore, "dealers"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.DEALERS, data, 'expense-updated');
    }, (error) => console.error("Dealers Sync Error:", error));

    // 5. Staff Sync
    onSnapshot(collection(firestore, "staff"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Staff);
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.STAFF, data, 'staff-updated');
    }, (error) => console.error("Staff Sync Error:", error));

    // 6. Zones Sync
    onSnapshot(collection(firestore, "zones"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Zone);
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.ZONES, data, 'zone-updated');
    }, (error) => console.error("Zones Sync Error:", error));

    // 7. Settings & Alerts Sync
    onSnapshot(collection(firestore, "settings"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.SETTINGS, data, 'settings-updated');
    }, (error) => console.error("Settings Sync Error:", error));

    onSnapshot(collection(firestore, "alerts"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.ALERTS, data, 'alerts-updated');
    }, (error) => console.error("Alerts Sync Error:", error));

    // 8. Staff Alerts Sync
    onSnapshot(collection(firestore, "staff_alerts"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        if (data.length > 0) mergeAndSave('staff_notifications_list', data, 'staff-notif-updated');
    }, (error) => console.error("Staff Alerts Sync Error:", error));

    // 9. Admin Security Sync
    onSnapshot(collection(firestore, "admin_security"), (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        if (data.length > 0) mergeAndSave(STORAGE_KEYS.ADMIN_SECURITY, data, 'security-updated');
    }, (error) => console.error("Security Sync Error:", error));

    // 10. Cross-Tab Sync
    window.addEventListener('storage', (e) => {
        console.log(`🔄 Cross-tab sync detected for ${e.key}`);
    });
};


// Service Methods
export const db = {
    // Customers
    getCustomers: (): Customer[] => {
        return safeParse(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    },

    saveCustomer: (customer: Customer) => {
        console.log("💾 Saving customer locally:", customer);
        // 1. Optimistic Local Update
        const customers = db.getCustomers();
        const index = customers.findIndex(c => c.id === customer.id);
        const newCustomers = index >= 0
            ? customers.map(c => c.id === customer.id ? customer : c)
            : [customer, ...customers];

        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(newCustomers));

        // 2. Fire to Cloud
        console.log("☁️ Syncing customer to Firebase...");
        setDoc(doc(firestore, "customers", String(customer.id)), sanitizeForFirestore(customer))
            .then(() => console.log("✅ Firebase Sync Success"))
            .catch(e => console.error("❌ Firebase Sync Failed:", e));

        return newCustomers;
    },

    deleteCustomer: (id: number) => {
        const customers = db.getCustomers();
        const newCustomers = customers.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(newCustomers));

        // Sync
        try {
            deleteDoc(doc(firestore, "customers", String(id)));
        } catch (e) { console.error(e); }

        return newCustomers;
    },

    // Expenses
    getExpenses: (): Expense[] => {
        return safeParse(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    },

    saveExpense: (expense: Expense) => {
        const expenses = db.getExpenses();
        const index = expenses.findIndex(e => e.id === expense.id);
        const newExpenses = index >= 0
            ? expenses.map(e => e.id === expense.id ? expense : e)
            : [expense, ...expenses];

        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));

        // Dispatch events for real-time updates
        window.dispatchEvent(new Event('expense-updated'));
        window.dispatchEvent(new Event('transaction-updated'));

        // Sync
        try {
            setDoc(doc(firestore, "expenses", String(expense.id)), sanitizeForFirestore(expense));
        } catch (e) { console.error(e); }

        return newExpenses;
    },

    deleteExpense: (id: number) => {
        const expenses = db.getExpenses();
        const newExpenses = expenses.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));

        try {
            deleteDoc(doc(firestore, "expenses", String(id)));
        } catch (e) { console.error(e); }

        return newExpenses;
    },

    // Collections
    getCollections: (): Collection[] => {
        return safeParse(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    },

    saveCollection: (collection: Collection) => {
        const collections = db.getCollections();
        const index = collections.findIndex(c => c.id === collection.id);
        const newCollections = index >= 0
            ? collections.map(c => c.id === collection.id ? collection : c)
            : [collection, ...collections];

        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(newCollections));

        // DISPATCH EVENT FOR LOCAL UPDATES
        window.dispatchEvent(new Event('transaction-updated'));

        // Sync to Firestore
        try {
            setDoc(doc(firestore, "collections", collection.id), sanitizeForFirestore(collection))
                .catch(e => {
                    console.error("Sync Error:", e);
                    alert("DATA SYNC FAILED: " + e.message + "\n\nPlease take a screenshot and send it to developer.");
                });
        } catch (e: any) {
            console.error(e);
            alert("DATA SYNC ERROR: " + e.message);
        }

        return newCollections;
    },

    deleteCollection: (id: string) => {
        const collections = db.getCollections();
        const newCollections = collections.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(newCollections));

        try {
            deleteDoc(doc(firestore, "collections", id));
        } catch (e) { console.error(e); }

        return newCollections;
    },

    // Dealers
    getDealers: (): any[] => {
        return safeParse(STORAGE_KEYS.DEALERS, INITIAL_DEALERS);
    },

    updateDealer: (dealer: any) => {
        const dealers = db.getDealers();
        const newDealers = dealers.map(d => d.id === dealer.id ? dealer : d);
        localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(newDealers));

        try {
            setDoc(doc(firestore, "dealers", String(dealer.id)), dealer);
        } catch (e) { console.error(e); }

        return newDealers;
    },

    addDealer: (dealer: any) => {
        const dealers = db.getDealers();
        const newDealers = [...dealers, dealer];
        localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(newDealers));

        try {
            setDoc(doc(firestore, "dealers", String(dealer.id)), dealer);
        } catch (e) { console.error(e); }

        return newDealers;
    },

    deleteDealer: (id: number) => {
        const dealers = db.getDealers();
        const newDealers = dealers.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(newDealers));

        try {
            deleteDoc(doc(firestore, "dealers", String(id)));
        } catch (e) { console.error(e); }

        return newDealers;
    },

    // Staff
    getStaff: (): Staff[] => {
        return safeParse(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    },

    saveStaff: (staffMember: Staff) => {
        const list = db.getStaff();
        const index = list.findIndex(s => s.id === staffMember.id);
        const newList = index >= 0
            ? list.map(s => s.id === staffMember.id ? staffMember : s)
            : [...list, staffMember];

        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(newList));

        try {
            setDoc(doc(firestore, "staff", String(staffMember.id)), sanitizeForFirestore(staffMember))
                .then(() => console.log("✅ Staff Sync Success"))
                .catch(e => console.error("❌ Staff Sync Failed:", e));
        } catch (e) {
            console.error("❌ Staff Sync Error:", e);
        }
        return newList;
    },

    deleteStaff: (id: number) => {
        const list = db.getStaff();
        const newList = list.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(newList));

        try {
            deleteDoc(doc(firestore, "staff", String(id)));
        } catch (e) { console.error(e); }

        return newList;
    },

    updateStaffLastSeen: (id: number) => {
        const list = db.getStaff();
        const index = list.findIndex(s => s.id === id);
        if (index === -1) return;

        const staff = list[index];
        const now = Date.now();

        staff.lastSeen = now;
        list[index] = staff;
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));

        // Firestore sync (fire and forget)
        try {
            setDoc(doc(firestore, "staff", String(id)), { lastSeen: now }, { merge: true });
        } catch (e) {
            // silent fail for heartbeat
        }

        window.dispatchEvent(new Event('staff-updated'));
    },

    updateStaffPin: (id: number, newPin: string) => {
        const list = db.getStaff();
        const index = list.findIndex(s => s.id === id);
        if (index === -1) return false;

        const staff = list[index];
        staff.pin = newPin;
        list[index] = staff;
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));

        // Firestore sync
        try {
            setDoc(doc(firestore, "staff", String(id)), { pin: newPin }, { merge: true });
        } catch (e) {
            console.error("Failed to sync PIN", e);
        }

        window.dispatchEvent(new Event('staff-updated'));
        return true;
    },

    // --- ZONES ---
    getZones: (): Zone[] => {
        return safeParse(STORAGE_KEYS.ZONES, INITIAL_ZONES);
    },

    saveZone: (zone: Zone) => {
        const zones = db.getZones();
        const existingIndex = zones.findIndex(z => z.id === zone.id);

        let updatedZones;
        if (existingIndex >= 0) {
            updatedZones = [...zones];
            updatedZones[existingIndex] = zone;
        } else {
            updatedZones = [...zones, zone];
        }

        localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(updatedZones));
        window.dispatchEvent(new Event('zone-updated'));

        try {
            setDoc(doc(firestore, "zones", String(zone.id)), zone);
        } catch (e) { console.error(e); }

        return updatedZones;
    },

    deleteZone: (id: number) => {
        const zones = db.getZones();
        const updatedZones = zones.filter(z => z.id !== id);
        localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(updatedZones));
        window.dispatchEvent(new Event('zone-updated'));

        try {
            deleteDoc(doc(firestore, "zones", String(id)));
        } catch (e) { console.error(e); }

        return updatedZones;
    },

    // --- APP SETTINGS ---
    getAppSettings: () => {
        return safeParse(STORAGE_KEYS.SETTINGS, {
            appName: 'Aarya Technologies',
            dateFormat: 'DD/MM/YYYY',
            financialYear: 'April 1st',
            currency: 'INR (₹)',
            language: 'English',
            timezone: '(GMT+05:30) India Standard Time',
            theme: 'Dark Mode',
            rowsPerPage: '10',
            lowBalanceThreshold: '5000'
        });
    },

    saveAppSettings: (settings: any) => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        window.dispatchEvent(new Event('settings-updated'));
        return settings;
    },

    // --- COMPANY SETTINGS ---
    getCompanyDetails: () => {
        return safeParse(STORAGE_KEYS.COMPANY, {
            name: 'Aarya Technologies',
            gst: '24ABCDE1234F1Z5',
            email: 'admin@aaryatech.com',
            mobile: '+91 98765 43210',
            website: 'www.aaryatech.com',
            address: '405, Silicon Valley, Near Shivranjani Cross Roads, Satellite, Ahmedabad - 380015',
            logo: ''
        });
    },

    saveCompanyDetails: (details: any) => {
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(details));

        // Also sync App Name to General Settings if changed in Company Details
        const currentSettings = db.getAppSettings();
        if (details.name && currentSettings.appName !== details.name) {
            currentSettings.appName = details.name;
            db.saveAppSettings(currentSettings);
        }

        window.dispatchEvent(new Event('company-updated'));
        return details;
    },

    // --- ADMIN PROFILE ---
    getAdminProfile: () => {
        return safeParse(STORAGE_KEYS.ADMIN_PROFILE, { name: 'Jayesh Bhai', role: 'Administrator', avatar: '', email: 'admin@aaryatech.com' });
    },

    saveAdminProfile: (profile: any) => {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(profile));
        window.dispatchEvent(new Event('admin-profile-updated'));
        return profile;
    },

    // --- NOTIFICATIONS ---
    getNotificationSettings: () => {
        return safeParse(STORAGE_KEYS.NOTIFICATIONS, { dailyReport: true, paymentAlerts: true, staffLogin: false, lowBalance: true, updates: true });
    },

    saveNotificationSettings: (settings: any) => {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(settings));
        window.dispatchEvent(new Event('notifications-updated'));
        return settings;
    },

    // --- MOBILE APP PERMISSIONS ---
    getMobilePermissions: () => {
        return safeParse(STORAGE_KEYS.MOBILE_PERMISSIONS, {
            requireGPS: false,
            allowBackdated: true,
            showCustomerContact: true,
            allowShareReceipt: true,
            enforceBiometric: false
        });
    },

    saveMobilePermissions: (perms: any) => {
        localStorage.setItem(STORAGE_KEYS.MOBILE_PERMISSIONS, JSON.stringify(perms));
        window.dispatchEvent(new Event('mobile-permissions-updated'));
        return perms;
    },

    // --- NOTIFICATION DATA (ALERTS) ---
    getNotifications: () => {
        return safeParse(STORAGE_KEYS.ALERTS, []);
    },

    addNotification: (notif: any) => {
        // Check preferences first
        const settings = db.getNotificationSettings();
        // Simple mapping: 'payment' -> paymentAlerts, 'system' -> updates
        if (notif.type === 'payment' && !settings.paymentAlerts) return;
        if (notif.type === 'system' && !settings.updates) return;

        const list = db.getNotifications();
        const newList = [notif, ...list].slice(0, 50); // Keep last 50
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(newList));
        window.dispatchEvent(new Event('alerts-updated'));
        return newList;
    },

    markNotificationsRead: () => {
        const list = db.getNotifications();
        const newList = list.map((n: any) => ({ ...n, read: true }));
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(newList));
        window.dispatchEvent(new Event('alerts-updated'));
    },

    requestHandover: (staffName: string, amount: number) => {
        const id = Date.now();
        const notif = {
            id,
            title: "Handover Requested",
            desc: `${staffName} has requested to settle ₹${amount.toLocaleString('en-IN')}`,
            time: "Just now",
            type: "alert",
            path: "/admin/dashboard", // Opens dashboard where handover modal is
            read: false
        };
        db.addNotification(notif);

        // Push to Firestore
        try {
            setDoc(doc(firestore, "alerts", String(id)), notif)
                .then(() => console.log("✅ Admin Alert Sync Success"))
                .catch(e => console.error("❌ Admin Alert Sync Failed:", e));
        } catch (e) { console.error("Firestore Error:", e); }

        return true;
    },

    clearNotifications: () => {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
        window.dispatchEvent(new Event('alerts-updated'));
    },

    // --- STAFF NOTIFICATIONS (Admin -> Staff) ---
    getStaffNotifications: (staffName?: string) => {
        const all = safeParse('staff_notifications_list', []);
        if (!staffName) return all;
        // Filter by targetStaff name (assuming 'targetStaff' field exists, or logic in sendStaffNotification puts it there)
        // Wait, looking at sendStaffNotification, does it save targetStaff?
        // Let's check sendStaffNotification first.
        // If it sends to specific staff, the notification object should have a field.
        // If not, we might be filtering by who requested?
        // Let's look at sendStaffNotification implementation below.
        return all.filter((n: any) => !n.targetStaff || n.targetStaff === staffName);
    },

    sendStaffNotification: (message: string) => {
        const id = Date.now();
        const newNotif = {
            id,
            message,
            read: false,
            timestamp: id
        };
        const list = db.getStaffNotifications();
        list.unshift(newNotif);
        if (list.length > 20) list.pop();

        localStorage.setItem('staff_notifications_list', JSON.stringify(list));
        window.dispatchEvent(new Event('staff-notif-updated'));

        // Push to Firestore
        try {
            setDoc(doc(firestore, "staff_alerts", String(id)), newNotif)
                .then(() => console.log("✅ Staff Alert Sync Success"))
                .catch(e => console.error("❌ Staff Alert Sync Failed:", e));
        } catch (e) { console.error("Firestore Error:", e); }

        return true;
    },

    acceptHandover: (staffName: string, amount: number) => {
        const id = Date.now();
        // 1. Log as Admin Collection (Cash In from Staff)
        db.saveCollection({
            id: String(id),
            customer: `HANDOVER: ${staffName}`,
            staff: 'Admin',
            amount: String(amount),
            status: 'Paid',
            date: new Date().toISOString().split('T')[0],
            mode: 'Cash',
            time: new Date().toLocaleTimeString(),
            contact: 'N/A',
            remarks: 'Cash Settlement from Staff'
        });

        // 2. Reduce Staff "Collected Today"
        const staffList = db.getStaff();
        const staff = staffList.find(s => s.name === staffName);
        if (staff) {
            // Deduct amount
            const currentHeld = staff.collectedToday || 0;
            const newHeld = Math.max(0, currentHeld - amount);
            staff.collectedToday = newHeld;

            // Save & Sync Staff
            db.saveStaff(staff);
        }

        // 3. Notify Staff
        db.sendStaffNotification(`Handover of ₹${amount.toLocaleString('en-IN')} accepted by Admin.`);

        return true;
    },

    // --- HELPERS ---
    formatDate: (dateInput: string | Date) => {
        const settings = db.getAppSettings();
        const format = settings.dateFormat || 'DD/MM/YYYY';
        const date = new Date(dateInput);

        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();

        if (format === 'MM/DD/YYYY') return `${m}/${d}/${y}`;
        if (format === 'YYYY-MM-DD') return `${y}-${m}-${d}`;
        return `${d}/${m}/${y}`; // Default DD/MM/YYYY
    },

    getRowsPerPage: () => {
        const settings = db.getAppSettings();
        return parseInt(settings.rowsPerPage) || 10;
    },

    getLowBalanceThreshold: () => {
        const settings = db.getAppSettings();
        return parseInt(settings.lowBalanceThreshold) || 5000;
    },

    getFinancialYear: () => {
        const settings = db.getAppSettings();
        const startMonth = settings.financialYear === 'January 1st' ? 0 : 3; // 0=Jan, 3=April
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        if (startMonth === 0) {
            return `FY ${year}`;
        } else {
            // April 1st logic
            if (month >= 3) {
                return `FY ${year}-${String(year + 1).slice(-2)}`;
            } else {
                return `FY ${year - 1}-${String(year).slice(-2)}`;
            }
        }
    },

    resetAllData: async () => {
        if (typeof window !== 'undefined') {
            try {
                // Wipe Firestore Collections
                const collections = ['customers', 'expenses', 'collections', 'dealers', 'staff', 'zones', 'alerts', 'staff_alerts'];
                for (const colName of collections) {
                    const snapshot = await getDocs(collection(firestore, colName));
                    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(deletePromises);
                    console.log(`🔥 Deleted all docs in ${colName}`);
                }
            } catch (error) {
                console.error("Error wiping Firestore:", error);
                alert("Failed to wipe server data. Check console.");
            }

            // Wipe Local
            localStorage.clear();
        }
    },

    // --- ADMIN SECURITY ---
    getAdminSecurity: () => {
        const defaultSecurity = {
            pin: '1234',
            twoFactor: false,
            forceLogout: true
        };

        const data = safeParse(STORAGE_KEYS.ADMIN_SECURITY, defaultSecurity);

        // Handle if sync saved it as an array (from generic mergeAndSave)
        if (Array.isArray(data)) {
            const found = data.find((d: any) => d.id === 'main') || data[0];
            return found ? { ...defaultSecurity, ...found } : defaultSecurity;
        }

        // Ensure PIN is always a string
        if (data && typeof data.pin === 'number') {
            data.pin = String(data.pin);
        }

        return { ...defaultSecurity, ...data };
    },

    saveAdminSecurity: (security: any) => {
        // Validation: Ensure PIN is string
        if (typeof security.pin === 'number') security.pin = String(security.pin);

        localStorage.setItem(STORAGE_KEYS.ADMIN_SECURITY, JSON.stringify(security));
        window.dispatchEvent(new Event('security-updated'));

        // Sync to Firestore (Use a fixed ID 'main' for single admin config)
        try {
            const docId = 'main_security_config'; // Single document for admin settings
            // We need to wrap it in an object that looks like it belongs in a collection if we used list logic,
            // but for security config we usually want a single doc.
            // However, our mergeAndSave logic expects an ARRAY of items with IDs.
            // Let's adapt: We will store it as a collection "admin_security" with one doc "main"
            // and the object will have id: "main"
            const dataToSave = { ...security, id: 'main' };
            setDoc(doc(firestore, "admin_security", "main"), dataToSave);
        } catch (e) { console.error("Security Sync Error", e); }

        return security;
    },

    verifyAdminPin: (inputPin: string) => {
        const security = db.getAdminSecurity();
        // Robust comparison (handle number vs string from storage)
        return String(security.pin) === inputPin;
    },

    forceSync: async () => {
        if (typeof window === 'undefined') return;
        console.log("🔄 Starting Forced Sync...");

        try {
            // 1. Sync Customers
            const customers = db.getCustomers();
            for (const c of customers) {
                await setDoc(doc(firestore, "customers", String(c.id)), sanitizeForFirestore(c));
            }

            // 2. Sync Expenses
            const expenses = db.getExpenses();
            for (const e of expenses) {
                await setDoc(doc(firestore, "expenses", String(e.id)), sanitizeForFirestore(e));
            }

            // 3. Sync Collections
            const collections = db.getCollections();
            for (const c of collections) {
                await setDoc(doc(firestore, "collections", c.id), sanitizeForFirestore(c));
            }

            // 4. Sync Staff
            const staff = db.getStaff();
            for (const s of staff) {
                await setDoc(doc(firestore, "staff", String(s.id)), sanitizeForFirestore(s));
            }

            // 5. Sync Dealers
            const dealers = db.getDealers();
            for (const d of dealers) {
                await setDoc(doc(firestore, "dealers", String(d.id)), d);
            }

            // 6. Sync Zones
            const zones = db.getZones();
            for (const z of zones) {
                await setDoc(doc(firestore, "zones", String(z.id)), z);
            }

            console.log("✅ Force Sync Completed Successfully");
            return true;
        } catch (error) {
            console.error("❌ Force Sync Failed:", error);
            throw error;
        }
    }
};
