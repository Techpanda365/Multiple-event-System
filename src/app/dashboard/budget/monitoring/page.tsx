"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const departments = [
  { name: "Marketing", allocated: 50000, spent: 32000 },
  { name: "Engineering", allocated: 120000, spent: 85000 },
  { name: "Operations", allocated: 30000, spent: 30000 },
  { name: "Sales", allocated: 40000, spent: 15000 },
  { name: "HR", allocated: 20000, spent: 18000 },
];

function ProgressBar({ spent, allocated }: { spent: number; allocated: number }) {
  const pct = Math.min(Math.round((spent / allocated) * 100), 100);
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">${spent.toLocaleString()} / ${allocated.toLocaleString()}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Budget Monitoring</h2>
            <p className="text-muted-foreground">Track budget vs actual spending by department</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Budget</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">$260,000</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">$180,000</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Remaining</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-500">$80,000</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Department Budget vs Actual</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {departments.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{d.name}</span>
                </div>
                <ProgressBar spent={d.spent} allocated={d.allocated} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
