"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface Customer { id: string; name: string; email?: string; }
interface Warehouse { id: string; name: string; }
interface Product { id: string; name: string; price?: number; sku?: string; }

interface LineItem {
  id: string;
  product: string;
  productId: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxPct: number;
}

let itemId = 1;
function newItemId() { return String(itemId++); }

const taxOptions = [
  { label: "No tax", value: 0 },
  { label: "VAT 5%", value: 5 },
  { label: "VAT 10%", value: 10 },
  { label: "VAT 12%", value: 12 },
  { label: "VAT 18%", value: 18 },
];

export default function CreateQuotationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: newItemId(), product: "", productId: "", qty: 1, unitPrice: 0, discount: 0, taxPct: 0 },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/sales/customers").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/products").then((r) => (r.ok ? r.json() : [])),
    ]).then(([c, w, p]) => {
      setCustomers(Array.isArray(c) ? c : []);
      setWarehouses(Array.isArray(w) ? w : []);
      setProducts(Array.isArray(p) ? p : []);
    });
  }, []);

  function addItem() {
    setItems((prev) => [...prev, { id: newItemId(), product: "", productId: "", qty: 1, unitPrice: 0, discount: 0, taxPct: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === "productId") {
          const found = products.find((p) => p.id === value);
          if (found) {
            updated.product = found.name;
            if (found.price) updated.unitPrice = found.price;
          }
        }
        return updated;
      })
    );
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const totalDiscount = items.reduce((s, i) => {
    const lineTotal = i.qty * i.unitPrice;
    return s + lineTotal * (i.discount / 100);
  }, 0);
  const totalTax = items.reduce((s, i) => {
    const lineTotal = i.qty * i.unitPrice;
    const discAmt = lineTotal * (i.discount / 100);
    return s + (lineTotal - discAmt) * (i.taxPct / 100);
  }, 0);
  const total = subtotal - totalDiscount + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return alert("Select a customer");
    if (items.length === 0 || !items[0].productId) return alert("Add at least one item");
    setSaving(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalDate: quotationDate,
          dueDate,
          customerName,
          customerId,
          warehouse: warehouseName,
          warehouseId,
          paymentTerms,
          notes,
          items: items.map((i) => ({
            product: i.product,
            productId: i.productId,
            qty: i.qty,
            unitPrice: i.unitPrice,
            discount: i.discount,
            tax: i.taxPct,
          })),
          subtotal,
          discount: totalDiscount,
          tax: totalTax,
          total,
        }),
      });
      if (res.ok) router.push("/dashboard/quotations");
    } catch (e) {
      console.error("Failed to create quotation", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Quotation">
      <form onSubmit={handleSubmit}>
        <div className="p-4 md:p-6 space-y-6 bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Quotation</h1>
              <p className="text-sm text-muted-foreground">Create a new quotation for a customer</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Quotation
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Quotation Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quotation Date <span className="text-destructive">*</span></label>
                  <Input type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date <span className="text-destructive">*</span></label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Customer <span className="text-destructive">*</span></label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={customerId} onChange={(e) => {
                      const c = customers.find((c) => c.id === e.target.value);
                      setCustomerId(e.target.value);
                      setCustomerName(c?.name || "");
                    }} required>
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.email ? ` - ${c.email}` : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Warehouse</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={warehouseId} onChange={(e) => {
                      const w = warehouses.find((w) => w.id === e.target.value);
                      setWarehouseId(e.target.value);
                      setWarehouseName(w?.name || "");
                    }}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Terms</label>
                  <Input placeholder="e.g., Net 30" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                    placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Quotation Items</CardTitle>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground">Product <span className="text-destructive">*</span></th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground">Qty <span className="text-destructive">*</span></th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground">Unit Price <span className="text-destructive">*</span></th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground">Discount %</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground">Tax</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground">Total</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const lineTotal = item.qty * item.unitPrice;
                      const discAmt = lineTotal * (item.discount / 100);
                      const taxAmt = (lineTotal - discAmt) * (item.taxPct / 100);
                      const itemTotal = lineTotal - discAmt + taxAmt;
                      return (
                        <tr key={item.id} className="border-b border-border">
                          <td className="p-2">
                            <select className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                              value={item.productId} onChange={(e) => updateItem(item.id, "productId", e.target.value)}>
                              <option value="">Select product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ""}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <Input type="number" min="1" className="h-8 text-xs text-center"
                              value={item.qty} onChange={(e) => updateItem(item.id, "qty", Math.max(1, parseInt(e.target.value) || 1))} />
                          </td>
                          <td className="p-2">
                            <Input type="number" min="0" step="0.01" className="h-8 text-xs text-right"
                              value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="p-2">
                            <Input type="number" min="0" step="0.01" className="h-8 text-xs text-right"
                              value={item.discount} onChange={(e) => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="p-2">
                            <select className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                              value={item.taxPct} onChange={(e) => updateItem(item.id, "taxPct", parseFloat(e.target.value) || 0)}>
                              {taxOptions.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 text-right font-medium">${itemTotal.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
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

          <Card className="ml-auto w-full max-w-sm">
            <CardHeader><CardTitle className="text-base">Quotation Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-${totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </DashboardLayout>
  );
}
