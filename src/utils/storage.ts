// Enhanced Storage Utility with Real-time Synchronization
// Version 2.0 - Supports cross-tab sync, validation, and versioning

export interface StorageConfig {
    version: number;
    lastModified: string;
}

// Storage event listener for cross-tab synchronization
export const setupStorageSync = (callback: (key: string, newValue: any) => void) => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key && e.newValue) {
            try {
                const parsedValue = JSON.parse(e.newValue);
                callback(e.key, parsedValue);
            } catch (error) {
                console.error('Error parsing storage event:', error);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
};

// Enhanced load with validation
export const loadFromStorage = <T = any>(key: string, defaultData: T): T => {
    if (typeof window === 'undefined') return defaultData;
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return defaultData;

        const parsed = JSON.parse(stored);

        // Validate data structure (basic check)
        if (typeof parsed !== typeof defaultData) {
            console.warn(`Data type mismatch for ${key}, using default`);
            return defaultData;
        }

        return parsed;
    } catch (error) {
        console.error(`Error loading ${key} from storage`, error);
        return defaultData;
    }
};

// Enhanced save with metadata
export const saveToStorage = (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(data));

        // Update metadata
        const meta: StorageConfig = {
            version: 1,
            lastModified: new Date().toISOString()
        };
        localStorage.setItem(`${key}_meta`, JSON.stringify(meta));
    } catch (error) {
        console.error(`Error saving ${key} to storage`, error);

        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.error('Storage quota exceeded. Consider clearing old data.');
        }
    }
};

// Batch save for multiple keys
export const batchSave = (items: Record<string, any>) => {
    Object.entries(items).forEach(([key, value]) => {
        saveToStorage(key, value);
    });
};

// Clear specific keys
export const clearStorage = (keys: string[]) => {
    if (typeof window === 'undefined') return;
    keys.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_meta`);
    });
};

// Export all data (for backup)
export const exportAllData = () => {
    if (typeof window === 'undefined') return null;
    const data: Record<string, any> = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.endsWith('_meta')) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch {
                    data[key] = value;
                }
            }
        }
    }

    return data;
};

// Import data (for restore)
export const importData = (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
        saveToStorage(key, value);
    });
};

// Initial Data for Fallback
export const INITIAL_CUSTOMERS = [];

export const INITIAL_TRANSACTIONS = [];

// Goal configuration
export interface GoalConfig {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    target: number;
    current: number;
    startDate: string;
    endDate: string;
}

export const INITIAL_GOALS: Record<string, GoalConfig> = {
    daily: {
        period: 'daily',
        target: 50000,
        current: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    },
    weekly: {
        period: 'weekly',
        target: 300000,
        current: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    monthly: {
        period: 'monthly',
        target: 1200000,
        current: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    },
    yearly: {
        period: 'yearly',
        target: 15000000,
        current: 0,
        startDate: `${new Date().getFullYear()}-01-01`,
        endDate: `${new Date().getFullYear()}-12-31`
    }
};
