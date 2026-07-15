"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const indicators = [
  { id: 1, name: "Task Completion Rate", dept: "Engineering", scale: "1-5", weight: 30, desc: "Measures on-time task delivery" },
  { id: 2, name: "Customer Satisfaction", dept: "Support", scale: "1-5", weight: 25, desc: "CSAT score from customer surveys" },
  { id: 3, name: "Revenue Target", dept: "Sales", scale: "1-5", weight: 35, desc: "Percentage of quarterly revenue goal" },
  { id: 4, name: "Code Quality", dept: "Engineering", scale: "1-5", weight: 20, desc: "Bug rate per release cycle" },
  { id: 5, name: "Attendance", dept: "HR", scale: "1-5", weight: 15, desc: "Punctuality and leave adherence" },
  { id: 6, name: "Lead Conversion", dept: "Marketing", scale: "1-5", weight: 40, desc: "Percentage of leads converted" },
];

export default function PerformanceIndicatorsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Performance Indicators</h2>
            <p className="text-muted-foreground">Define KPIs and rating criteria</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Add Indicator</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search indicators..." className="pl-9" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Indicators ({indicators.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Indicator</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Rating Scale</th>
                    <th className="text-left p-3 font-medium">Weight (%)</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators.map((ind) => (
                    <tr key={ind.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{ind.name}</td>
                      <td className="p-3"><Badge variant="outline">{ind.dept}</Badge></td>
                      <td className="p-3">{ind.scale}</td>
                      <td className="p-3">{ind.weight}%</td>
                      <td className="p-3 text-muted-foreground">{ind.desc}</td>
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
