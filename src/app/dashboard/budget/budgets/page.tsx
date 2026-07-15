"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const budgets = [
  { id: 1, name: "Marketing Q2", period: "Q2 2026", dept: "Marketing", allocated: 50000, spent: 32000, remaining: 18000 },
  { id: 2, name: "Engineering Q2", period: "Q2 2026", dept: "Engineering", allocated: 120000, spent: 85000, remaining: 35000 },
  { id: 3, name: "Operations Q2", period: "Q2 2026", dept: "Operations", allocated: 30000, spent: 30000, remaining: 0 },
  { id: 4, name: "Sales Q2", period: "Q2 2026", dept: "Sales", allocated: 40000, spent: 15000, remaining: 25000 },
  { id: 5, name: "HR Q2", period: "Q2 2026", dept: "HR", allocated: 20000, spent: 18000, remaining: 2000 },
];

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Budgets</h2>
            <p className="text-muted-foreground">Create and manage department budgets</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />New Budget
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Department Budgets</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Budget Name</th>
                  <th className="pb-3 font-medium">Period</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium text-right">Allocated</th>
                  <th className="pb-3 font-medium text-right">Spent</th>
                  <th className="pb-3 font-medium text-right">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const pct = Math.round((b.spent / b.allocated) * 100);
                  const over = b.remaining === 0;
                  return (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{b.name}</td>
                      <td className="py-3 text-muted-foreground">{b.period}</td>
                      <td className="py-3">{b.dept}</td>
                      <td className="py-3 text-right">${b.allocated.toLocaleString()}</td>
                      <td className="py-3 text-right">${b.spent.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={over ? "text-red-500 font-medium" : ""}>
                          ${b.remaining.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
