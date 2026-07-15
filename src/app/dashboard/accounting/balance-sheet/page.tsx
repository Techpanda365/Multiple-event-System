"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Download, Printer } from "lucide-react";

export default function BalanceSheetPage() {
  const [assets, setAssets] = useState<{ name: string; amount: number }[]>([]);
  const [liabilities, setLiabilities] = useState<{ name: string; amount: number }[]>([]);
  const [equity, setEquity] = useState<{ name: string; amount: number }[]>([]);

  useEffect(() => {
    fetch('/api/accounting/balance-sheet')
      .then(res => res.json())
      .then(data => {
        if (data.assets) setAssets(data.assets);
        if (data.liabilities) setLiabilities(data.liabilities);
        if (data.equity) setEquity(data.equity);
      })
      .catch(() => { setAssets([]); setLiabilities([]); setEquity([]); });
  }, []);

  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.amount, 0);
  const totalEquity = equity.reduce((s, a) => s + a.amount, 0);
  const balanced = totalAssets === totalLiabilities + totalEquity;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Balance Sheet</h2>
            <p className="text-muted-foreground">Financial position</p>
          </div>
          <div className="flex gap-2">
            <select className="flex h-10 w-[160px] rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="">Select period</option></select>
            <Button variant="outline"><Printer className="h-4 w-4 mr-1" /> Print</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold text-blue-600">Assets</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {assets.map((a, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm">{a.name}</span>
                  <span className="text-sm font-medium">${a.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-base border-t-2 border-border">
                <span>Total Assets</span>
                <span>${totalAssets.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold text-orange-600">Liabilities</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {liabilities.map((l, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm">{l.name}</span>
                  <span className="text-sm font-medium">${l.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-base border-t-2 border-border">
                <span>Total Liabilities</span>
                <span>${totalLiabilities.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold text-green-600">Equity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {equity.map((e, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm">{e.name}</span>
                  <span className="text-sm font-medium">${e.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-base border-t-2 border-border">
                <span>Total Equity</span>
                <span>${totalEquity.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={`${balanced ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
          <CardContent className="flex items-center justify-between py-4">
            <span className="font-semibold">Accounting Equation: Assets = Liabilities + Equity</span>
            <span className="font-bold text-lg">
              ${totalAssets.toLocaleString()} = ${(totalLiabilities + totalEquity).toLocaleString()}
              {balanced ? " ✓" : " ✗"}
            </span>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
