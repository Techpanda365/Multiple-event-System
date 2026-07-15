"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, Building2, Banknote, DollarSign, Globe, Shield, Hash, Save, X, ChevronDown, CheckCircle, Landmark, Wallet, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

type ChartAccount = { id: string; code: string; name: string };

const PAYMENT_GATEWAYS = [
  "Toyyibpay", "Skrill", "Stripe", "Paypal", "Flutterwave", "Paystack",
  "Mollie", "Razorpay", "Payfast", "YooKassa", "PayTab", "Iyzipay", "PayTR",
  "Aamarpay", "Benefit", "Cashfree", "Coingate", "Mercado", "Paytm",
  "Midtrans", "Xendit", "Tap", "Khalti", "PhonePe", "AuthorizeNet", "PayHere",
  "PaiementPro", "FedaPay", "CinetPay", "SenangPay", "CyberSource", "Ozow",
  "2Checkout", "Easebuzz", "Square", "Braintree", "PayU", "Instamojo", "Esewa",
  "Paynow", "MyFatoorah", "Fatora", "Moyasar", "NMI", "PowerTranz", "DPO",
  "Pay", "Monnify", "UddoktaPay", "Moneris", "PayPesapal", "Checkout.com",
  "CoinBTC", "PayFort", "BlueSnap", "LinePay", "BitPay", "Peach Payment",
  "SSLCommerz", "Yoco", "Adyen",
];

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking", icon: CreditCard },
  { value: "savings", label: "Savings", icon: Banknote },
  { value: "credit", label: "Credit", icon: DollarSign },
  { value: "loan", label: "Loan", icon: Building2 },
];

const selectCls = "w-full pl-10 pr-8 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none";
const inputCls = "w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CreateBankAccountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [glAccounts, setGlAccounts] = useState<ChartAccount[]>([]);

  const [form, setForm] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
    branchName: "",
    accountType: "checking",
    glAccount: "",
    paymentGateway: "",
    openingBalance: "0.00",
    currentBalance: "0.00",
    iban: "",
    swiftCode: "",
    routingNumber: "",
    isActive: true,
  });

  useEffect(() => {
    fetch("/api/accounting/chart-of-accounts")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setGlAccounts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountNumber.trim()) { setError("Account Number is required"); return; }
    if (!form.accountName.trim()) { setError("Account Name is required"); return; }
    if (!form.bankName.trim()) { setError("Bank Name is required"); return; }
    if (!form.glAccount) { setError("GL Account is required"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/accounting/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
          bankName: form.bankName.trim(),
          branchName: form.branchName.trim() || null,
          type: form.accountType.toUpperCase(),
          glAccount: form.glAccount,
          paymentGateway: form.paymentGateway || null,
          currency: "USD",
          openingBalance: Number(form.openingBalance) || 0,
          currentBalance: Number(form.currentBalance) || 0,
          iban: form.iban.trim() || null,
          swiftCode: form.swiftCode.trim() || null,
          routingNumber: form.routingNumber.trim() || null,
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create"); return; }

      router.push("/dashboard/accounting/banking/accounts");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/accounting/banking/accounts">
          <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white">Create Bank Account</h1>
          <p className="text-sm text-gray-400 mt-1">Add a new bank account to your system</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Account Details */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <Landmark className="w-5 h-5 inline mr-2" />
                Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Account Number <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="accountNumber" placeholder="Enter Account Number" value={form.accountNumber} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Account Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="accountName" placeholder="Enter Account Name" value={form.accountName} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Bank Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="bankName" placeholder="Enter Bank Name" value={form.bankName} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Branch Name</label>
                  <input type="text" name="branchName" placeholder="Enter Branch Name" value={form.branchName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Account Type */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <CreditCard className="w-5 h-5 inline mr-2" />
                Account Type <span className="text-red-400">*</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ACCOUNT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = form.accountType === type.value;
                  return (
                    <label key={type.value} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${isSelected ? "bg-blue-900/30 border-blue-500 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>
                      <input type="radio" name="accountType" value={type.value} checked={isSelected} onChange={handleChange} className="hidden" />
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : ""}`} />
                      <span className="text-sm capitalize">{type.label}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <FileText className="w-5 h-5 inline mr-2" />
                Account Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">GL Account <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select name="glAccount" value={form.glAccount} onChange={handleChange} className={selectCls}>
                      <option value="">Select GL Account</option>
                      {glAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Payment Gateway</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select name="paymentGateway" value={form.paymentGateway} onChange={handleChange} className={selectCls}>
                      <option value="">Select Payment Gateway</option>
                      {PAYMENT_GATEWAYS.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Opening Balance <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="text" name="openingBalance" placeholder="0.00" value={form.openingBalance} onChange={handleChange} className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Balance <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="text" name="currentBalance" placeholder="0.00" value={form.currentBalance} onChange={handleChange} className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h2 className="text-lg font-medium text-white mb-4 border-b border-gray-700 pb-2">
                <Shield className="w-5 h-5 inline mr-2" />
                Bank Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">IBAN</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="iban" placeholder="Enter IBAN" value={form.iban} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Swift Code</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="swiftCode" placeholder="Enter Swift Code" value={form.swiftCode} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Routing Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="routingNumber" placeholder="Enter Routing Number" value={form.routingNumber} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-800 transition">
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-300">Is Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Link href="/dashboard/accounting/banking/accounts">
                <button type="button" className="px-6 py-2 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </Link>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}