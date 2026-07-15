"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

type SetupItem = { id: string; name: string };

export default function CreateAccountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [accountTypes, setAccountTypes] = useState<SetupItem[]>([]);
  const [industries, setIndustries] = useState<SetupItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<SetupItem[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    accountType: "",
    industry: "",
    assignedTo: "",
    document: "",
    address: "",
    city: "",
    billingState: "",
    country: "",
    billingPostalCode: "",
    shippingSameAsBilling: false,
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingCountry: "",
    shippingPostalCode: "",
    description: "",
    notes: "",
    status: "Active",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/sales/setup?type=accountType").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/sales/setup?type=accountIndustry").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/sales/setup?type=documentType").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/users").then((r) => (r.ok ? r.json() : [])),
    ]).then(([types, inds, docs, usrs]) => {
      setAccountTypes(Array.isArray(types) ? types : []);
      setIndustries(Array.isArray(inds) ? inds : []);
      setDocumentTypes(Array.isArray(docs) ? docs : []);
      setUsers(Array.isArray(usrs) ? usrs : []);
    }).catch(() => {});
  }, []);

  function update(field: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "shippingSameAsBilling" && value === true) {
        next.shippingAddress = prev.address;
        next.shippingCity = prev.city;
        next.shippingState = prev.billingState;
        next.shippingCountry = prev.country;
        next.shippingPostalCode = prev.billingPostalCode;
      }
      if (field === "shippingSameAsBilling" && value === false) {
        next.shippingAddress = "";
        next.shippingCity = "";
        next.shippingState = "";
        next.shippingCountry = "";
        next.shippingPostalCode = "";
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Account name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!form.phone.trim()) { setError("Phone is required"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/sales/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create account"); return; }
      router.push("/dashboard/Sales/accounts");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const textareaCls = "w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y";

  return (
    <DashboardLayout title="Create Account">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/Sales/accounts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground">Create a new CRM account</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <Card>
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Account Name *</label>
                <Input placeholder="Enter account name" value={form.name} onChange={(e) => update("name", e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email *</label>
                <Input placeholder="Enter email address" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-10" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone *</label>
                <Input placeholder="+1234567890" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-10" />
                <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Website</label>
                <Input placeholder="Enter website URL" value={form.website} onChange={(e) => update("website", e.target.value)} className="h-10" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Account Type</label>
                <select value={form.accountType} onChange={(e) => update("accountType", e.target.value)} className={selectCls}>
                  <option value="">Select type</option>
                  {accountTypes.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Industry</label>
                <select value={form.industry} onChange={(e) => update("industry", e.target.value)} className={selectCls}>
                  <option value="">Select industry</option>
                  {industries.map((ind) => (<option key={ind.id} value={ind.name}>{ind.name}</option>))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Assigned User</label>
                <select value={form.assignedTo} onChange={(e) => update("assignedTo", e.target.value)} className={selectCls}>
                  <option value="">Select user</option>
                  {users.map((u) => (<option key={u.id} value={u.name || u.email}>{u.name || u.email}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Document</label>
                <select value={form.document} onChange={(e) => update("document", e.target.value)} className={selectCls}>
                  <option value="">Select document</option>
                  {documentTypes.map((d) => (<option key={d.id} value={d.name}>{d.name}</option>))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Billing Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Billing Address *</label>
              <Input placeholder="Enter billing address" value={form.address} onChange={(e) => update("address", e.target.value)} className="h-10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City *</label>
                <Input placeholder="Enter city" value={form.city} onChange={(e) => update("city", e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">State *</label>
                <Input placeholder="Enter state" value={form.billingState} onChange={(e) => update("billingState", e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Country *</label>
                <Input placeholder="Enter country" value={form.country} onChange={(e) => update("country", e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Postal Code *</label>
                <Input placeholder="Enter postal code" value={form.billingPostalCode} onChange={(e) => update("billingPostalCode", e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shipping Address</CardTitle>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.shippingSameAsBilling}
                  onChange={(e) => update("shippingSameAsBilling", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300" />
                Shipping address same as billing
              </label>
            </div>
          </CardHeader>
          {!form.shippingSameAsBilling && (
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Shipping Address *</label>
                <Input placeholder="Enter shipping address" value={form.shippingAddress} onChange={(e) => update("shippingAddress", e.target.value)} className="h-10" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">City *</label>
                  <Input placeholder="Enter city" value={form.shippingCity} onChange={(e) => update("shippingCity", e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">State *</label>
                  <Input placeholder="Enter state" value={form.shippingState} onChange={(e) => update("shippingState", e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Country *</label>
                  <Input placeholder="Enter country" value={form.shippingCountry} onChange={(e) => update("shippingCountry", e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Postal Code *</label>
                  <Input placeholder="Enter postal code" value={form.shippingPostalCode} onChange={(e) => update("shippingPostalCode", e.target.value)} className="h-10" />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Additional</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea placeholder="Enter description" value={form.description}
                onChange={(e) => update("description", e.target.value)} className={textareaCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.status === "Active"}
                    onChange={(e) => update("status", e.target.checked ? "Active" : "Inactive")} />
                  <div className={`block w-10 h-6 rounded-full transition ${form.status === "Active" ? "bg-green-500" : "bg-gray-300"}`} />
                  <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${form.status === "Active" ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-sm font-medium">{form.status}</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/Sales/accounts")} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Save Account"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
