"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Wallet, PiggyBank, BarChart4, ArrowRight } from "lucide-react";
import Link from "next/link";

const modules = [
  { href: "/dashboard/budget/periods", label: "Budget Periods", desc: "Define budget timeframes", icon: CalendarRange },
  { href: "/dashboard/budget/budgets", label: "Budgets", desc: "Manage department budgets", icon: Wallet },
  { href: "/dashboard/budget/allocations", label: "Allocations", desc: "Allocate funds to categories", icon: PiggyBank },
  { href: "/dashboard/budget/monitoring", label: "Monitoring", desc: "Track spending vs budget", icon: BarChart4 },
];

export default function BudgetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Budget Planner</h2>
          <p className="text-muted-foreground">Plan, allocate, and monitor budgets across departments</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Periods</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">1</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Budget</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">$260K</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Spent</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">$180K</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Departments</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">5</div></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <Link key={m.href} href={m.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <m.icon className="h-5 w-5 text-muted-foreground" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-sm mt-2">{m.label}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{m.desc}</p></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
