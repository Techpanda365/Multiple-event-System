"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Plus, Search, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, Loader2,
  X, AlertCircle, CheckCircle2,
  Building2, CreditCard, Banknote, DollarSign, TrendingUp,
} from "lucide-react";

type BankAccount = {
  id: string;
  name: string;
  accountNumber: string | null;
  bankName: string | null;
  branchName: string | null;
  type: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  glAccount: string | null;
  paymentGateway: string | null;
  iban: string | null;
  swiftCode: string | null;
  routingNumber: string | null;
  isActive: boolean;
};

const ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "CREDIT", "LOAN"];

const typeColors: Record<string, string> = {
  CHECKING:   "bg-blue-500/10 text-blue-700",
  SAVINGS:    "bg-green-500/10 text-green-700",
  CREDIT:     "bg-yellow-500/10 text-yellow-700",
  INVESTMENT: "bg-purple-500/10 text-purple-700",
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CHECKING:   CreditCard,
  SAVINGS:    Banknote,
  CREDIT:     DollarSign,
  LOAN:       Building2,
};

const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

export default function BankAccountsPage() {
  const [accounts, setAccounts]   = useState<BankAccount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  // Modals
  const [viewAccount, setViewAccount] = useState<BankAccount | null>(null);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<BankAccount | null>(null);

  // Form
  const [form, setForm]     = useState({ name: "", accountNumber: "", bankName: "", type: "CHECKING", currency: "USD", openingBalance: "0", isActive: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting]   = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounting/bank-accounts");
      if (res.ok) setAccounts(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      (a.accountNumber?.includes(q) ?? false) ||
      (a.bankName?.toLowerCase().includes(q) ?? false)
    );
  }, [accounts, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalBalance = accounts.filter((a) => a.isActive).reduce((s, a) => s + a.currentBalance, 0);

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (a: BankAccount) => {
    setEditAccount(a);
    setForm({
      name: a.name, accountNumber: a.accountNumber || "",
      bankName: a.bankName || "", type: a.type,
      currency: a.currency, openingBalance: String(a.openingBalance),
      description: "", isActive: a.isActive,
    });
    setFormError("");
  };

  const handleEdit = async () => {
    if (!editAccount) return;
    setFormError("");
    if (!form.name.trim()) { setFormError("Account name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/accounting/bank-accounts/${editAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          accountNumber: form.accountNumber.trim() || null,
          bankName: form.bankName.trim() || null,
          type: form.type,
          currency: form.currency,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed"); return; }
      setAccounts((prev) => prev.map((a) => a.id === editAccount.id ? { ...a, ...form, openingBalance: Number(form.openingBalance) } : a));
      setEditAccount(null);
      showToast("Bank account updated");
    } catch { setFormError("Network error"); }
    finally { setSaving(false); }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteAccount) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/accounting/bank-accounts/${deleteAccount.id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== deleteAccount.id));
        setDeleteAccount(null);
        showToast("Account deleted");
      } else { showToast("Failed to delete", "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setDeleting(false); }
  };

  // ─── Edit Form Modal ─────────────────────────────────────────────────────

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Bank Accounts">

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Bank Accounts</h1>
            <p className="text-sm text-muted-foreground">
              {accounts.length} accounts · Active balance: {fmt(totalBalance)}
            </p>
          </div>
          <Link href="/dashboard/accounting/banking/accounts/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add Bank Account</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ACCOUNT_TYPES.map((type) => {
            const TypeIcon = typeIcons[type];
            const typeAccounts = accounts.filter((a) => a.type === type);
            const balance = typeAccounts.reduce((s, a) => s + a.currentBalance, 0);
            return (
              <div key={type} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">{type.toLowerCase()}</span>
                </div>
                <p className="text-lg font-bold">{typeAccounts.length}</p>
                <p className="text-xs text-muted-foreground">{fmt(balance)}</p>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search accounts..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchAccounts}>Refresh</Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No bank accounts yet</p>
              <Link href="/dashboard/accounting/banking/accounts/create">
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add First Account</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Account Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Account Number</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Bank Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Current Balance</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginated.map((acc) => {
                    const TypeIcon = typeIcons[acc.type] || CreditCard;
                    return (
                      <tr key={acc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="h-4 w-4 text-primary" />
                            </div>
                            <p className="font-medium">{acc.name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                          {acc.accountNumber ? `**** ${acc.accountNumber.slice(-4)}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{acc.bankName || "—"}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs ${typeColors[acc.type] || "bg-gray-100 text-gray-600"}`}>
                            {acc.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {fmt(acc.currentBalance, acc.currency)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={acc.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}>
                            {acc.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" onClick={() => setViewAccount(acc)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-yellow-600 hover:bg-yellow-50" onClick={() => openEdit(acc)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={() => setDeleteAccount(acc)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editAccount && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Edit Bank Account</h2>
              <button onClick={() => setEditAccount(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Account Name <span className="text-destructive">*</span></label>
                <Input placeholder="e.g. Business Checking Account" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Account Number</label>
                  <Input placeholder="e.g. 1234567890" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bank Name</label>
                  <Input placeholder="e.g. HDFC Bank" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Account Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {["USD", "INR", "EUR", "GBP", "AED", "SGD", "CAD", "AUD"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Opening Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{form.currency}</span>
                  <Input type="number" min={0} step={0.01} placeholder="0.00"
                    value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} className="pl-12" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">{form.isActive ? "Account is active" : "Account is inactive"}</p>
                </div>
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setEditAccount(null)} disabled={saving}>Cancel</Button>
              <Button className="flex-1" onClick={handleEdit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW */}
      {viewAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">Account Details</h3>
              <button onClick={() => setViewAccount(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Account Name</p><p className="font-semibold">{viewAccount.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Account Number</p><p className="font-mono">{viewAccount.accountNumber || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Bank Name</p><p>{viewAccount.bankName || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Type</p><Badge className={`text-xs ${typeColors[viewAccount.type] || ""}`}>{viewAccount.type}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Currency</p><p>{viewAccount.currency}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge className={viewAccount.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}>{viewAccount.isActive ? "Active" : "Inactive"}</Badge></div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">Opening Balance</p><p className="font-medium">{fmt(viewAccount.openingBalance, viewAccount.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold text-green-600">{fmt(viewAccount.currentBalance, viewAccount.currency)}</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setViewAccount(null)}>Close</Button>
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { setViewAccount(null); openEdit(viewAccount); }}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE */}
      {deleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Bank Account</h3>
              <p className="text-sm text-muted-foreground mt-1">Delete <strong>{deleteAccount.name}</strong>? This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteAccount(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
