"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";

interface LineItem {
  id: string;
  product: string;
  productId: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxPct: number;
}

let itemId = 100;
function newItemId() { return String(itemId++); }

const taxOptions = [
  { label: "No tax", value: 0 },
  { label: "VAT 5%", value: 5 },
  { label: "VAT 10%", value: 10 },
  { label: "VAT 12%", value: 12 },
  { label: "VAT 18%", value: 18 },
];

export default function EditQuotationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quotationDate, setQuotationDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quotations/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setQuotationDate(data.proposalDate ? data.proposalDate.slice(0, 10) : "");
        setDueDate(data.dueDate ? data.dueDate.slice(0, 10) : "");
        setCustomerName(data.customerName || "");
        setWarehouse(data.warehouse || "");
        setPaymentTerms(data.paymentTerms || "");
        setNotes(data.notes || "");
        setItems(
          (data.items || []).map((i: any) => ({
            id: newItemId(),
            product: i.product || "",
            productId: i.productId || "",
            qty: i.qty || 1,
            unitPrice: i.unitPrice || 0,
            discount: i.discount || 0,
            taxPct: i.tax || 0,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  function addItem() {
    setItems((prev) => [...prev, { id: newItemId(), product: "", productId: "", qty: 1, unitPrice: 0, discount: 0, taxPct: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(itemId: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)));
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const totalDiscount = items.reduce((s, i) => s + (i.qty * i.unitPrice) * (i.discount / 100), 0);
  const totalTax = items.reduce((s, i) => {
    const lineTotal = i.qty * i.unitPrice;
    return s + (lineTotal - lineTotal * (i.discount / 100)) * (i.taxPct / 100);
  }, 0);
  const total = subtotal - totalDiscount + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          warehouse,
          paymentTerms,
          notes,
          items: items.map((i) => ({ product: i.product, productId: i.productId, qty: i.qty, unitPrice: i.unitPrice, discount: i.discount, tax: i.taxPct })),
          subtotal,
          discount: totalDiscount,
          tax: totalTax,
        }),
      });
      if (res.ok) router.push(`/dashboard/quotations/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Quotation">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Quotation">
      <form onSubmit={handleSubmit}>
        <div className="p-4 md:p-6 space-y-6 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Edit Quotation</h1>
                <p className="text-sm text-muted-foreground">Update quotation details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Update Quotation
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Quotation Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quotation Date</label>
                  <Input type="date" value={quotationDate} onChange={(e) => setQuotationDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Customer</label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Warehouse</label>
                  <Input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Terms</label>
                  <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                    value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Items</CardTitle>
              <Button type="button" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="text-left p-3 font-medium text-xs">Product</th>
                      <th className="text-center p-3 font-medium text-xs">Qty</th>
                      <th className="text-right p-3 font-medium text-xs">Unit Price</th>
                      <th className="text-right p-3 font-medium text-xs">Discount %</th>
                      <th className="text-left p-3 font-medium text-xs">Tax</th>
                      <th className="text-right p-3 font-medium text-xs">Total</th>
                      <th className="text-center p-3 font-medium text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const lineTotal = item.qty * item.unitPrice;
                      const discAmt = lineTotal * (item.discount / 100);
                      const taxAmt = (lineTotal - discAmt) * (item.taxPct / 100);
                      return (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">
                            <Input className="h-8 text-xs" value={item.product}
                              onChange={(e) => updateItem(item.id, "product", e.target.value)} />
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
                              {taxOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </td>
                          <td className="p-2 text-right font-medium">${(lineTotal - discAmt + taxAmt).toFixed(2)}</td>
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
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-${totalDiscount.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>${totalTax.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </CardContent>
          </Card>
        </div>
      </form>
    </DashboardLayout>
  );
}
