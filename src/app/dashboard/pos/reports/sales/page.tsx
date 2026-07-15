"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CalendarDays } from "lucide-react";

const summaries = [
  { title: "Today", value: "$4,280", change: "+12%", icon: DollarSign },
  { title: "This Week", value: "$24,590", change: "+8%", icon: TrendingUp },
  { title: "This Month", value: "$98,450", change: "+15%", icon: CalendarDays },
];

const dailySales = [
  { date: "Jun 18", orders: 12, sales: "$2,890", avg: "$240.83" },
  { date: "Jun 17", orders: 15, sales: "$3,450", avg: "$230.00" },
  { date: "Jun 16", orders: 10, sales: "$2,150", avg: "$215.00" },
  { date: "Jun 15", orders: 18, sales: "$4,120", avg: "$228.89" },
  { date: "Jun 14", orders: 8, sales: "$1,890", avg: "$236.25" },
  { date: "Jun 13", orders: 14, sales: "$3,210", avg: "$229.29" },
  { date: "Jun 12", orders: 11, sales: "$2,560", avg: "$232.73" },
];

export default function SalesReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Sales Report</h2>
          <p className="text-muted-foreground">Daily, weekly and monthly sales performance</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {summaries.map((s) => (
            <Card key={s.title}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">{s.title}</CardTitle>
                <s.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
                <Badge variant="success" className="mt-1">{s.change}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Daily Sales Breakdown</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Orders</th>
                  <th className="text-left p-3 font-medium">Sales</th>
                  <th className="text-left p-3 font-medium">Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((d) => (
                  <tr key={d.date} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium">{d.date}</td>
                    <td className="p-3">{d.orders}</td>
                    <td className="p-3">{d.sales}</td>
                    <td className="p-3 text-muted-foreground">{d.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Sales Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mr-2" /> Chart Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
