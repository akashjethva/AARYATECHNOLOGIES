export const loadFromStorage = (key: string, defaultData: any) => {
    if (typeof window === 'undefined') return defaultData;
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultData;
    } catch (error) {
        console.error(`Error loading ${key} from storage`, error);
        return defaultData;
    }
};

export const saveToStorage = (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to storage`, error);
    }
};

// Initial Data for Fallback
export const INITIAL_CUSTOMERS = [
    { id: 1, name: "Shiv Shakti Traders", contact: "Rajesh Bhai", phone: "+91 98765 11223", city: "Ahmedabad", status: "Active", balance: "15,200", email: "shivshakti@gmail.com", address: "123, Market Yard, Naroda", zone: "East" },
    { id: 2, name: "Jay Mataji Store", contact: "Vikram Sinh", phone: "+91 91234 99887", city: "Surat", status: "Active", balance: "8,500", email: "jaymataji@gmail.com", address: "45, Varachha Road", zone: "West" },
    { id: 3, name: "Om Enterprise", contact: "Amit Shah", phone: "+91 99887 55443", city: "Vadodara", status: "Inactive", balance: "0", email: "om.ent@gmail.com", address: "88, Alkapuri", zone: "Central" },
    { id: 4, name: "Ganesh Provision", contact: "Suresh Patel", phone: "+91 98980 12345", city: "Rajkot", status: "Active", balance: "12,500", email: "ganesh.prov@gmail.com", address: "12, Soni Bazar", zone: "North" },
    { id: 5, name: "Maruti Nandan", contact: "Vikram Solanki", phone: "+91 97654 32109", city: "Surat", status: "Active", balance: "2,100", email: "maruti@gmail.com", address: "Ring Road, Surat", zone: "South" },
    { id: 6, name: "Khodiyar General", contact: "Ketan Bhai", phone: "+91 99000 88777", city: "Ahmedabad", status: "Inactive", balance: "45,000", email: "khodiyar@gmail.com", address: "Gota, Ahmedabad", zone: "North" },
    { id: 7, name: "Umiya Traders", contact: "Praveen Patel", phone: "+91 88776 65544", city: "Mehsana", status: "Active", balance: "8,900", email: "umiya@gmail.com", address: "Highway Road", zone: "North" },
    { id: 8, name: "Balaji Kirana", contact: "Ramesh Gupta", phone: "+91 77665 54433", city: "Vadodara", status: "Active", balance: "5,600", email: "balaji@gmail.com", address: "Manjalpur", zone: "South" },
    { id: 9, name: "Sardar Stores", contact: "Manish Singh", phone: "+91 66554 43322", city: "Rajkot", status: "Inactive", balance: "0", email: "sardar@gmail.com", address: "Yagnik Road", zone: "West" },
];

export const INITIAL_TRANSACTIONS = [
    { id: "REC-001", customer: "Shiv Shakti Traders", staff: "Rahul V.", amount: "5,000", status: "Paid", date: "2024-01-02", mode: "Cash", time: "10:45 AM", contact: "+91 98765 43210", remarks: "Monthly payment received." },
    { id: "REC-002", customer: "Jay Mataji Store", staff: "Amit K.", amount: "2,200", status: "Paid", date: "2024-01-02", mode: "UPI", time: "11:15 AM", contact: "+91 91234 56789", remarks: "UPI Ref: 1234567890" },
    { id: "REC-003", customer: "Om Enterprise", staff: "Rahul V.", amount: "10,000", status: "Processing", date: "2024-01-01", mode: "Cheque", time: "02:30 PM", contact: "+91 88997 76655", remarks: "Cheque deposit pending clearance." },
    { id: "REC-004", customer: "Ganesh Provision", staff: "Suresh P.", amount: "1,500", status: "Paid", date: "2024-01-01", mode: "Cash", time: "09:00 AM", contact: "+91 76543 21098", remarks: "" },
    { id: "REC-005", customer: "Maruti Traders", staff: "Vikram S.", amount: "8,500", status: "Paid", date: "2024-01-01", mode: "Cash", time: "04:45 PM", contact: "+91 99887 76655", remarks: "Partial payment." },
    { id: "REC-006", customer: "Krishna General", staff: "Amit K.", amount: "3,200", status: "Paid", date: "2024-01-01", mode: "UPI", time: "01:20 PM", contact: "+91 66554 43322", remarks: "Scanning issue fixed." },
    { id: "REC-007", customer: "Balaji Snacks", staff: "Rahul V.", amount: "4,100", status: "Failed", date: "2023-12-31", mode: "UPI", time: "06:10 PM", contact: "+91 55443 32211", remarks: "Transaction failed from bank side." },
    { id: "REC-008", customer: "Riya Novelty", staff: "Suresh P.", amount: "1,200", status: "Paid", date: "2023-12-30", mode: "Cash", time: "10:00 AM", contact: "+91 98765 12345", remarks: "" },
];
