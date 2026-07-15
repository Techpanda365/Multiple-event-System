"use client";

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, TrendingUp, Clock } from "lucide-react";

const monthlyTrends = [
  { month: "Jan 2026", leads: 48, qualified: 22, converted: 8, rate: "16.7%" },
  { month: "Feb 2026", leads: 52, qualified: 28, converted: 11, rate: "21.2%" },
  { month: "Mar 2026", leads: 61, qualified: 35, converted: 14, rate: "23.0%" },
  { month: "Apr 2026", leads: 55, qualified: 30, converted: 12, rate: "21.8%" },
  { month: "May 2026", leads: 68, qualified: 40, converted: 16, rate: "23.5%" },
  { month: "Jun 2026", leads: 42, qualified: 26, converted: 10, rate: "23.8%" },
];

export default function LeadReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Lead Reports</h2>
          <p className="text-muted-foreground">Analyze lead generation and conversion metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Leads This Month</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs text-muted-foreground mt-1">Last month: 68</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Leads by Source</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">6 sources</p>
              <p className="text-xs text-muted-foreground mt-1">Website: 38% | Referral: 22%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">23.8%</p>
              <p className="text-xs text-green-600 mt-1">+0.3% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Avg Response Time</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">4.2 hrs</p>
              <p className="text-xs text-green-600 mt-1">-0.8 hrs vs last month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Lead Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Month</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Total Leads</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Qualified</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Converted</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrends.map((row) => (
                    <tr key={row.month} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{row.month}</td>
                      <td className="py-3 px-2">{row.leads}</td>
                      <td className="py-3 px-2">{row.qualified}</td>
                      <td className="py-3 px-2">{row.converted}</td>
                      <td className="py-3 px-2">{row.rate}</td>
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
