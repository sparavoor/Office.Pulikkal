"use client"

import { useState, useRef } from "react";
import { useAppStore, TransactionType, PaymentMode, FinanceRecord } from "@/lib/store";
import { Plus, Search, Calendar, Download, Copy, TrendingUp, TrendingDown, DollarSign, Wallet, Edit, Trash2, Tag, FileText, CreditCard, Settings, Printer, X, Lock, ShieldAlert } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO } from "date-fns";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function ReceiptTemplateModal({ onClose }: { onClose: () => void }) {
    const { receiptTemplate, updateReceiptTemplate } = useAppStore();
    const [formData, setFormData] = useState(receiptTemplate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateReceiptTemplate(formData);
        toast.success("Receipt settings updated");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-sm w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-slate-200" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Receipt Settings</h2>
                    <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                        <input required value={formData.orgName} onChange={e => setFormData({ ...formData, orgName: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address & Subtext</label>
                        <input required value={formData.orgAddress} onChange={e => setFormData({ ...formData, orgAddress: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Info</label>
                        <input required value={formData.orgContact} onChange={e => setFormData({ ...formData, orgContact: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Signature Label</label>
                        <input required value={formData.signatureText} onChange={e => setFormData({ ...formData, signatureText: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Footer Note</label>
                        <input required value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95">Save Settings</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ReceiptModal({ record, onClose }: { record: FinanceRecord, onClose: () => void }) {
    const { receiptTemplate } = useAppStore();
    const receiptRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        setDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, // Standard scale to prevent layout breaking or memory limits
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                onclone: (clonedDoc) => {
                    const seal = clonedDoc.querySelector('.receipt-seal-container');
                    if (seal) {
                        (seal as HTMLElement).style.opacity = '0.5';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            // Basic jsPDF constructor that works reliably across versions
            const pdf = new jsPDF('l', 'mm', 'a5');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Receipt_${record.id.slice(0, 8).toUpperCase()}.pdf`);
            toast.success("Receipt downloaded!");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            const msg = error instanceof Error ? error.message : "Unknown error";
            toast.error(`Failed to generate PDF: ${msg}`);
        }
        setDownloading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-sm w-full max-w-4xl overflow-hidden animate-in zoom-in-95 flex flex-col border border-slate-200" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Donation Receipt</h2>
                    <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto bg-slate-100 flex justify-center">
                    {/* The actual printable receipt container */}
                    <div ref={receiptRef} className="bg-white px-8 py-6 w-[740px] h-[520px] shadow-sm border border-slate-200 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>

                        <div className="text-center mb-3 pt-1">
                            <h1 className="text-2xl font-black text-emerald-800 tracking-tight uppercase">
                                {receiptTemplate.orgName}
                            </h1>
                            <p className="text-sm font-medium text-slate-600 mt-1">{receiptTemplate.orgAddress}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{receiptTemplate.orgContact}</p>
                        </div>

                        <div className="border-t border-b border-slate-200 py-3 mb-4 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receipt No.</p>
                                <p className="text-sm font-bold text-slate-800">#{record.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                                <p className="text-sm font-bold text-slate-800">{format(new Date(record.date), 'dd MMM yyyy')}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4 flex-1">
                            {record.donorName && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Received with thanks from:</p>
                                    <p className="text-lg font-bold text-slate-900 border-b border-dashed border-slate-300 pb-1">{record.donorName}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-slate-500 mb-1">{record.donorName ? 'Towards:' : 'Received with thanks towards:'}</p>
                                <p className="text-lg font-bold text-slate-900 border-b border-dashed border-slate-300 pb-1">{record.category}</p>
                            </div>

                            {record.description && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Description:</p>
                                    <p className="text-sm font-medium text-slate-800 italic">"{record.description}"</p>
                                </div>
                            )}

                            <div className="flex justify-between items-end border-b border-dashed border-slate-300 pb-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Received</p>
                                <p className="text-2xl font-black text-emerald-600">₹{record.amount.toLocaleString('en-IN')}</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-xs text-slate-500">Payment Mode:</p>
                                <p className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{record.paymentMode}</p>
                            </div>
                        </div>

                        <div className="mt-auto flex justify-between items-end relative z-10">
                            <div className="w-1/2">
                                <p className="text-[10px] text-slate-400 italic mb-2 w-3/4 leading-tight">{receiptTemplate.note}</p>
                            </div>

                            {/* Official Seal Stamped */}
                            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 opacity-70 pointer-events-none receipt-seal-container">
                                <img src="/seal.png" alt="Official Seal" className="w-24 h-24 object-contain" />
                            </div>

                            <div className="text-right w-1/3 relative z-10 bg-white/50 backdrop-blur-[2px] rounded p-1">
                                <div className="border-b border-slate-400 mb-1"></div>
                                <p className="text-xs font-bold text-slate-700">{receiptTemplate.signatureText}</p>
                            </div>
                        </div>

                        {/* Background Watermark Seal */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                            <img src="/seal.png" alt="Watermark Seal" className="w-64 h-64 object-contain grayscale" />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-sm transition-colors">Cancel</button>
                    <button type="button" onClick={handleDownload} disabled={downloading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2">
                        <Download className="w-4 h-4" /> {downloading ? 'Processing...' : 'Download PDF'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function FinancePage() {
    const { financeRecords, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord } = useAppStore();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [receiptRecord, setReceiptRecord] = useState<FinanceRecord | null>(null);

    // Form state
    const [type, setType] = useState<TransactionType>("Cash In");
    const [amount, setAmount] = useState<number | "">("");
    const [category, setCategory] = useState("");
    const [donorName, setDonorName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");

    // Filter state
    const [durationFilter, setDurationFilter] = useState("This Month");
    const [typeFilter, setTypeFilter] = useState<TransactionType | "All">("All");
    const [modeFilter, setModeFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = Array.from(new Set(financeRecords.map(r => r.category))).filter(Boolean);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount !== 'number' || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const isDonation = category.toLowerCase().includes('donat');
        const finalDonorName = isDonation ? donorName : undefined;

        if (editingId) {
            updateFinanceRecord(editingId, { type, amount, category, donorName: finalDonorName, description, date, paymentMode });
            toast.success("Transaction updated!");
        } else {
            addFinanceRecord({ type, amount, category, donorName: finalDonorName, description, date, paymentMode });
            toast.success("Transaction added!");
        }
        resetForm();
    };

    const resetForm = () => {
        setType("Cash In");
        setAmount("");
        setCategory("");
        setDonorName("");
        setDescription("");
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMode("Cash");
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (record: FinanceRecord) => {
        setType(record.type);
        setAmount(record.amount);
        setCategory(record.category);
        setDonorName(record.donorName || "");
        setDescription(record.description);
        setDate(record.date);
        setPaymentMode(record.paymentMode);
        setEditingId(record.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            deleteFinanceRecord(id);
            toast.success("Transaction deleted");
        }
    };

    const filteredRecords = financeRecords.filter(r => {
        const d = parseISO(r.date);
        if (durationFilter === "Today" && !isToday(d)) return false;
        if (durationFilter === "Yesterday" && !isYesterday(d)) return false;
        if (durationFilter === "This Week" && !isThisWeek(d)) return false;
        if (durationFilter === "This Month" && !isThisMonth(d)) return false;
        if (durationFilter === "This Year" && !isThisYear(d)) return false;

        if (typeFilter !== "All" && r.type !== typeFilter) return false;
        if (modeFilter !== "All" && r.paymentMode !== modeFilter) return false;
        if (categoryFilter !== "All" && r.category !== categoryFilter) return false;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesCategory = r.category.toLowerCase().includes(q);
            const matchesDonor = (r.donorName || "").toLowerCase().includes(q);
            const matchesDesc = (r.description || "").toLowerCase().includes(q);
            if (!matchesCategory && !matchesDonor && !matchesDesc) return false;
        }

        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalIn = filteredRecords.filter(r => r.type === "Cash In").reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = filteredRecords.filter(r => r.type === "Cash Out").reduce((acc, curr) => acc + curr.amount, 0);
    const netBalance = totalIn - totalOut;

    const handleCopySummary = () => {
        let text = `*📊 Division Finance Summary*\n`;
        text += `*Duration:* ${durationFilter}\n`;
        if (typeFilter !== "All") text += `*Type:* ${typeFilter}\n`;
        if (categoryFilter !== "All") text += `*Category:* ${categoryFilter}\n`;
        text += `\n`;

        text += `*📈 Cash In:* ₹${totalIn.toLocaleString('en-IN')}\n`;
        text += `*📉 Cash Out:* ₹${totalOut.toLocaleString('en-IN')}\n`;
        text += `*✨ Net Balance:* ₹${netBalance.toLocaleString('en-IN')}\n\n`;

        if (filteredRecords.length > 0) {
            text += `*Recent Transactions:*\n`;
            filteredRecords.slice(0, 15).forEach(r => {
                const icon = r.type === 'Cash In' ? '🟢' : '🔴';
                text += `${icon} ${r.date} - ${r.category}: ₹${r.amount.toLocaleString('en-IN')} (${r.paymentMode})\n`;
                if (r.description) text += `   _${r.description}_\n`;
            });
            if (filteredRecords.length > 15) text += `\n_...and ${filteredRecords.length - 15} more._\n`;
        }

        navigator.clipboard.writeText(text);
        toast.success(`Summary copied!`);
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Mode', 'Description'];
        const rows = filteredRecords.map(r => {
            return [
                r.date,
                r.type,
                `"${r.category.replace(/"/g, '""')}"`,
                r.amount,
                r.paymentMode,
                `"${r.description.replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `finance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Report downloaded!`);
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === "9695") {
            setIsAuthenticated(true);
            setPinError("");
        } else {
            setPinError("Incorrect PIN");
            setPin("");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Finance Access</h2>
                    <p className="text-slate-500 text-sm mb-6 font-medium">Please enter your security PIN to access the finance dashboard.</p>
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter PIN"
                                className="w-full text-center tracking-widest text-2xl px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-bold"
                                autoFocus
                            />
                            {pinError && <p className="text-red-500 text-xs font-bold mt-2 flex items-center justify-center gap-1"><ShieldAlert className="w-3 h-3" /> {pinError}</p>}
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95">
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-right" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Track cash in, cash out, and balances</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    <button onClick={() => setShowSettings(true)} className="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                        <Settings className="w-4 h-4" /> Receipt Settings
                    </button>
                    <button
                        onClick={handleCopySummary}
                        className="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Copy className="w-4 h-4" /> Copy Summary
                    </button>
                    <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => {
                            if (showForm) resetForm();
                            else setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95 whitespace-nowrap"
                    >
                        {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Record</>}
                    </button>
                </div>
            </div>

            {showSettings && <ReceiptTemplateModal onClose={() => setShowSettings(false)} />}
            {receiptRecord && <ReceiptModal record={receiptRecord} onClose={() => setReceiptRecord(null)} />}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-start gap-2 relative overflow-hidden">
                    <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center relative z-10"><TrendingUp className="w-4 h-4" /></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Total Cash In</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalIn.toLocaleString('en-IN')}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-start gap-2 relative overflow-hidden">
                    <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center relative z-10"><TrendingDown className="w-4 h-4" /></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Total Cash Out</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalOut.toLocaleString('en-IN')}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-start gap-2 relative overflow-hidden">
                    <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center relative z-10"><Wallet className="w-4 h-4" /></div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Net Balance</p>
                        <h3 className={`text-2xl font-black mt-1 ${netBalance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                            {netBalance >= 0 ? '₹' : '-₹'}{Math.abs(netBalance).toLocaleString('en-IN')}
                        </h3>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setType("Cash In")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors border ${type === 'Cash In' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>Cash In</button>
                                <button type="button" onClick={() => setType("Cash Out")} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors border ${type === 'Cash Out' ? 'bg-red-100 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>Cash Out</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                            <div className="relative">
                                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input required type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(Number(e.target.value) || "")} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold" placeholder="0.00" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <div className="relative">
                                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input required type="text" list="category-options" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. Donation, Supplies" />
                                <datalist id="category-options">
                                    {categories.map((c, i) => <option key={i} value={c} />)}
                                </datalist>
                            </div>
                        </div>

                        {category.toLowerCase().includes('donat') && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Donor Name (Optional)</label>
                                <div className="relative">
                                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="Enter name for receipt..." />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                            <div className="relative">
                                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <select required value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as PaymentMode)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                            <div className="relative">
                                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Add notes..." />
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95">
                                {editingId ? 'Update Transaction' : 'Save Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by category, donor name, or description..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration</label>
                            <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 shadow-sm font-medium">
                                <option value="All Time">All Time</option>
                                <option value="Today">Today</option>
                                <option value="Yesterday">Yesterday</option>
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="This Year">This Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Type</label>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 shadow-sm font-medium">
                                <option value="All">All Types</option>
                                <option value="Cash In">Cash In</option>
                                <option value="Cash Out">Cash Out</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Mode</label>
                            <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 shadow-sm font-medium">
                                <option value="All">All Modes</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-blue-500 shadow-sm font-medium">
                                <option value="All">All Categories</option>
                                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction details</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Mode</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${r.type === 'Cash In' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {r.category}
                                            </div>
                                            {r.description && <div className="text-xs text-slate-500 mt-1">{r.description}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{format(new Date(r.date), 'dd MMM yyyy')}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {r.paymentMode}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${r.type === 'Cash In' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {r.type === 'Cash In' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {r.type === 'Cash In' && (
                                                    <button onClick={() => setReceiptRecord(r)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip-trigger relative" title="Generate Receipt">
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
