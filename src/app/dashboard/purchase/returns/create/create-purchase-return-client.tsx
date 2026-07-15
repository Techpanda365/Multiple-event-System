"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, X } from "lucide-react";

type Warehouse = { id: string; name: string };

type InvoiceItem = {
  product: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  tax: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  items: InvoiceItem[];
};

type ReturnItem = {
  productId: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  tax: string;
  reason: string;
};

const RETURN_REASONS = ["Defective", "Wrong Item", "Damaged", "Excess Quantity", "Others"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getTaxRate(tax: string): number {
  if (tax === "SGST 6%" || tax === "CGST 6%") return 6;
  if (tax === "IGST 12%") return 12;
  if (tax === "VAT 12%") return 12;
  if (tax === "GST 18%") return 18;
  return 0;
}

export function CreatePurchaseReturnClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    returnDate: todayStr(),
    invoiceId: "",
    warehouseId: "",
    reason: "Defective",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/purchase/invoices").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([w, i]) => {
        setWarehouses(Array.isArray(w) ? w : []);
        setInvoices(Array.isArray(i) ? i : []);
      })
      .catch(() => {});
  }, []);

  const selectedInvoice = invoices.find((inv) => inv.id === formData.invoiceId);
  const selectedWarehouse = warehouses.find((w) => w.id === formData.warehouseId);
  const invoiceItems = selectedInvoice?.items || [];

  function addToReturn(invItem: InvoiceItem) {
    if (addedIds.has(invItem.productId)) return;
    const lineSub = (invItem.quantity || 0) * (invItem.unitPrice || 0);
    const discAmt = lineSub * ((invItem.discountPct || 0) / 100);
    const taxAmt = (lineSub - discAmt) * (getTaxRate(invItem.tax) / 100);
    setAddedIds(new Set(addedIds).add(invItem.productId));
    setItems([...items, {
      productId: invItem.productId,
      product: invItem.product,
      quantity: 1,
      unitPrice: invItem.unitPrice,
      discountPct: invItem.discountPct || 0,
      tax: invItem.tax,
      reason: "",
    }]);
  }

  function updateReturnItem(index: number, field: keyof ReturnItem, value: string | number) {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function removeReturnItem(index: number) {
    const removed = items[index];
    if (removed) {
      const next = new Set(addedIds);
      next.delete(removed.productId);
      setAddedIds(next);
    }
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const taxTotal = items.reduce((sum, item) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    const discAmt = sub * ((item.discountPct || 0) / 100);
    return sum + (sub - discAmt) * (getTaxRate(item.tax) / 100);
  }, 0);
  const totalAmount = subtotal + taxTotal;

  const handleSave = async () => {
    if (!formData.invoiceId) { setError("Please select an invoice"); return; }
    if (!formData.warehouseId) { setError("Please select a warehouse"); return; }
    if (items.length === 0) { setError("Add at least one item to return"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/purchase/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: formData.invoiceId,
          vendorId: selectedInvoice?.id || "",
          vendorName: selectedInvoice?.vendorName || "",
          warehouseId: formData.warehouseId,
          warehouseName: selectedWarehouse?.name || "",
          returnDate: formData.returnDate,
          reason: formData.reason,
          notes: formData.notes || null,
          items: items.map((item) => ({
            product: item.product,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPct: item.discountPct,
            tax: item.tax,
            reason: item.reason,
          })),
          totalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create return"); return; }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/purchase/returns");
        router.refresh();
      }, 800);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Purchase Return">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/purchase/returns")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Purchase Return</h1>
            <p className="text-sm text-muted-foreground">Record a new purchase return</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            Return created successfully! Redirecting...
          </div>
        )}
        {error && !success && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Details Card */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Purchase Return Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Return Date*</label>
                <Input type="date" value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Original Invoice*</label>
                <select value={formData.invoiceId} onChange={(e) => {
                  setItems([]);
                  setAddedIds(new Set());
                  setFormData({ ...formData, invoiceId: e.target.value });
                }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.vendorName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Warehouse*</label>
                <select value={formData.warehouseId} onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Return Reason*</label>
              <select value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                {RETURN_REASONS.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Available Items from Invoice */}
        {formData.invoiceId && invoiceItems.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Available Items from Invoice</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Product</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Available Qty</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Unit Price</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Discount</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Tax</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((invItem, idx) => {
                      const lineSub = (invItem.quantity || 0) * (invItem.unitPrice || 0);
                      const discAmt = lineSub * ((invItem.discountPct || 0) / 100);
                      const taxAmt = (lineSub - discAmt) * (getTaxRate(invItem.tax) / 100);
                      const lineTotal = lineSub - discAmt + taxAmt;
                      const isAdded = addedIds.has(invItem.productId);
                      return (
                        <tr key={idx} className={`border-b border-border last:border-0 hover:bg-muted/5 ${isAdded ? "bg-green-50/50" : ""}`}>
                          <td className="p-3">
                            <div><span className="font-medium text-sm">{invItem.product}</span><span className="block text-xs text-muted-foreground">{invItem.productId}</span></div>
                          </td>
                          <td className="p-3 text-center">{invItem.quantity}</td>
                          <td className="p-3 text-right">${invItem.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right text-red-500">{invItem.discountPct > 0 ? `-${invItem.discountPct}%` : "—"}</td>
                          <td className="p-3">{invItem.tax !== "No tax" ? <span className="text-xs font-medium">{invItem.tax}</span> : "—"}</td>
                          <td className="p-3 text-right font-medium">${lineTotal.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Button size="sm" variant={isAdded ? "secondary" : "outline"} className="h-8 text-xs"
                              disabled={isAdded} onClick={() => addToReturn(invItem)}>
                              {isAdded ? "Added" : "Add to Return"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Return Items */}
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Return Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Product</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Return Qty</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Unit Price</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Discount</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Tax</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Reason</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const sub = (item.quantity || 0) * (item.unitPrice || 0);
                      const discAmt = sub * ((item.discountPct || 0) / 100);
                      const taxAmt = (sub - discAmt) * (getTaxRate(item.tax) / 100);
                      const total = sub - discAmt + taxAmt;
                      return (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="p-3">
                            <div><span className="font-medium text-sm">{item.product}</span><span className="block text-xs text-muted-foreground">{item.productId}</span></div>
                          </td>
                          <td className="p-3 text-center">
                            <Input type="number" min={1} value={item.quantity}
                              onChange={(e) => updateReturnItem(index, "quantity", parseInt(e.target.value) || 1)}
                              className="h-8 w-20 text-center mx-auto" />
                          </td>
                          <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right text-red-500">{item.discountPct > 0 ? `-${item.discountPct}%` : "—"}</td>
                          <td className="p-3">{item.tax !== "No tax" ? <span className="text-xs font-medium">{item.tax}</span> : "—"}</td>
                          <td className="p-3 text-right font-medium">${total.toFixed(2)}</td>
                          <td className="p-3">
                            <Input placeholder="Optional reason" value={item.reason}
                              onChange={(e) => updateReturnItem(index, "reason", e.target.value)}
                              className="h-8 text-xs min-w-[120px]" />
                          </td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeReturnItem(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {formData.invoiceId ? "Click 'Add to Return' on items from the invoice above" : "Select an invoice to see available items"}
              </div>
            )}
            {items.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-muted/10">
                <div className="max-w-xs ml-auto space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm border-t pt-1">
                    <span>Total Return Amount</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea placeholder="Additional notes..." value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button variant="outline" onClick={() => router.push("/dashboard/purchase/returns")} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || success}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {saving ? "Saving..." : "Submit Return"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
