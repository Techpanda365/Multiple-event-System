"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";

type Customer = { id: string; name: string; email: string | null };
type Warehouse = { id: string; name: string };
type Account = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string; email: string | null };
type Opportunity = { id: string; name: string };
type User = { id: string; name: string | null; email: string };

const TAX_OPTIONS = ["No tax", "SGST 6%", "CGST 6%", "IGST 12%"];

type LineItem = {
  product: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  tax: string;
};

const SHIPPING_PROVIDERS = ["FedEx", "UPS", "DHL", "USPS", "Blue Dart", "Delhivery", "DTDC"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateSalesQuotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  const [form, setForm] = useState({
    name: "",
    quoteDate: todayStr(),
    expiryDate: "",
    status: "Draft",
    opportunityId: "",
    accountId: "",
    warehouseId: "",
    assignedUserId: "",
    customerId: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingPostalCode: "",
    shippingSameAsBilling: false,
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingCountry: "",
    shippingPostalCode: "",
    description: "",
    notes: "",
    billingContactId: "",
    shippingContactId: "",
    shippingProvider: "",
    assignedUserName: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/sales/customers").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/crm/accounts").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/crm/contacts").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/crm/opportunities").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/users").then((r) => (r.ok ? r.json() : [])),
    ]).then(([c, w, a, co, o, u]) => {
      setCustomers(Array.isArray(c) ? c : []);
      setWarehouses(Array.isArray(w) ? w : []);
      setAccounts(Array.isArray(a) ? a : []);
      setContacts(Array.isArray(co) ? co : []);
      setOpportunities(Array.isArray(o) ? o : []);
      setUsers(Array.isArray(u) ? u : []);
    }).catch(() => {});
  }, []);

  const selectedCustomer = customers.find((c) => c.id === form.customerId);
  const selectedWarehouse = warehouses.find((w) => w.id === form.warehouseId);
  const selectedAccount = accounts.find((a) => a.id === form.accountId);
  const selectedOpportunity = opportunities.find((o) => o.id === form.opportunityId);

  function addItem() {
    setItems([...items, { product: "", productId: "", quantity: 1, unitPrice: 0, discountPct: 0, tax: "No tax" }]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    }));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function getTaxRate(tax: string): number {
    if (tax === "SGST 6%" || tax === "CGST 6%") return 6;
    if (tax === "IGST 12%") return 12;
    return 0;
  }

  function calcItemTotal(item: LineItem): number {
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    const sub = qty * price;
    const discount = sub * ((item.discountPct || 0) / 100);
    const afterDiscount = sub - discount;
    const taxAmt = afterDiscount * (getTaxRate(item.tax) / 100);
    return afterDiscount + taxAmt;
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const discountTotal = items.reduce((sum, item) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    return sum + sub * ((item.discountPct || 0) / 100);
  }, 0);
  const taxTotal = items.reduce((sum, item) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    const discAmt = sub * ((item.discountPct || 0) / 100);
    return sum + (sub - discAmt) * (getTaxRate(item.tax) / 100);
  }, 0);
  const total = subtotal - discountTotal + taxTotal;

  function copyBillingToShipping() {
    setForm((f) => ({
      ...f,
      shippingSameAsBilling: true,
      shippingAddress: f.billingAddress,
      shippingCity: f.billingCity,
      shippingState: f.billingState,
      shippingCountry: f.billingCountry,
      shippingPostalCode: f.billingPostalCode,
    }));
  }

  async function handleSave() {
    if (!form.customerId) { setError("Please select a customer"); return; }
    if (items.length === 0) { setError("Add at least one item"); return; }

    setSaving(true);
    setError("");

    try {
      const body = {
        customerId: form.customerId,
        customerName: selectedCustomer?.name || "",
        customerEmail: selectedCustomer?.email || null,
        name: form.name || null,
        quoteDate: form.quoteDate,
        expiryDate: form.expiryDate || null,
        status: form.status,
        opportunityId: form.opportunityId || null,
        opportunityName: selectedOpportunity?.name || null,
        accountId: form.accountId || null,
        accountName: selectedAccount?.name || null,
        assignedUserId: form.assignedUserId || null,
        assignedUserName: form.assignedUserName || null,
        warehouseId: form.warehouseId || null,
        warehouseName: selectedWarehouse?.name || null,
        billingAddress: form.billingAddress || null,
        billingCity: form.billingCity || null,
        billingState: form.billingState || null,
        billingCountry: form.billingCountry || null,
        billingPostalCode: form.billingPostalCode || null,
        shippingSameAsBilling: form.shippingSameAsBilling,
        shippingAddress: form.shippingAddress || null,
        shippingCity: form.shippingCity || null,
        shippingState: form.shippingState || null,
        shippingCountry: form.shippingCountry || null,
        shippingPostalCode: form.shippingPostalCode || null,
        description: form.description || null,
        notes: form.notes || null,
        billingContactId: form.billingContactId || null,
        billingContactName: form.billingContactId
          ? (contacts.find((c) => c.id === form.billingContactId)?.firstName || "") + " " + (contacts.find((c) => c.id === form.billingContactId)?.lastName || "")
          : null,
        shippingContactId: form.shippingContactId || null,
        shippingContactName: form.shippingContactId
          ? (contacts.find((c) => c.id === form.shippingContactId)?.firstName || "") + " " + (contacts.find((c) => c.id === form.shippingContactId)?.lastName || "")
          : null,
        shippingProvider: form.shippingProvider || null,
        items: items.map((item) => ({
          product: item.product,
          productId: item.productId,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          tax: item.tax,
        })),
      };

      const res = await fetch("/api/sales/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create quote"); return; }

      router.push("/dashboard/Sales/quotes");
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
    <DashboardLayout title="Create Quote">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/Sales/quotes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Quote</h1>
            <p className="text-sm text-muted-foreground">Create a new sales quote</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <Card>
          <CardHeader><CardTitle>Quote Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quote Name *</label>
                <Input placeholder="Enter quote name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quote Date *</label>
                <Input type="date" value={form.quoteDate} onChange={(e) => setForm({ ...form, quoteDate: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Expiry Date</label>
                <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status *</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Opportunity</label>
                <select value={form.opportunityId} onChange={(e) => setForm({ ...form, opportunityId: e.target.value })} className={selectCls}>
                  <option value="">Select Opportunity</option>
                  {opportunities.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Account</label>
                <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} className={selectCls}>
                  <option value="">Select Account</option>
                  {accounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Warehouse *</label>
                <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} className={selectCls}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Assigned User</label>
                <select value={form.assignedUserId} onChange={(e) => {
                  const user = users.find((u) => u.id === e.target.value);
                  setForm({ ...form, assignedUserId: e.target.value, assignedUserName: user ? (user.name || user.email) : "" });
                }} className={selectCls}>
                  <option value="">Select User</option>
                  {users.map((u) => (<option key={u.id} value={u.id}>{u.name || u.email}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer *</label>
                <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className={selectCls}>
                  <option value="">Select Customer</option>
                  {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}{c.email ? ` - ${c.email}` : ""}</option>))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Billing Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address</label>
              <textarea placeholder="Billing address..." value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} className={textareaCls} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Input placeholder="City" value={form.billingCity} onChange={(e) => setForm({ ...form, billingCity: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">State</label>
                <Input placeholder="State" value={form.billingState} onChange={(e) => setForm({ ...form, billingState: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Country</label>
                <Input placeholder="Country" value={form.billingCountry} onChange={(e) => setForm({ ...form, billingCountry: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Postal Code</label>
                <Input placeholder="Postal Code" value={form.billingPostalCode} onChange={(e) => setForm({ ...form, billingPostalCode: e.target.value })} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shipping Address</CardTitle>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.shippingSameAsBilling} onChange={(e) => {
                  if (e.target.checked) copyBillingToShipping();
                  else setForm({ ...form, shippingSameAsBilling: false, shippingAddress: "", shippingCity: "", shippingState: "", shippingCountry: "", shippingPostalCode: "" });
                }} className="h-4 w-4 rounded border-gray-300" />
                Copy from billing
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address</label>
              <textarea placeholder="Shipping address..." value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} className={textareaCls} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Input placeholder="City" value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">State</label>
                <Input placeholder="State" value={form.shippingState} onChange={(e) => setForm({ ...form, shippingState: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Country</label>
                <Input placeholder="Country" value={form.shippingCountry} onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Postal Code</label>
                <Input placeholder="Postal Code" value={form.shippingPostalCode} onChange={(e) => setForm({ ...form, shippingPostalCode: e.target.value })} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <textarea placeholder="Quote description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={textareaCls} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={textareaCls} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Billing Contact</CardTitle></CardHeader>
          <CardContent>
            <select value={form.billingContactId} onChange={(e) => setForm({ ...form, billingContactId: e.target.value })} className={selectCls}>
              <option value="">Select Billing Contact</option>
              {contacts.map((c) => (<option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>))}
            </select>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Shipping Contact</CardTitle></CardHeader>
          <CardContent>
            <select value={form.shippingContactId} onChange={(e) => setForm({ ...form, shippingContactId: e.target.value })} className={selectCls}>
              <option value="">Select Shipping Contact</option>
              {contacts.map((c) => (<option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>))}
            </select>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Shipping Provider</CardTitle></CardHeader>
          <CardContent>
            <select value={form.shippingProvider} onChange={(e) => setForm({ ...form, shippingProvider: e.target.value })} className={selectCls}>
              <option value="">Select Shipping Provider</option>
              {SHIPPING_PROVIDERS.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sales Quote Items</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Product *</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Qty *</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Unit Price *</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Discount %</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Tax</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No items added. Click &quot;Add Item&quot; to start.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="p-2">
                          <Input placeholder="Product name" value={item.product}
                            onChange={(e) => updateItem(index, "product", e.target.value)}
                            className="h-9 text-xs" />
                        </td>
                        <td className="p-2">
                          <Input type="number" min={1} value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                            className="h-9 w-20 text-center" />
                        </td>
                        <td className="p-2">
                          <Input type="number" step="0.01" min={0} value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="h-9 w-28 text-right" />
                        </td>
                        <td className="p-2">
                          <Input type="number" min={0} max={100} value={item.discountPct}
                            onChange={(e) => updateItem(index, "discountPct", parseFloat(e.target.value) || 0)}
                            className="h-9 w-20 text-right" />
                        </td>
                        <td className="p-2">
                          <select value={item.tax} onChange={(e) => updateItem(index, "tax", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                            {TAX_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                          </select>
                        </td>
                        <td className="p-2 text-right font-medium">
                          ${calcItemTotal(item).toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Quote Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-red-500">-${discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-base border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/Sales/quotes")} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Save Quote"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
