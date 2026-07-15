"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const reviews = [
  { id: 1, employee: "John Doe", reviewer: "Alice Wang", cycle: "Q1 2026", rating: 4.5, date: "Mar 28, 2026", status: "Completed" },
  { id: 2, employee: "Sarah Smith", reviewer: "Bob Chen", cycle: "Q1 2026", rating: 4.2, date: "Mar 25, 2026", status: "Completed" },
  { id: 3, employee: "Mike Johnson", reviewer: "Alice Wang", cycle: "Q2 2026", rating: 0, date: "Jun 10, 2026", status: "Pending" },
  { id: 4, employee: "Lisa Brown", reviewer: "Carol Lee", cycle: "Q2 2026", rating: 0, date: "Jun 12, 2026", status: "Pending" },
  { id: 5, employee: "Tom Wilson", reviewer: "Bob Chen", cycle: "Q1 2026", rating: 3.8, date: "Mar 20, 2026", status: "Completed" },
  { id: 6, employee: "Emma Davis", reviewer: "Carol Lee", cycle: "Q1 2026", rating: 4.7, date: "Mar 22, 2026", status: "Completed" },
];

const statusColors: Record<string, "success" | "secondary"> = {
  Completed: "success",
  Pending: "secondary",
};

export default function EmployeeReviewsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Employee Reviews</h2>
            <p className="text-muted-foreground">View performance review submissions</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />New Review</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reviews..." className="pl-9" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Reviews ({reviews.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Reviewer</th>
                    <th className="text-left p-3 font-medium">Cycle</th>
                    <th className="text-left p-3 font-medium">Rating</th>
                    <th className="text-left p-3 font-medium">Review Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{r.employee}</td>
                      <td className="p-3">{r.reviewer}</td>
                      <td className="p-3"><Badge variant="outline">{r.cycle}</Badge></td>
                      <td className="p-3">{r.rating > 0 ? r.rating.toFixed(1) : "—"}</td>
                      <td className="p-3 text-muted-foreground">{r.date}</td>
                      <td className="p-3"><Badge variant={statusColors[r.status]}>{r.status}</Badge></td>
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
