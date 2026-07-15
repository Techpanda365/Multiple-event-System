"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";

const RETURN_REASONS = ["Defective", "Wrong Item", "Damaged", "Excess Quantity", "Others"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateReturnClient() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    returnDate: todayStr(),
    customerId: "",
    customerName: "",
    invoiceId: "",
    warehouseId: "",
    warehouseName: "",
    reason: "Defective",
    notes: "",
  });

  const [items, setItems] = useState<{ product: string; quantity: number; returnQty: number; unitPrice: number; reason: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/sales/customers").then((r) => r.ok ? r.json() : []),
      fetch("/api/purchase/warehouses").then((r) => r.ok ? r.json() : []),
      fetch("/api/sales/invoices").then((r) => r.ok ? r.json() : []),
    ]).then(([c, w, i]) => {
      setCustomers(c);
      setWarehouses(w);
      setInvoices(i);
    }).finally(() => setLoading(false));
  }, []);

  const handleInvoiceSelect = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setFormData((prev) => ({
        ...prev,
        invoiceId,
        customerName: inv.customerName,
      }));
      // Auto-populate items from invoice
      if (inv.items && inv.items.length > 0) {
        setItems(inv.items.map((item: any) => ({
          product: item.product || item.name || "",
          quantity: item.quantity || item.qty || 0,
          returnQty: 0,
          unitPrice: item.unitPrice || item.price || 0,
          reason: formData.reason,
        })));
      }
    }
  };

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, returnQty: 1, unitPrice: 0, reason: "" }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.customerName) { setError("Customer is required"); return; }
    if (items.length === 0) { setError("At least one return item is required"); return; }
    setSaving(true); setError("");

    try {
      const payload = {
        ...formData,
        items: items.filter((i) => i.returnQty > 0 && i.product).map((item) => ({
          product: item.product,
          quantity: item.quantity,
          returnQty: item.returnQty,
          unitPrice: item.unitPrice,
          reason: item.reason || formData.reason,
        })),
      };

      const res = await fetch("/api/sales/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      router.push("/dashboard/sales/returns");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/sales/returns")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Create Sales Return</h1>
            <p className="text-sm text-muted-foreground">Record a new sales return</p>
          </div>
        </div>

        {error && <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{error}</div>}

        <Card>
          <CardHeader><CardTitle className="text-lg">Sales Return Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Return Date*</label>
                <Input type="date" value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer*</label>
                <select value={formData.customerId} onChange={(e) => {
                  const c = customers.find((c) => c.id === e.target.value);
                  setFormData({ ...formData, customerId: e.target.value, customerName: c?.name || "" });
                }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Customer</option>
                  {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Original Invoice</label>
                <select value={formData.invoiceId} onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-backspace focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Invoice</option>
                  {invoices.map((inv) => (<option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.customerName}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Warehouse</label>
                <select value={formData.warehouseId} onChange={(e) => {
                  const w = warehouses.find((w) => w.id === e.target.value);
                  setFormData({ ...formData, warehouseId: e.target.value, warehouseName: w?.name || "" });
                }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Return Reason</label>
                <select value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  {RETURN_REASONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea placeholder="Optional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Return Items</label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Product</label>
                    <Input value={item.product} onChange={(e) => updateItem(index, "product", e.target.value)} placeholder="Product name" />
                  </div>
                  <div className="w-16 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Orig Qty</label>
                    <Input type="number" value={item.quantity} disabled className="h-10 bg-muted/30" />
                  </div>
                  <div className="w-20 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Return Qty*</label>
                    <Input type="number" min={0} max={item.quantity} value={item.returnQty}
                      onChange={(e) => updateItem(index, "returnQty", parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Unit Price</label>
                    <Input type="number" step="0.01" value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Return Reason</label>
                    <select value={item.reason} onChange={(e) => updateItem(index, "reason", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <option value="">Select Reason</option>
                      {RETURN_REASONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" className="mt-5" onClick={() => removeItem(index)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button variant="outline" onClick={() => router.push("/dashboard/sales/returns")} disabled={saving}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Submit Return</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
