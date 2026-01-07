import { useState, useEffect } from 'react';

export const useCurrency = () => {
    const [currency, setCurrency] = useState('INR'); // Default fallback
    const [locale, setLocale] = useState('en-IN'); // Default fallback

    const updateCurrency = () => {
        try {
            const saved = localStorage.getItem('admin_general_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                const currencyStr = settings.currency || 'INR (₹)';

                // Parse "INR (₹)" to get "INR"
                if (currencyStr.includes('USD')) {
                    setCurrency('USD');
                    setLocale('en-US');
                } else if (currencyStr.includes('EUR')) {
                    setCurrency('EUR');
                    setLocale('en-IE'); // English (Ireland) uses Euro
                } else {
                    setCurrency('INR');
                    setLocale('en-IN');
                }
            }
        } catch (e) {
            console.error("Failed to parse currency settings", e);
        }
    };

    useEffect(() => {
        // Initial load
        updateCurrency();

        // Listen for storage events (cross-tab)
        window.addEventListener('storage', updateCurrency);

        // Listen for custom event (same-tab)
        window.addEventListener('currency-change', updateCurrency);

        return () => {
            window.removeEventListener('storage', updateCurrency);
            window.removeEventListener('currency-change', updateCurrency);
        };
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return { currency, formatCurrency };
};
