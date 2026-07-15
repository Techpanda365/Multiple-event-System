"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MinusCircle, ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

type InvoiceItem = {
  product: string;
  productId: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  taxLabel: string;
  total: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyItem(): InvoiceItem {
  return { product: "", productId: "", qty: 1, unitPrice: 0, discount: 0, tax: 0, taxLabel: "No tax", total: 0 };
}

export default function CreateInvoiceClient() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"product" | "service">("product");
  const [recurring, setRecurring] = useState("No");

  const [formItems, setFormItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [formData, setFormData] = useState({
    invoiceDate: todayStr(),
    dueDate: "",
    customerId: "",
    customerName: "",
    warehouseId: "",
    warehouseName: "",
    paymentTerms: "",
    notes: "",
    status: "Draft",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/sales/customers").then((r) => r.ok ? r.json() : []),
      fetch("/api/purchase/warehouses").then((r) => r.ok ? r.json() : []),
      fetch("/api/products").then((r) => r.ok ? r.json() : []),
    ]).then(([c, w, p]) => {
      setCustomers(c);
      setWarehouses(w);
      setProducts(p);
    }).finally(() => setLoading(false));
  }, []);

  const calcItemTotal = (item: InvoiceItem) => {
    const lineTotal = item.qty * item.unitPrice;
    const discAmt = lineTotal * (item.discount / 100);
    const taxAmt = (lineTotal - discAmt) * (item.tax / 100);
    return lineTotal - discAmt + taxAmt;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: number | string) => {
    setFormItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "productId" && typeof value === "string") {
        const p = products.find((pr) => pr.id === value);
        if (p) {
          next[index].product = p.name;
          next[index].unitPrice = p.price || 0;
        }
      }
      next[index].total = calcItemTotal(next[index]);
      return next;
    });
  };

  const addItem = () => setFormItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index: number) => setFormItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);

  const formSubtotal = formItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const formDiscount = formItems.reduce((sum, item) => sum + item.qty * item.unitPrice * (item.discount / 100), 0);
  const formTax = formItems.reduce((sum, item) => {
    const lineTotal = item.qty * item.unitPrice;
    const discAmt = lineTotal * (item.discount / 100);
    return sum + (lineTotal - discAmt) * (item.tax / 100);
  }, 0);
  const formTotal = formSubtotal - formDiscount + formTax;

  const handleSave = async (status: string) => {
    if (!formData.customerName) { setError("Customer is required"); return; }
    if (formItems.length === 0 || !formItems[0].product) { setError("At least one item is required"); return; }
    setSaving(true); setError("");

    try {
      const items = formItems.map((item) => ({
        product: item.product,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total || calcItemTotal(item),
      }));

      const res = await fetch("/api/sales/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, items, status, discount: formDiscount, tax: formTax }),
      });

      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      router.push("/dashboard/sales-invoice/invoices");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Create Invoice">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  const invoiceDateObj = formData.invoiceDate ? new Date(formData.invoiceDate + "T00:00:00") : new Date();

  return (
    <DashboardLayout title="Create Invoice">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales-invoice/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Sales Invoice</h1>
          </div>
        </div>

        {error && <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border">
          <button onClick={() => setActiveTab("product")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "product" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            Product Wise
          </button>
          <button onClick={() => setActiveTab("service")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "service" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            Service Wise
          </button>
        </div>

        <Card>
          <CardContent className="p-5 space-y-6">
            {/* Sales Invoice Details */}
            <div>
              <h2 className="text-base font-semibold mb-4">Sales Invoice Details</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Invoice Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Invoice Date*</label>
                  <div className="relative">
                    <Input type="date" value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="pr-20" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      {formatDisplayDate(invoiceDateObj)}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Due Date*</label>
                  <div className="relative">
                    <Input type="date" value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="pr-20" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      {formData.dueDate ? formatDisplayDate(new Date(formData.dueDate + "T00:00:00")) : "Select date"}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Customer*</label>
                  <select value={formData.customerId} onChange={(e) => {
                    const c = customers.find((c) => c.id === e.target.value);
                    setFormData({ ...formData, customerId: e.target.value, customerName: c?.name || "" });
                  }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="">Select Customer</option>
                    {customers.map((c) => (<option key={c.id} value={c.id}>[{c.customerCode || "N/A"}] {c.name}{c.email ? ` - ${c.email}` : ""}</option>))}
                  </select>
                </div>

                {/* Warehouse */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Warehouse*</label>
                  <select value={formData.warehouseId} onChange={(e) => {
                    const w = warehouses.find((w) => w.id === e.target.value);
                    setFormData({ ...formData, warehouseId: e.target.value, warehouseName: w?.name || "" });
                  }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}{w.address ? ` - ${w.address}` : ""}</option>))}
                  </select>
                </div>

                {/* Payment Terms */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Payment Terms</label>
                  <Input placeholder="e.g., Net 30" value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 mt-4">
                <label className="text-sm font-medium">Notes</label>
                <textarea placeholder="Additional notes..." value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              </div>
            </div>

            {/* Recurring */}
            <div className="space-y-1.5 max-w-xs">
              <label className="text-sm font-medium">Recurring Sales Invoice?</label>
              <select value={recurring} onChange={(e) => setRecurring(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option>No</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>

            {/* Invoice Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Sales Invoice Items</h3>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-2 md:p-3 font-medium text-xs uppercase tracking-wider">Product *</th>
                      <th className="text-center p-2 md:p-3 font-medium text-xs uppercase tracking-wider">Qty *</th>
                      <th className="text-right p-2 md:p-3 font-medium text-xs uppercase tracking-wider">Unit Price *</th>
                      <th className="text-right p-2 md:p-3 font-medium text-xs uppercase tracking-wider">Discount %</th>
                      <th className="text-right p-2 md:p-3 font-medium text-xs uppercase tracking-wider">Tax</th>
                      <th className="text-right p-2 md:p-3 font-medium text-xs uppercase tracking-wider">Total</th>
                      <th className="text-center p-2 md:p-3 font-medium text-xs uppercase tracking-wider w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formItems.map((item, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="p-1.5 md:p-2">
                          <select value={item.productId} onChange={(e) => updateItem(i, "productId", e.target.value)}
                            className="h-9 w-full min-w-[130px] rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">Select</option>
                            {products.map((p) => (<option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ""}</option>))}
                          </select>
                        </td>
                        <td className="p-1.5 md:p-2"><Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value) || 0)} className="h-9 w-16 text-center text-xs" /></td>
                        <td className="p-1.5 md:p-2"><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value) || 0)} className="h-9 w-24 text-right text-xs" /></td>
                        <td className="p-1.5 md:p-2"><Input type="number" min="0" max="100" value={item.discount} onChange={(e) => updateItem(i, "discount", Number(e.target.value) || 0)} className="h-9 w-16 text-right text-xs" /></td>
                        <td className="p-1.5 md:p-2">
                          <select value={item.tax} onChange={(e) => updateItem(i, "tax", Number(e.target.value))} className="h-9 w-20 rounded-md border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value={0}>No tax</option>
                            <option value={5}>5%</option>
                            <option value={10}>10%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={20}>20%</option>
                          </select>
                        </td>
                        <td className="p-1.5 md:p-2 text-right text-xs font-medium whitespace-nowrap">{formatCurrency(item.total || calcItemTotal(item))}</td>
                        <td className="p-1.5 md:p-2 text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}><MinusCircle className="h-4 w-4 text-destructive" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <h3 className="text-sm font-semibold mb-3">Invoice Summary</h3>
                <div className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(formSubtotal)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">Discount</span><span className="text-red-500">-{formatCurrency(formDiscount)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(formTax)}</span></div>
                <div className="flex justify-between py-2 border-t border-border font-semibold text-base"><span>Total</span><span>{formatCurrency(formTotal)}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Link href="/dashboard/sales-invoice/invoices"><Button variant="outline" disabled={saving}>Cancel</Button></Link>
              <Button onClick={() => handleSave("Draft")} disabled={saving} variant="outline">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save as Draft
              </Button>
              <Button onClick={() => handleSave("Posted")} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
