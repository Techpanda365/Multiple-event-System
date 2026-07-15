"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";

type LineItem = {
  product: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  tax: string;
};

const TAX_OPTIONS = ["No tax", "SGST 6%", "CGST 6%", "IGST 12%"];
const STATUS_LIST = ["Draft", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const todayStr = () => new Date().toISOString().slice(0, 10);

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

export default function EditSalesOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", orderDate: todayStr(), status: "Draft",
    customerName: "", customerEmail: "", accountName: "", assignedUserName: "",
    description: "", notes: "",
  });
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sales/orders/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setForm({
          name: data.name || "",
          orderDate: data.orderDate?.slice(0, 10) || todayStr(),
          status: data.status || "Draft",
          customerName: data.customerName || "",
          customerEmail: data.customerEmail || "",
          accountName: data.accountName || "",
          assignedUserName: data.assignedUserName || "",
          description: data.description || "",
          notes: data.notes || "",
        });
        setItems(Array.isArray(data.items) ? data.items.map((i: Record<string, unknown>) => ({
          product: i.product as string || "",
          productId: i.productId as string || "",
          quantity: Number(i.qty ?? i.quantity ?? 1),
          unitPrice: Number(i.unitPrice ?? 0),
          discountPct: Number(i.discountPct ?? i.discount ?? 0),
          tax: String(i.tax || "No tax"),
        })) : []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function addItem() {
    setItems([...items, { product: "", productId: "", quantity: 1, unitPrice: 0, discountPct: 0, tax: "No tax" }]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, i) => i !== index ? item : { ...item, [field]: value }));
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
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

  const handleSave = async () => {
    if (!form.customerName.trim()) { setError("Customer name is required"); return; }
    if (items.length === 0) { setError("Add at least one item"); return; }

    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/sales/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ product: i.product, productId: i.productId, qty: i.quantity, unitPrice: i.unitPrice, discountPct: i.discountPct, tax: i.tax })),
          subtotal, tax: taxTotal, discount: discountTotal, total,
          orderDate: form.orderDate,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to update"); return; }
      router.push(`/dashboard/Sales/sales-orders/${id}`);
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const textareaCls = "w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y";

  if (loading) return (
    <DashboardLayout title="Edit Sales Order">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Edit Sales Order">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/Sales/sales-orders/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Sales Order</h1>
            <p className="text-sm text-muted-foreground">Update sales order details</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Order Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Order name" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Order Date *</label>
                <Input type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status *</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
                  {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer Name *</label>
                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer Email</label>
                <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Account</label>
                <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Assigned User</label>
                <Input value={form.assignedUserName} onChange={(e) => setForm({ ...form, assignedUserName: e.target.value })} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Order description..." className={textareaCls} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." className={textareaCls} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
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
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No items — click Add Item</td></tr>
                  ) : items.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="p-2">
                        <Input placeholder="Product name" value={item.product}
                          onChange={(e) => updateItem(index, "product", e.target.value)} className="h-9 text-xs" />
                      </td>
                      <td className="p-2">
                        <Input type="number" min={1} value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} className="h-9 w-20 text-center" />
                      </td>
                      <td className="p-2">
                        <Input type="number" step="0.01" min={0} value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)} className="h-9 w-28 text-right" />
                      </td>
                      <td className="p-2">
                        <Input type="number" min={0} max={100} value={item.discountPct}
                          onChange={(e) => updateItem(index, "discountPct", parseFloat(e.target.value) || 0)} className="h-9 w-20 text-right" />
                      </td>
                      <td className="p-2">
                        <select value={item.tax} onChange={(e) => updateItem(index, "tax", e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                          {TAX_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="p-2 text-right font-medium">${calcItemTotal(item).toFixed(2)}</td>
                      <td className="p-2 text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-red-500">-${discountTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>${taxTotal.toFixed(2)}</span></div>
              <div className="flex justify-between font-medium text-base border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => router.push(`/dashboard/Sales/sales-orders/${id}`)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
