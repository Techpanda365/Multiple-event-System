"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, ArrowLeft } from "lucide-react";

type Vendor = { id: string; name: string };
type Warehouse = { id: string; name: string };
type Product = { id: string; name: string; price: number };

const TAX_OPTIONS = ["No tax", "SGST 6%", "CGST 6%", "IGST 12%"];

type LineItem = {
  _id?: string;
  product: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  tax: string;
};

export default function EditPurchaseInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [items, setItems] = useState<LineItem[]>([]);
  const [form, setForm] = useState({
    invoiceDate: "",
    dueDate: "",
    vendorId: "",
    warehouseId: "",
    paymentTerms: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch("/api/purchase/vendors").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/products").then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/purchase/invoices/${id}`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([v, w, p, inv]) => {
      setVendors(Array.isArray(v) ? v : []);
      setWarehouses(Array.isArray(w) ? w : []);
      setProducts(Array.isArray(p) ? p : []);
      if (inv) {
        setForm({
          invoiceDate: inv.invoiceDate ? inv.invoiceDate.slice(0, 10) : "",
          dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "",
          vendorId: inv.vendorId || "",
          warehouseId: inv.warehouseId || "",
          paymentTerms: inv.paymentTerms || "",
          notes: inv.notes || "",
        });
        setItems((inv.items || []).map((i: Record<string, unknown>) => ({
          _id: i._id,
          product: i.product || "",
          productId: i.productId || "",
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || 0,
          discountPct: i.discountPct || 0,
          tax: i.tax || "No tax",
        })));
      }
    }).finally(() => setLoading(false));
  }, [id]);

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
    return sub - discount + (sub - discount) * (getTaxRate(item.tax) / 100);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorId) { setError("Please select a vendor"); return; }
    if (items.length === 0) { setError("Add at least one item"); return; }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/purchase/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          subtotal,
          discount: discountTotal,
          tax: taxTotal,
        }),
      });
      if (res.ok) router.push(`/dashboard/purchase/invoices/${id}`);
      else {
        const data = await res.json();
        setError(data.error || "Failed to update");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Purchase Invoice">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Purchase Invoice">
      <form onSubmit={handleSubmit}>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Purchase Invoice</h1>
              <p className="text-sm text-muted-foreground">Update purchase invoice details</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <Card>
            <CardHeader><CardTitle>Purchase Invoice Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Invoice Date*</label>
                  <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Vendor*</label>
                  <select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Warehouse</label>
                  <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
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
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(index)}>
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
            <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
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
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {saving ? "Saving..." : "Update Purchase Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
