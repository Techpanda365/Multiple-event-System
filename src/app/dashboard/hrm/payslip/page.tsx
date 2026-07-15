"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download } from "lucide-react";

const payslips = [
  { id: 1, name: "John Doe", month: "May 2026", basic: 50000, allowances: 15000, deductions: 8000, netPay: 57000, status: "Paid" },
  { id: 2, name: "Sarah Smith", month: "May 2026", basic: 45000, allowances: 12000, deductions: 7000, netPay: 50000, status: "Sent" },
  { id: 3, name: "Mike Johnson", month: "May 2026", basic: 55000, allowances: 18000, deductions: 10000, netPay: 63000, status: "Generated" },
  { id: 4, name: "Lisa Brown", month: "April 2026", basic: 40000, allowances: 10000, deductions: 6000, netPay: 44000, status: "Paid" },
  { id: 5, name: "Tom Wilson", month: "April 2026", basic: 35000, allowances: 8000, deductions: 5000, netPay: 38000, status: "Paid" },
  { id: 6, name: "Emma Davis", month: "April 2026", basic: 42000, allowances: 11000, deductions: 6500, netPay: 46500, status: "Paid" },
];

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  Paid: "success",
  Sent: "warning",
  Generated: "secondary",
};

export default function PayslipPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Payslips</h2>
            <p className="text-muted-foreground">Generate and manage employee payslips</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
            <Button><Plus className="h-4 w-4 mr-2" />Generate Payslips</Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payslips..." className="pl-9" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">All Payslips ({payslips.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Month</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Basic</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Allowances</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Deductions</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Net Pay</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((ps) => (
                    <tr key={ps.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{ps.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{ps.month}</td>
                      <td className="py-3 px-2 text-right">{ps.basic.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right">{ps.allowances.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right text-destructive">{ps.deductions.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-medium">{ps.netPay.toLocaleString()}</td>
                      <td className="py-3 px-2"><Badge variant={statusVariant[ps.status]}>{ps.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
