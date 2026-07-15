"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  MinusCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type ProposalItem = {
  product: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
};

const CUSTOMERS = [
  { name: "Sarah Johnson", email: "sarah.johnson@client.com" },
  { name: "Global Solutions Ltd", email: "info@globalsolutions.com" },
  { name: "ABC Corporation", email: "billing@abccorp.com" },
  { name: "Jessica Harris", email: "jessica.h@email.com" },
  { name: "Maria Rodriguez", email: "maria.r@email.com" },
  { name: "Lisa Anderson", email: "lisa.a@email.com" },
  { name: "Emily Davis", email: "emily.d@email.com" },
];

const WAREHOUSES = [
  { name: "Central Distribution Center", address: "1250 Industrial Blvd" },
  { name: "West Side Warehouse", address: "4500 West Ave" },
  { name: "East Coast Storage", address: "789 Harbor Dr" },
];

const PRODUCTS = [
  "Consulting Service",
  "Software License",
  "Hardware Package",
  "Maintenance Contract",
  "Training Session",
  "Cloud Storage",
  "Security Audit",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const emptyItem = (): ProposalItem => ({ product: "", qty: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 });

export function ProposalCreateForm() {
  const [formItems, setFormItems] = useState<ProposalItem[]>([emptyItem()]);
  const [formData, setFormData] = useState({
    proposalDate: todayStr(),
    dueDate: "",
    customerName: "",
    customerEmail: "",
    warehouse: "",
    paymentTerms: "",
    notes: "",
    specialInstructions: "",
  });

  const calcItemTotal = (item: ProposalItem) => {
    const lineTotal = item.qty * item.unitPrice;
    const discAmt = lineTotal * (item.discount / 100);
    const taxAmt = (lineTotal - discAmt) * (item.tax / 100);
    return lineTotal - discAmt + taxAmt;
  };

  const updateItem = (index: number, field: keyof ProposalItem, value: number | string) => {
    setFormItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      next[index].total = calcItemTotal(next[index]);
      return next;
    });
  };

  const addItem = () => setFormItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index: number) => {
    setFormItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const formSubtotal = formItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const formDiscount = formItems.reduce((sum, item) => sum + item.qty * item.unitPrice * (item.discount / 100), 0);
  const formTax = formItems.reduce((sum, item) => {
    const lineTotal = item.qty * item.unitPrice;
    const discAmt = lineTotal * (item.discount / 100);
    return sum + (lineTotal - discAmt) * (item.tax / 100);
  }, 0);
  const formTotal = formSubtotal - formDiscount + formTax;

  return (
    <DashboardLayout title="Create Proposal">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/modules/proposal">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Sales Proposal</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to create a new proposal</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Proposal Date*</label>
                <Input type="date" value={formData.proposalDate} onChange={(e) => setFormData({ ...formData, proposalDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Due Date*</label>
                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Customer*</label>
                <select value={formData.customerName} onChange={(e) => {
                  const c = CUSTOMERS.find((c) => c.name === e.target.value);
                  setFormData({ ...formData, customerName: e.target.value, customerEmail: c?.email || "" });
                }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Customer</option>
                  {CUSTOMERS.map((c) => (<option key={c.email} value={c.name}>{c.name} - {c.email}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Warehouse</label>
                <select value={formData.warehouse} onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select Warehouse</option>
                  {WAREHOUSES.map((w) => (<option key={w.name} value={w.name}>{w.name} - {w.address}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payment Terms</label>
                <Input placeholder="e.g., Net 30" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes</label>
                <textarea placeholder="Additional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Special Instructions</label>
                <textarea placeholder="Enter special instructions" value={formData.specialInstructions} onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Sales Proposal Items</h3>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-2 font-medium text-xs">Product *</th>
                      <th className="text-center p-2 font-medium text-xs">Qty *</th>
                      <th className="text-right p-2 font-medium text-xs">Unit Price *</th>
                      <th className="text-right p-2 font-medium text-xs">Discount %</th>
                      <th className="text-right p-2 font-medium text-xs">Tax %</th>
                      <th className="text-right p-2 font-medium text-xs">Total</th>
                      <th className="text-center p-2 font-medium text-xs w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formItems.map((item, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="p-1.5">
                          <select value={item.product} onChange={(e) => updateItem(i, "product", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">Select</option>
                            {PRODUCTS.map((p) => (<option key={p} value={p}>{p}</option>))}
                          </select>
                        </td>
                        <td className="p-1.5">
                          <Input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value) || 0)} className="h-9 text-center text-xs" />
                        </td>
                        <td className="p-1.5">
                          <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value) || 0)} className="h-9 text-right text-xs" />
                        </td>
                        <td className="p-1.5">
                          <Input type="number" min="0" max="100" value={item.discount} onChange={(e) => updateItem(i, "discount", Number(e.target.value) || 0)} className="h-9 text-right text-xs" />
                        </td>
                        <td className="p-1.5">
                          <select value={item.tax} onChange={(e) => updateItem(i, "tax", Number(e.target.value))} className="h-9 w-full rounded-md border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value={0}>No tax</option>
                            <option value={5}>5%</option>
                            <option value={10}>10%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={20}>20%</option>
                          </select>
                        </td>
                        <td className="p-1.5 text-right text-xs font-medium">{formatCurrency(item.total || calcItemTotal(item))}</td>
                        <td className="p-1.5 text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}>
                            <MinusCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(formSubtotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-500">-{formatCurrency(formDiscount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(formTax)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-border font-semibold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(formTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Link href="/dashboard/modules/proposal">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button>Save as Draft</Button>
              <Button className="bg-primary">Send Proposal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
