"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";

type Vendor = { id: string; name: string };
type Warehouse = { id: string; name: string };
type Product = { id: string; name: string; price: number };

const TAX_OPTIONS = ["No tax", "SGST 6%", "CGST 6%", "IGST 12%"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

type LineItem = {
  product: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  tax: string;
};

export function CreatePurchaseInvoiceClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  const [form, setForm] = useState({
    invoiceDate: todayStr(),
    dueDate: "",
    vendorId: "",
    warehouseId: "",
    paymentTerms: "",
    notes: "",
    recurring: false,
    recurringFreq: "No",
    customRecurringDays: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase/vendors").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/products").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([v, w, p]) => {
        setVendors(Array.isArray(v) ? v : []);
        setWarehouses(Array.isArray(w) ? w : []);
        setProducts(Array.isArray(p) ? p : []);
      })
      .catch(() => {});
  }, []);

  const selectedVendor = vendors.find((v) => v.id === form.vendorId);
  const selectedWarehouse = warehouses.find((w) => w.id === form.warehouseId);

  function addItem() {
    setItems([...items, { product: "", productId: "", quantity: 1, unitPrice: 0, discountPct: 0, tax: "No tax" }]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      if (field === "productId") {
        const found = products.find((p) => p.id === value);
        if (found) {
          next.product = found.name;
          next.unitPrice = found.price;
        }
      }
      return next;
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
  const afterDiscount = subtotal - discountTotal;
  const taxTotal = items.reduce((sum, item) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    const discAmt = sub * ((item.discountPct || 0) / 100);
    return sum + (sub - discAmt) * (getTaxRate(item.tax) / 100);
  }, 0);
  const total = afterDiscount + taxTotal;

  const handleSave = async () => {
    if (!form.vendorId) { setError("Please select a vendor"); return; }
    if (items.length === 0) { setError("Add at least one item"); return; }

    setSaving(true);
    setError("");

    try {
      const body = {
        vendorId: form.vendorId,
        vendorName: selectedVendor?.name || "",
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate || null,
        warehouseId: form.warehouseId || null,
        warehouseName: selectedWarehouse?.name || null,
        paymentTerms: form.paymentTerms || null,
        notes: form.notes || null,
        items: items.map((item) => ({
          product: item.product,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPct: item.discountPct,
          tax: item.tax,
        })),
        recurring: form.recurring,
        recurringFreq: form.recurring ? form.recurringFreq : null,
        customRecurringDays: form.recurringFreq === "Custom" ? Number(form.customRecurringDays) : null,
      };

      const res = await fetch("/api/purchase/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create invoice"); return; }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/purchase/invoices");
        router.refresh();
      }, 800);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Purchase Invoice">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/purchase/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Purchase Invoice</h1>
            <p className="text-sm text-muted-foreground">Record a new purchase invoice</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            Invoice created successfully! Redirecting...
          </div>
        )}
        {error && !success && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Purchase Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Invoice Date*</label>
                <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Due Date*</label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Vendor*</label>
                <select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Vendor</option>
                  {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Warehouse*</label>
                <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payment Terms</label>
                <Input placeholder="e.g., Net 30" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes</label>
                <Input placeholder="Additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            {/* Recurring */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-medium">Recurring Purchase Invoice?</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300" />
                  <span className="text-sm">{form.recurring ? "Yes" : "No"}</span>
                </label>
              </div>
              {form.recurring && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Recurring Frequency</label>
                  <select value={form.recurringFreq} onChange={(e) => setForm({ ...form, recurringFreq: e.target.value })}
                    className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                  {form.recurringFreq === "Custom" && (
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} placeholder="Days" value={form.customRecurringDays}
                        onChange={(e) => setForm({ ...form, customRecurringDays: e.target.value })}
                        className="w-24" />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Purchase Invoice Items</CardTitle>
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
                          <select value={item.productId} onChange={(e) => updateItem(index, "productId", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                            <option value="">Select</option>
                            {products.map((p) => (<option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)}</option>))}
                          </select>
                        </td>
                        <td className="p-2">
                          <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
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

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
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

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/purchase/invoices")} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || success}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Save Purchase Invoice"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
