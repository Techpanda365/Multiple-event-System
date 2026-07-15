"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const periods = [
  { id: 1, name: "Q1 2026", start: "Jan 1, 2026", end: "Mar 31, 2026", status: "Closed" },
  { id: 2, name: "Q2 2026", start: "Apr 1, 2026", end: "Jun 30, 2026", status: "Active" },
  { id: 3, name: "Q3 2026", start: "Jul 1, 2026", end: "Sep 30, 2026", status: "Draft" },
  { id: 4, name: "Q4 2026", start: "Oct 1, 2026", end: "Dec 31, 2026", status: "Draft" },
  { id: 5, name: "FY 2025", start: "Jan 1, 2025", end: "Dec 31, 2025", status: "Closed" },
];

const statusVariant: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
  Active: "success",
  Closed: "secondary",
  Draft: "warning",
};

export default function BudgetPeriodsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Budget Periods</h2>
            <p className="text-muted-foreground">Define and manage budget time periods</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />New Period
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">All Periods</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Period Name</th>
                  <th className="pb-3 font-medium">Start Date</th>
                  <th className="pb-3 font-medium">End Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-muted-foreground">{p.start}</td>
                    <td className="py-3 text-muted-foreground">{p.end}</td>
                    <td className="py-3"><Badge variant={statusVariant[p.status]}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
