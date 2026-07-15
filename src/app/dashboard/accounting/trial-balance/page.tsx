"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Download, RefreshCw } from "lucide-react";

export default function TrialBalancePage() {
  const [accounts, setAccounts] = useState<{ name: string; debit: number; credit: number }[]>([]);

  useEffect(() => {
    fetch('/api/accounting/trial-balance')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAccounts(data);
        else if (data.accounts) setAccounts(data.accounts);
      })
      .catch(() => setAccounts([]));
  }, []);

  const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);
  const balanced = totalDebit === totalCredit;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trial Balance</h2>
            <p className="text-muted-foreground">Verify that total debits equal total credits</p>
          </div>
          <div className="flex gap-2">
            <select className="flex h-10 w-[160px] rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="">Select period</option></select>
            <Button variant="outline"><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Trial Balance</CardTitle>
            <span className={`text-xs px-2 py-0.5 rounded-full ${balanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{balanced ? "Balanced" : "Out of Balance"}</span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Account</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Debit</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{a.name}</td>
                      <td className="py-3 px-2 text-right">{a.debit ? `$${a.debit.toLocaleString()}` : "-"}</td>
                      <td className="py-3 px-2 text-right">{a.credit ? `$${a.credit.toLocaleString()}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-bold text-base">
                    <td className="py-3 px-2">Total</td>
                    <td className="py-3 px-2 text-right">${totalDebit.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">${totalCredit.toLocaleString()}</td>
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
