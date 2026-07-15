"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const goals = [
  { id: 1, employee: "John Doe", title: "Ship Q1 Features", desc: "Deliver all Q1 roadmap items", start: "Jan 6, 2026", end: "Mar 28, 2026", status: "Achieved", progress: 100 },
  { id: 2, employee: "Sarah Smith", title: "Increase MQLs", desc: "Boost qualified leads by 20%", start: "Feb 3, 2026", end: "Apr 30, 2026", status: "In Progress", progress: 65 },
  { id: 3, employee: "Mike Johnson", title: "Close $50k Deals", desc: "Close enterprise deals worth $50k", start: "Mar 1, 2026", end: "May 31, 2026", status: "In Progress", progress: 40 },
  { id: 4, employee: "Lisa Brown", title: "Update Onboarding", desc: "Revise employee onboarding docs", start: "Apr 1, 2026", end: "Jun 15, 2026", status: "Not Started", progress: 0 },
  { id: 5, employee: "Tom Wilson", title: "Refactor Auth Module", desc: "Rewrite authentication service", start: "May 4, 2026", end: "Jul 30, 2026", status: "Not Started", progress: 0 },
  { id: 6, employee: "Emma Davis", title: "Audit Q2 Finances", desc: "Complete Q2 financial audit", start: "Jan 13, 2026", end: "Mar 20, 2026", status: "Achieved", progress: 100 },
];

const statusColors: Record<string, "success" | "warning" | "secondary"> = {
  Achieved: "success",
  "In Progress": "warning",
  "Not Started": "secondary",
};

export default function EmployeeGoalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Employee Goals</h2>
            <p className="text-muted-foreground">Track OKRs and individual objectives</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search goals..." className="pl-9" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Goals ({goals.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Goal Title</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-left p-3 font-medium">Start Date</th>
                    <th className="text-left p-3 font-medium">End Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((g) => (
                    <tr key={g.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{g.employee}</td>
                      <td className="p-3">{g.title}</td>
                      <td className="p-3 text-muted-foreground">{g.desc}</td>
                      <td className="p-3 text-muted-foreground">{g.start}</td>
                      <td className="p-3 text-muted-foreground">{g.end}</td>
                      <td className="p-3"><Badge variant={statusColors[g.status]}>{g.status}</Badge></td>
                      <td className="p-3">{g.progress}%</td>
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
