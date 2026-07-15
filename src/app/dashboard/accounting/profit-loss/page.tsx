"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

export default function ProfitLossPage() {
  const [revenues, setRevenues] = useState<{ name: string; amount: number }[]>([]);
  const [expenses, setExpenses] = useState<{ name: string; amount: number }[]>([]);

  useEffect(() => {
    fetch('/api/accounting/profit-loss')
      .then(res => res.json())
      .then(data => {
        if (data.revenues) setRevenues(data.revenues);
        if (data.expenses) setExpenses(data.expenses);
      })
      .catch(() => { setRevenues([]); setExpenses([]); });
  }, []);

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const isProfitable = netProfit > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Profit & Loss</h2>
            <p className="text-muted-foreground">Income statement</p>
          </div>
          <div className="flex gap-2">
            <select className="flex h-10 w-[160px] rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="">Select period</option></select>
            <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Expenses</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net {isProfitable ? "Profit" : "Loss"}</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${isProfitable ? "text-green-600" : "text-red-600"}`}>${netProfit.toLocaleString()}</div></CardContent></Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /><CardTitle className="text-sm font-medium">Revenue</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {revenues.map((r, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{r.name}</span>
                  <span className="text-sm font-medium">${r.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-base border-t-2 border-border">
                <span>Total Revenue</span>
                <span>${totalRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2"><TrendingDown className="h-5 w-5 text-red-600" /><CardTitle className="text-sm font-medium">Expenses</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {expenses.map((e, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{e.name}</span>
                  <span className="text-sm font-medium">${e.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-bold text-base border-t-2 border-border">
                <span>Total Expenses</span>
                <span>${totalExpenses.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={`${isProfitable ? "border-green-300" : "border-red-300"}`}>
          <CardContent className="flex items-center justify-between py-4">
            <span className="font-semibold">Net {isProfitable ? "Profit" : "Loss"}</span>
            <div className="flex items-center gap-3">
              <Badge variant={isProfitable ? "success" : "destructive"}>{isProfitable ? "Profitable" : "Loss"}</Badge>
              <span className={`font-bold text-lg ${isProfitable ? "text-green-600" : "text-red-600"}`}>${Math.abs(netProfit).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
