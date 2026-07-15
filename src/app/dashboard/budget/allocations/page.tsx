"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const allocations = [
  { id: 1, ref: "ALLOC-001", budget: "Marketing Q2", category: "Advertising", amount: 20000, date: "Apr 1, 2026", status: "Approved" },
  { id: 2, ref: "ALLOC-002", budget: "Engineering Q2", category: "Tools & Software", amount: 15000, date: "Apr 3, 2026", status: "Approved" },
  { id: 3, ref: "ALLOC-003", budget: "Marketing Q2", category: "Content Creation", amount: 8000, date: "Apr 5, 2026", status: "Pending" },
  { id: 4, ref: "ALLOC-004", budget: "Operations Q2", category: "Equipment", amount: 12000, date: "Apr 8, 2026", status: "Approved" },
  { id: 5, ref: "ALLOC-005", budget: "Sales Q2", category: "Travel", amount: 5000, date: "Apr 10, 2026", status: "Rejected" },
];

const statusVariant: Record<string, "default" | "secondary" | "success" | "destructive" | "warning"> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "destructive",
};

export default function AllocationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Budget Allocations</h2>
            <p className="text-muted-foreground">Allocate funds to specific categories</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />New Allocation
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Allocation Records</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{a.ref}</td>
                    <td className="py-3 text-muted-foreground">{a.budget}</td>
                    <td className="py-3">{a.category}</td>
                    <td className="py-3 text-right">${a.amount.toLocaleString()}</td>
                    <td className="py-3">{a.date}</td>
                    <td className="py-3"><Badge variant={statusVariant[a.status]}>{a.status}</Badge></td>
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
