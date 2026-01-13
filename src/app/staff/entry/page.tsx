"use client";

import { ArrowLeft, Wallet, CreditCard, Camera as CameraIcon, X, User, Check, Banknote, Building2 } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db, Collection, Expense } from "@/services/db";
import jsPDF from "jspdf";

export default function StaffEntry() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'Collection',
        customer: '',
        amount: '',
        mode: 'Cash',
        category: '',
        remarks: '',
        image: null as string | null
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [dealers, setDealers] = useState<any[]>([]);

    useEffect(() => {
        // Initial load - Customers and Dealers
        setCustomers(db.getCustomers());
        setDealers(db.getDealers());
        const handleCustomerUpdates = () => setCustomers(db.getCustomers());
        const handleDealerUpdates = () => setDealers(db.getDealers());
        window.addEventListener('customer-updated', handleCustomerUpdates);
        window.addEventListener('expense-updated', handleDealerUpdates); // Dealers often update with expenses
        return () => {
            window.removeEventListener('customer-updated', handleCustomerUpdates);
            window.removeEventListener('expense-updated', handleDealerUpdates);
        };
    }, []);

    const [filteredCustomers, setFilteredCustomers] = useState<{ id: number, name: string, city: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Auto-filter logic
    useEffect(() => {
        if (!customers.length) return;
        const value = formData.customer.toLowerCase();
        const result = customers.filter(c => c.name.toLowerCase().includes(value));
        setFilteredCustomers(result);
    }, [customers, formData.customer]);

    const handleCustomerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, customer: e.target.value });
        setShowSuggestions(true);
    };

    const selectCustomer = (name: string) => {
        setFormData({ ...formData, customer: name });
        setShowSuggestions(false);
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.customer && formData.type === 'Collection') return;
        if (!formData.category && (formData.type === 'Expense' || formData.type === 'Deposit')) return;
        if (!formData.amount) return;

        setLoading(true);

        try {
            if (formData.type === 'Collection' || formData.type === 'Visit') {
                // Dynamically get staff name from localStorage
                let staffName = "Staff Member";
                const storedUser = localStorage.getItem('payment_app_user');
                if (storedUser) {
                    try { staffName = JSON.parse(storedUser).name || staffName; } catch { }
                }

                const newCollection: Collection = {
                    id: `REC-${Date.now()}`,
                    customer: formData.customer,
                    amount: formData.type === 'Visit' ? '0' : formData.amount,
                    staff: staffName, // DYNAMIC!
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    mode: formData.mode as any,
                    status: formData.type === 'Visit' ? 'Visit' : 'Paid',
                    contact: "+91 00000 00000",
                    remarks: formData.remarks,
                    image: formData.image || undefined
                };
                db.saveCollection(newCollection);
            } else {
                const isDeposit = formData.type === 'Deposit';
                const isDealer = formData.category.startsWith('DEALER:');
                const dealerName = isDealer ? formData.category.replace('DEALER:', '') : '';
                const categoryName = isDealer ? dealerName : formData.category;

                // Get Staff Name
                let staffName = "Staff Member";
                const storedUser = localStorage.getItem('payment_app_user');
                if (storedUser) {
                    try { staffName = JSON.parse(storedUser).name || staffName; } catch { }
                }

                const newExpense: Expense = {
                    id: Date.now(),
                    title: isDeposit ? `Deposit to ${categoryName}` : (isDealer ? `Payment to ${dealerName}` : categoryName || 'Expense'),
                    party: isDealer ? dealerName : 'Staff Entry',
                    amount: parseFloat(formData.amount) || 0,
                    date: new Date().toISOString().split('T')[0],
                    category: isDeposit ? 'Deposit' : (isDealer ? 'Dealer Payment' : categoryName),
                    method: formData.mode,
                    status: 'Approved',
                    notes: formData.remarks || (isDeposit ? 'Bank Deposit' : (isDealer ? `Payment to dealer: ${dealerName}` : 'Expense Entry')),
                    image: formData.image || undefined,
                    createdBy: staffName
                };
                db.saveExpense(newExpense);

                // Update Dealer Record if it's a dealer payment
                if (isDealer && dealerName) {
                    const allDealers = db.getDealers();
                    const dealer = allDealers.find((d: any) => d.name === dealerName);
                    if (dealer) {
                        // Add to dealer's payment received amount
                        const currentPaid = parseFloat(String(dealer.paid || '0').replace(/,/g, '')) || 0;
                        const paymentAmount = parseFloat(formData.amount) || 0;
                        dealer.paid = String(currentPaid + paymentAmount);
                        db.updateDealer(dealer);
                    }
                }
            }

            setTimeout(() => {
                setLoading(false);
                setShowSuccess(true);
            }, 500);

        } catch (error: any) {
            console.error("Save Error:", error);
            setLoading(false);
            if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
                alert("Storage Full! Image is too large to save locally. Please try a smaller image or clear data.");
            } else {
                alert("Failed to save transaction. Please try again.");
            }
        }
    };

    const handleWhatsAppShare = () => {
        const appSettings = db.getAppSettings();
        const companyName = appSettings.appName || "My Company";

        if (formData.type === 'Visit') {
            const message = `*Visit Logged* 📝\n\n*Customer:* ${formData.customer} \n*Date:* ${new Date().toLocaleDateString()} \n*Reason:* ${formData.remarks || 'No Payment'} \n\n*${companyName}*`;
            const encodedMessage = encodeURIComponent(message);
            window.location.href = `whatsapp://send?text=${encodedMessage}`;
        } else {
            const partyName = formData.type === 'Collection' ? formData.customer : formData.category;
            const transactionType = formData.type === 'Collection' ? 'Payment Received' : formData.type === 'Expense' ? 'Expense' : 'Deposit';
            const message = `*${transactionType}* \n\n*Amount:* ₹ ${formData.amount} \n*Party:* ${partyName} \n*Date:* ${new Date().toLocaleDateString()} \n*Mode:* ${formData.mode} \n*Remarks:* ${formData.remarks || '-'} \n\n*${companyName}*`;
            const encodedMessage = encodeURIComponent(message);
            window.location.href = `whatsapp://send?text=${encodedMessage}`;
        }
    };

    // ... handleDownloadPDF keeps existing ...

    const handleDownloadPDF = () => {
        const appSettings = db.getAppSettings();
        const companyName = appSettings.appName || "My Company";

        let staffName = "Staff Member";
        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('payment_app_user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    staffName = user.name || "Staff Member";
                }
            } catch (e) {
                console.error("Error parsing staff user", e);
            }
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 150]
        });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(companyName, 40, 10, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(formData.type === 'Visit' ? "Visit Receipt" : "Receipt", 40, 15, { align: 'center' });
        doc.text("------------------------------------------------", 40, 18, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        if (formData.type !== 'Visit') {
            doc.text(`Rs. ${formData.amount}`, 40, 28, { align: 'center' });
        } else {
            doc.text("Visit Logged", 40, 28, { align: 'center' });
        }

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        let y = 40;
        const lineHeight = 6;

        doc.text(`Date: ${new Date().toLocaleDateString()}`, 5, y);
        y += lineHeight;
        doc.text(`Time: ${new Date().toLocaleTimeString()}`, 5, y);
        y += lineHeight;
        doc.text("------------------------------------------------", 40, y, { align: 'center' });
        y += lineHeight;

        const partyLabel = formData.type === 'Collection' || formData.type === 'Visit' ? 'Customer:' : 'Category:';
        const partyValue = formData.type === 'Collection' || formData.type === 'Visit' ? formData.customer : formData.category;

        doc.setFont("helvetica", "bold");
        doc.text(partyLabel, 5, y);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(partyValue || "", 45);
        doc.text(splitText, 30, y);
        y += (lineHeight * splitText.length);

        if (formData.type !== 'Visit') {
            doc.setFont("helvetica", "bold");
            doc.text("Mode:", 5, y);
            doc.setFont("helvetica", "normal");
            doc.text(formData.mode, 30, y);
            y += lineHeight;
        }

        if (formData.remarks) {
            doc.setFont("helvetica", "bold");
            doc.text(formData.type === 'Visit' ? "Reason:" : "Remarks:", 5, y);
            doc.setFont("helvetica", "normal");
            const splitRemark = doc.splitTextToSize(formData.remarks || "", 45);
            doc.text(splitRemark, 30, y);
            y += (lineHeight * splitRemark.length);
        }

        if (formData.type === 'Collection') {
            try {
                const customers = db.getCustomers();
                const customer = customers.find(c => c.name.trim() === formData.customer.trim());
                if (customer) {
                    const currentBalance = parseFloat(customer.balance.replace(/,/g, '')) || 0;
                    const paidAmount = parseFloat(formData.amount) || 0;
                    const remainingBalance = currentBalance - paidAmount;

                    doc.setFont("helvetica", "bold");
                    doc.text("Pending Bal:", 5, y);
                    doc.setFont("helvetica", "normal");
                    doc.text(`Rs. ${remainingBalance.toLocaleString('en-IN')}`, 30, y);
                    y += lineHeight;
                }
            } catch (e) {
                console.error("Error calculating balance", e);
            }
        }

        y += 5;
        doc.text("------------------------------------------------", 40, y, { align: 'center' });
        y += 5;

        doc.setFont("helvetica", "bold");
        doc.text("Recorded By:", 5, y);
        doc.setFont("helvetica", "normal");
        doc.text(staffName, 30, y);
        y += 10;

        doc.setFontSize(7);
        doc.text("Thank you!", 40, y, { align: 'center' });

        doc.save(`Receipt_${Date.now()}.pdf`);
    };


    const fileInputRef = useRef<HTMLInputElement>(null);

    // Compressed Image Handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Limit checks
            if (file.size > 5 * 1024 * 1024) {
                alert("File size too large. Please choose an image under 5MB.");
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

                    // Compress to JPEG 0.7
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, image: dataUrl }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    if (showSuccess) {
        return (
            <SuccessView
                data={formData}
                onShare={handleWhatsAppShare}
                onDownload={handleDownloadPDF}
                onClose={() => {
                    setShowSuccess(false);
                    setFormData({ ...formData, amount: '', remarks: '', image: null });
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-[#0f1115] overflow-y-auto pb-40">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-96 bg-indigo-600/10 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-full h-64 bg-fuchsia-600/10 blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 relative z-10">
                <Link href="/staff/home" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 backdrop-blur-sm">
                    <X size={24} />
                </Link>
                <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">New Transaction</h1>
                <div className="w-12"></div>
            </div>

            <div className="px-6 flex flex-col items-center relative z-10 max-w-lg mx-auto w-full">

                {/* Modern Glass Tabs - Compact */}
                <div className="flex p-1 rounded-xl bg-black/20 border border-white/5 w-full mb-6 backdrop-blur-xl">
                    {['Collection', 'Expense', 'Deposit', 'Visit'].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                setFormData({ ...formData, type: type as any, customer: '', category: '', amount: type === 'Visit' ? '0' : '' });
                            }}
                            className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden ${formData.type === type ?
                                (type === 'Expense' ? 'bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/50' :
                                    type === 'Deposit' ? 'bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50' :
                                        type === 'Visit' ? 'bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/50' :
                                            'bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/50')
                                : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Amount Input (Hidden for Visit) */}
                {formData.type !== 'Visit' && (
                    <div className="w-full relative mb-6 text-center">
                        <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 animate-pulse ${formData.type === 'Expense' ? 'text-rose-400' : formData.type === 'Deposit' ? 'text-amber-400' : 'text-indigo-400'}`}>
                            {formData.type === 'Expense' ? 'Amount' : formData.type === 'Deposit' ? 'Deposit Amount' : 'Collection Amount'}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <span className={`text-4xl font-light transition-colors relative top-1 ${formData.amount ? 'text-white' : 'text-slate-600'}`}>₹</span>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="bg-transparent text-6xl font-black text-white outline-none placeholder:text-slate-800 caret-indigo-500 font-sans tracking-tight p-0 m-0"
                                style={{ width: `${Math.max(1, formData.amount.length) * 0.7}em`, textAlign: 'left' }}
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Conditional Fields based on Type */}
                <div className="w-full space-y-4">
                    <AnimatePresence mode="wait">
                        {formData.type === 'Collection' || formData.type === 'Visit' ? (
                            <motion.div
                                key="collection"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="bg-[#15171c] rounded-2xl p-1 border border-white/5 shadow-2xl relative z-20">
                                    <div className="bg-[#1e2128]/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <User size={18} className="text-indigo-400" />
                                        </div>
                                        <div className="flex-1 relative">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Name</label>
                                            <input
                                                type="text"
                                                placeholder="Search customer..."
                                                value={formData.customer}
                                                onChange={handleCustomerSearch}
                                                onFocus={() => {
                                                    // Refresh list on focus
                                                    setCustomers(db.getCustomers());
                                                    setShowSuggestions(true);
                                                }}
                                                className="w-full bg-transparent text-base font-bold text-white outline-none placeholder:text-slate-600 placeholder:font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && filteredCustomers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e2128] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl max-h-40 overflow-y-auto">
                                            {filteredCustomers.map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => selectCustomer(c.name)}
                                                    className="p-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer flex justify-between items-center bg-[#1e2128]"
                                                >
                                                    <span className="text-sm font-bold text-slate-200">{c.name}</span>
                                                    <span className="text-xs text-slate-500">{c.city}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="other"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full"
                            >
                                <div className="bg-[#15171c] rounded-2xl p-1 border border-white/5 shadow-2xl">
                                    <div className="bg-[#1e2128]/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Building2 size={18} className="text-indigo-400" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                {formData.type === 'Expense' ? 'Category' : 'Deposit To'}
                                            </label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-transparent text-base font-bold text-white outline-none focus:bg-[#1e2128] appearance-none"
                                            >
                                                <option value="" className="bg-[#1e293b] text-slate-500">Select</option>
                                                {formData.type === 'Expense' ? (
                                                    <>
                                                        <optgroup label="General">
                                                            <option value="Petrol" className="bg-[#1e293b]">Petrol</option>
                                                            <option value="Food" className="bg-[#1e293b]">Food</option>
                                                            <option value="Repair" className="bg-[#1e293b]">Repair</option>
                                                            <option value="Other" className="bg-[#1e293b]">Other</option>
                                                        </optgroup>
                                                        {dealers.length > 0 && (
                                                            <optgroup label="Dealers">
                                                                {dealers.map(d => (
                                                                    <option key={d.id} value={`DEALER:${d.name}`} className="bg-[#1e293b]">
                                                                        {d.name}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Office" className="bg-[#1e293b]">Office</option>
                                                        <option value="Bank" className="bg-[#1e293b]">Bank</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Visit: Reason Selection */}
                    {formData.type === 'Visit' && (
                        <div className="w-full">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Reason for No Payment</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['Shop Closed', 'Owner Not Available', 'Asked to Come Later', 'Denied Payment', 'Other'].map(reason => (
                                    <button
                                        key={reason}
                                        onClick={() => setFormData((prev) => ({ ...prev, remarks: reason }))}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${formData.remarks === reason ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#1e2128]/50 border-white/5 text-slate-500 hover:bg-white/5'}`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Mode Selector - Compact (Hidden for Visit only) */}
                    {formData.type !== 'Visit' && (
                        <div className="w-full">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Payment Mode</p>
                            <div className="grid grid-cols-3 gap-2">
                                <ModeButton
                                    label="Cash"
                                    icon={<Banknote size={16} />}
                                    active={formData.mode === 'Cash'}
                                    onClick={() => setFormData({ ...formData, mode: 'Cash' })}
                                />
                                <ModeButton
                                    label="UPI"
                                    icon={<div className="font-black text-xs">@</div>}
                                    active={formData.mode === 'UPI'}
                                    onClick={() => setFormData({ ...formData, mode: 'UPI' })}
                                />
                                <ModeButton
                                    label="Cheque"
                                    icon={<CreditCard size={16} />}
                                    active={formData.mode === 'Cheque'}
                                    onClick={() => setFormData({ ...formData, mode: 'Cheque' })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Remarks & Camera Field */}
                    <div className="w-full space-y-2">
                        <div className="bg-[#15171c]/50 rounded-xl p-3 border border-white/5 flex items-center gap-3 focus-within:border-indigo-500/50 focus-within:bg-[#15171c] transition-all relative">

                            {/* Camera Button with Native Plugin Trigger */}
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                        const image = await Camera.getPhoto({
                                            quality: 70,
                                            allowEditing: false,
                                            resultType: CameraResultType.DataUrl,
                                            source: CameraSource.Prompt, // Asks: Camera or Photos?
                                            promptLabelHeader: "Select Image",
                                            promptLabelPhoto: "Choose from Gallery",
                                            promptLabelPicture: "Take Photo"
                                        });

                                        if (image.dataUrl) {
                                            setFormData(prev => ({ ...prev, image: image.dataUrl }));
                                        }
                                    } catch (err) {
                                        console.log("Camera dismissed", err);
                                    }
                                }}
                                className={`p-3 rounded-xl transition-all relative flex-shrink-0 active:scale-95 ${formData.image ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/50' : 'text-slate-400 bg-white/5 hover:text-indigo-400 hover:bg-white/10'}`}
                            >
                                <CameraIcon size={20} />
                            </button>
                            {/* Native Camera doesn't need <input type="file"> */}

                            <input
                                type="text"
                                placeholder="Add remark..."
                                value={formData.remarks}
                                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600 h-10"
                            />

                            {formData.image && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} className="text-white" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Submit Button - Inline with extra margin */}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || (formData.type !== 'Visit' && !formData.amount) || (formData.type === 'Collection' || formData.type === 'Visit' ? !formData.customer : !formData.category)}
                        className={`w-full py-5 rounded-2xl text-base font-bold uppercase tracking-wider shadow-xl transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 relative overflow-hidden group ${loading || (formData.type !== 'Visit' && !formData.amount) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                            'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/25'
                            }`}
                    >
                        {/* Button Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={20} strokeWidth={3} />
                                <span>Confirm {formData.type}</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

function SuccessView({ data, onShare, onDownload, onClose }: any) {
    return (
        <div className="fixed inset-0 z-[100] bg-[#0f172a]/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center overflow-hidden">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-[#1e293b] rounded-[2rem] p-8 shadow-2xl relative z-10 text-center border border-white/10"
            >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${data.type === 'Visit' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                    <Check size={40} className={data.type === 'Visit' ? 'text-blue-500' : 'text-emerald-500'} strokeWidth={3} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{data.type === 'Visit' ? 'Visit Logged!' : 'Success!'}</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">
                    {data.type === 'Visit' ? 'Visit entry saved successfully' : 'Transaction Recorded Successfully'}
                </p>

                <div className="bg-[#0f172a] rounded-2xl p-4 mb-8 border border-white/5">
                    {data.type === 'Visit' ? (
                        <>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Reason</p>
                            <p className="text-xl font-bold text-white mb-4">{data.remarks || 'No Payment'}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Amount</p>
                            <p className="text-3xl font-bold text-white mb-4">₹ {data.amount}</p>
                        </>
                    )}

                    <div className="h-px bg-white/10 w-full mb-4"></div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Party</span>
                        <span className="font-bold text-slate-200">{data.customer || (data.category?.startsWith('DEALER:') ? data.category.replace('DEALER:', '') : data.category)}</span>
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <button onClick={onDownload} className="flex-1 py-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-indigo-500/20">
                        <div className="w-5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                        Receipt
                    </button>
                    <button onClick={onShare} className="flex-1 py-3.5 rounded-xl bg-[#111] border border-white/10 text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-black">
                        <div className="w-5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></div>
                        Share
                    </button>
                </div>
                <button onClick={onClose} className="w-full py-3 text-slate-500 font-medium text-sm hover:text-white transition-colors">
                    Close
                </button>
            </motion.div>
        </div>
    )
}

function ModeButton({ label, icon, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${active
                ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                : 'bg-[#1e2128]/50 text-slate-500 border-white/5 hover:border-white/10 hover:bg-[#1e2128] hover:text-slate-400'
                }`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    )
}
