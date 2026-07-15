"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, Download } from "lucide-react";

interface LedgerEntry {
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetch('/api/accounting/ledger')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data);
        else if (data.entries) setEntries(data.entries);
      })
      .catch(() => setEntries([]));
  }, []);

  const total = entries.length > 0 ? entries[entries.length - 1].balance : 0;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">General Ledger</h2>
            <p className="text-muted-foreground">View all journal entries and account balances</p>
          </div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">From</span><Input type="date" className="w-[150px]" /></div>
          <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">To</span><Input type="date" className="w-[150px]" /></div>
          <select className="flex h-10 w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="all">All Accounts</option></select>
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="w-[200px] pl-8" /></div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Journal Entries</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Account</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Debit</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Credit</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2 text-muted-foreground">{e.date}</td>
                      <td className="py-3 px-2 font-medium">{e.account}</td>
                      <td className="py-3 px-2 text-muted-foreground">{e.description}</td>
                      <td className="py-3 px-2 text-right">{e.debit ? `$${e.debit.toLocaleString()}` : "-"}</td>
                      <td className="py-3 px-2 text-right">{e.credit ? `$${e.credit.toLocaleString()}` : "-"}</td>
                      <td className="py-3 px-2 text-right font-semibold">${e.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-semibold">
                    <td className="py-3 px-2" colSpan={5}>Closing Balance</td>
                    <td className="py-3 px-2 text-right">${total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
