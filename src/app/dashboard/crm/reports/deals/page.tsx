"use client";

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CheckCircle, XCircle, DollarSign } from "lucide-react";

const dealsByStage = [
  { stage: "New", count: 8, value: "$45,000" },
  { stage: "Qualified", count: 12, value: "$98,000" },
  { stage: "Proposal", count: 7, value: "$62,000" },
  { stage: "Negotiation", count: 5, value: "$86,000" },
  { stage: "Closed Won", count: 18, value: "$210,000" },
  { stage: "Closed Lost", count: 9, value: "$54,000" },
];

export default function DealReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Deal Reports</h2>
          <p className="text-muted-foreground">Analyze deal pipeline and revenue metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Total Deals Value</CardTitle>
              <Banknote className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$555,000</p>
              <p className="text-xs text-muted-foreground mt-1">Across all stages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Won Deals</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$210,000</p>
              <p className="text-xs text-muted-foreground mt-1">18 deals closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Lost Deals</CardTitle>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$54,000</p>
              <p className="text-xs text-muted-foreground mt-1">9 deals lost</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Avg Deal Size</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$11,667</p>
              <p className="text-xs text-muted-foreground mt-1">Across won deals</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Stage</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Count</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {dealsByStage.map((row) => (
                    <tr key={row.stage} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{row.stage}</td>
                      <td className="py-3 px-2">{row.count}</td>
                      <td className="py-3 px-2">{row.value}</td>
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
