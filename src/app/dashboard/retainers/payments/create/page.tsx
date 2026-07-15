"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

const customers = [
  "Sarah Johnson",
  "Ashley Lewis",
  "Elite Enterprises",
  "Global Solutions Ltd",
  "Michelle Hall",
  "Lisa Anderson",
  "Dynamic Solutions",
  "Future Tech Ltd",
  "Jennifer Martinez",
  "ABC Corporation",
  "Professional Services",
];

const bankAccounts = [
  { name: "Business Checking Account", number: "1234567890" },
  { name: "Business Savings Account", number: "0987654321" },
  { name: "PayPal Business", number: "paypal@business.com" },
];

export default function CreateRetainerPaymentPage() {
  const [paymentDate, setPaymentDate] = useState("2026-06-25");
  const [customer, setCustomer] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <DashboardLayout title="Create Retainer Payment">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Retainer Payment</h1>
            <p className="text-sm text-muted-foreground">Record a payment against a retainer agreement</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/retainers/payments" className={cn(buttonVariants({ variant: "outline" }))}>Cancel</Link>
            <Button>Save Payment</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Payment Date <span className="text-destructive">*</span></label>
                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Customer <span className="text-destructive">*</span></label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={customer} onChange={(e) => setCustomer(e.target.value)}>
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Bank Account <span className="text-destructive">*</span></label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.number} value={acc.name}>{acc.name} ({acc.number})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Reference Number</label>
                <Input placeholder="Check number, etc." value={reference}
                  onChange={(e) => setReference(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Total Payment Amount <span className="text-destructive">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" step="0.01" min="0" className="pl-7" placeholder="0.00"
                    value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                  placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
