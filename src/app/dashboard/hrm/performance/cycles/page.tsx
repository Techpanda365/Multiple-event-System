"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const cycles = [
  { id: 1, name: "Q1 2026", start: "Jan 1, 2026", end: "Mar 31, 2026", status: "Completed" },
  { id: 2, name: "Q2 2026", start: "Apr 1, 2026", end: "Jun 30, 2026", status: "Active" },
  { id: 3, name: "Q3 2026", start: "Jul 1, 2026", end: "Sep 30, 2026", status: "Upcoming" },
  { id: 4, name: "Q4 2026", start: "Oct 1, 2026", end: "Dec 31, 2026", status: "Upcoming" },
  { id: 5, name: "H1 2026", start: "Jan 1, 2026", end: "Jun 30, 2026", status: "Active" },
  { id: 6, name: "FY 2025-26", start: "Jul 1, 2025", end: "Jun 30, 2026", status: "Completed" },
];

const statusColors: Record<string, "success" | "warning" | "secondary"> = {
  Active: "success",
  Completed: "secondary",
  Upcoming: "warning",
};

export default function ReviewCyclesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Review Cycles</h2>
            <p className="text-muted-foreground">Manage performance review periods</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />New Cycle</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search cycles..." className="pl-9" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Cycles ({cycles.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Cycle Name</th>
                    <th className="text-left p-3 font-medium">Start Date</th>
                    <th className="text-left p-3 font-medium">End Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.start}</td>
                      <td className="p-3 text-muted-foreground">{c.end}</td>
                      <td className="p-3"><Badge variant={statusColors[c.status]}>{c.status}</Badge></td>
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
