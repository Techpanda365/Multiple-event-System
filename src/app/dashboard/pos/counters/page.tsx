"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, Eye, X,
  Loader2, CheckCircle2, AlertCircle, Columns3,
  Search, CreditCard, FileText, Building2,
} from "lucide-react";

type Counter = {
  id: string;
  name: string;
  code: string;
  bankAccount: string | null;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
};

type FormData = {
  name: string;
  code: string;
  bankAccount: string;
  description: string;
  isActive: boolean;
};

const defaultForm: FormData = {
  name: "", code: "", bankAccount: "", description: "", isActive: true,
};

function BankAccountDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [accounts, setAccounts] = useState<{ id: string; name: string; accountNumber: string; bankName: string | null }[]>([]);
  const [loadingAccts, setLoadingAccts] = useState(true);
  useEffect(() => {
    fetch("/api/accounting/bank-accounts")
      .then((r) => r.json())
      .then((data) => { setAccounts(data); setLoadingAccts(false); })
      .catch(() => setLoadingAccts(false));
  }, []);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">— None —</option>
      {loadingAccts ? (
        <option disabled>Loading...</option>
      ) : accounts.length === 0 ? (
        <option disabled>No bank accounts found</option>
      ) : (
        accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.accountNumber}){a.bankName ? ` — ${a.bankName}` : ""}
          </option>
        ))
      )}
    </select>
  );
}

function CounterForm({ form, formError, saving, onSave, onCancel, title, setFormField }:
  { form: FormData; formError: string; saving: boolean; onSave: () => void; onCancel: () => void; title: string; setFormField: (k: keyof FormData, v: string | boolean) => void }) {
  const set = setFormField;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-10 pb-10 overflow-y-auto">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>
          )}

          {/* Counter Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
              Counter Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Main Counter"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Counter Code */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Counter Code <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. CNT-001"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Unique identifier — auto uppercased</p>
          </div>

          {/* Bank Account */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              Bank Account
            </label>
            <BankAccountDropdown value={form.bankAccount} onChange={(v) => set("bankAccount", v)} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Description
            </label>
            <textarea
              placeholder="Counter description..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">
                {form.isActive ? "Counter is active and available for POS" : "Counter is inactive — won't appear in POS"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.isActive ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : title}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function POSCountersPage() {
  const [counters, setCounters]   = useState<Counter[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [viewCounter, setViewCounter] = useState<Counter | null>(null);
  const [editCounter, setEditCounter] = useState<Counter | null>(null);
  const [deleteCounter, setDeleteCounter] = useState<Counter | null>(null);

  // Form
  const [form, setForm]   = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchCounters = () => {
    setLoading(true);
    fetch("/api/pos/counters")
      .then((r) => r.json())
      .then((data) => { setCounters(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetch("/api/pos/counters").then((r) => r.json()).then((data) => { setCounters(data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const filtered = counters.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  // ─── Create ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(defaultForm); setFormError(""); setShowCreate(true);
  };

  const handleCreate = async () => {
    setFormError("");
    if (!form.name.trim()) { setFormError("Counter name is required"); return; }
    if (!form.code.trim()) { setFormError("Counter code is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/pos/counters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed"); return; }
      setCounters((prev) => [...prev, data]);
      setShowCreate(false);
      showToast("Counter created successfully");
    } catch { setFormError("Network error"); }
    finally { setSaving(false); }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (c: Counter) => {
    setEditCounter(c);
    setForm({ name: c.name, code: c.code, bankAccount: c.bankAccount || "", description: c.description || "", isActive: c.isActive });
    setFormError("");
  };

  const handleEdit = async () => {
    if (!editCounter) return;
    setFormError("");
    if (!form.name.trim()) { setFormError("Counter name is required"); return; }
    if (!form.code.trim()) { setFormError("Counter code is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/pos/counters/${editCounter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed"); return; }
      setCounters((prev) => prev.map((c) => c.id === editCounter.id ? { ...c, ...form } : c));
      setEditCounter(null);
      showToast("Counter updated successfully");
    } catch { setFormError("Network error"); }
    finally { setSaving(false); }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCounter) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pos/counters/${deleteCounter.id}`, { method: "DELETE" });
      if (res.ok) {
        setCounters((prev) => prev.filter((c) => c.id !== deleteCounter.id));
        setDeleteCounter(null);
        showToast("Counter deleted");
      } else { showToast("Failed to delete", "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setDeleting(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="POS Billing Counters">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 text-white ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage POS Billing Counters</h1>
            <p className="text-sm text-muted-foreground">{counters.length} counters configured</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Create Counter
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchCounters}>Refresh</Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Columns3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No billing counters yet</p>
                <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" />Create First Counter
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Counter Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Counter Code</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map((counter) => (
                      <tr key={counter.id} className="hover:bg-muted/30 transition-colors">

                        {/* Counter Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <Columns3 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium">{counter.name}</p>
                              {counter.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{counter.description}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Counter Code */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded font-semibold">
                            {counter.code}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <Badge className={counter.isActive
                            ? "bg-green-500/10 text-green-700"
                            : "bg-gray-500/10 text-gray-600"
                          }>
                            {counter.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View" onClick={() => setViewCounter(counter)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              title="Edit" onClick={() => openEdit(counter)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete" onClick={() => setDeleteCounter(counter)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══ CREATE MODAL ══ */}
      {showCreate && (
        <CounterForm
          form={form}
          formError={formError}
          saving={saving}
          setFormField={set}
          title="Create POS Billing Counter"
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* ══ EDIT MODAL ══ */}
      {editCounter && (
        <CounterForm
          form={form}
          formError={formError}
          saving={saving}
          setFormField={set}
          title="Edit Counter"
          onSave={handleEdit}
          onCancel={() => setEditCounter(null)}
        />
      )}

      {/* ══ VIEW MODAL ══ */}
      {viewCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">Counter Details</h3>
              <button onClick={() => setViewCounter(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Columns3 className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Counter Name</p><p className="font-semibold">{viewCounter.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Counter Code</p><p className="font-mono font-bold">{viewCounter.code}</p></div>
                <div><p className="text-xs text-muted-foreground">Bank Account</p><p>{viewCounter.bankAccount || "—"}</p></div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={viewCounter.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}>
                    {viewCounter.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {viewCounter.description && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p>{viewCounter.description}</p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setViewCounter(null)}>Close</Button>
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { setViewCounter(null); openEdit(viewCounter); }}>
                <Pencil className="h-4 w-4 mr-2" />Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Counter</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delete <strong>{deleteCounter.name}</strong> (<span className="font-mono">{deleteCounter.code}</span>)?
                <br />This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteCounter(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
