"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const customers = [
  { name: "Sarah Johnson", email: "sarah.johnson@client.com" },
  { name: "Ashley Lewis", email: "ashley.lewis@client.com" },
  { name: "Elite Enterprises", email: "info@eliteenterprises.com" },
  { name: "Global Solutions Ltd", email: "contact@globalsolutions.com" },
  { name: "Michelle Hall", email: "michelle.hall@client.com" },
  { name: "Lisa Anderson", email: "lisa.anderson@client.com" },
  { name: "Dynamic Solutions", email: "info@dynamicsolutions.com" },
  { name: "Future Tech Ltd", email: "contact@futuretech.com" },
  { name: "Jennifer Martinez", email: "jennifer.martinez@client.com" },
  { name: "ABC Corporation", email: "info@abccorp.com" },
  { name: "Professional Services", email: "contact@proservices.com" },
];

const warehouses = [
  { name: "Central Distribution Center", address: "1250 Industrial Blvd" },
  { name: "East Side Warehouse", address: "420 Commerce Way" },
  { name: "West Storage Facility", address: "789 Logistics Ave" },
];

const products = [
  { name: "Consulting Service", price: 150 },
  { name: "Monthly Retainer Fee", price: 2000 },
  { name: "Support Package", price: 500 },
  { name: "Maintenance Service", price: 300 },
  { name: "Software License", price: 99 },
];

interface LineItem {
  id: string;
  product: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: string;
}

let itemId = 1;
function newItemId() {
  return String(itemId++);
}

export default function CreateRetainerPage() {
  const [retainerDate, setRetainerDate] = useState("2026-06-25");
  const [dueDate, setDueDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: newItemId(), product: "", qty: 1, unitPrice: 0, discount: 0, tax: "No tax" },
  ]);

  function addItem() {
    setItems((prev) => [...prev, { id: newItemId(), product: "", qty: 1, unitPrice: 0, discount: 0, tax: "No tax" }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        if (field === "product") {
          const found = products.find((p) => p.name === value);
          if (found) {
            updated.unitPrice = found.price;
          }
        }
        return updated;
      })
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const totalDiscount = items.reduce((sum, i) => sum + i.discount, 0);
  const total = subtotal - totalDiscount;

  return (
    <DashboardLayout title="Create Retainer">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Retainer</h1>
            <p className="text-sm text-muted-foreground">Create a new retainer agreement</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/retainers/list" className={cn(buttonVariants({ variant: "outline" }))}>Cancel</Link>
            <Button>Save Retainer</Button>
          </div>
        </div>

        {/* Retainer Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Retainer Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Retainer Date <span className="text-destructive">*</span></label>
                <Input type="date" value={retainerDate} onChange={(e) => setRetainerDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date <span className="text-destructive">*</span></label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Customer <span className="text-destructive">*</span></label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={customer} onChange={(e) => setCustomer(e.target.value)}>
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.email} value={c.name}>{c.name} - {c.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Warehouse <span className="text-destructive">*</span></label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.name} value={w.name}>{w.name} - {w.address}</option>
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

        {/* Retainer Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Retainer Items</CardTitle>
            <Button size="sm" onClick={addItem}>
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
                    const lineTotal = item.qty * item.unitPrice - item.discount;
                    return (
                      <tr key={item.id} className="border-b border-border">
                        <td className="p-2">
                          <select className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                            value={item.product} onChange={(e) => updateItem(item.id, "product", e.target.value)}>
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.name} value={p.name}>{p.name}</option>
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
                            value={item.tax} onChange={(e) => updateItem(item.id, "tax", e.target.value)}>
                            <option value="No tax">No tax</option>
                            <option value="VAT 5%">VAT 5%</option>
                            <option value="VAT 10%">VAT 10%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-medium">{lineTotal.toFixed(2)}$</td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
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

        {/* Summary */}
        <Card className="ml-auto w-full max-w-sm">
          <CardHeader><CardTitle className="text-base">Retainer Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toFixed(2)}$</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">-{totalDiscount.toFixed(2)}$</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>0.00$</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-border pt-2">
              <span>Total</span>
              <span>{total.toFixed(2)}$</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
