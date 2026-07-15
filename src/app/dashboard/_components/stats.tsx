"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Briefcase, FileText, TrendingUp, Activity } from "lucide-react";

interface StatsProps {
  stats: {
    totalRevenue: number;
    activeProjects: number;
    openLeads: number;
    totalEmployees: number;
    pendingInvoices: number;
    monthlyGrowth: number;
  };
}

const items = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, prefix: "$", format: true },
  { key: "activeProjects", label: "Active Projects", icon: Activity, suffix: "" },
  { key: "openLeads", label: "Open Leads", icon: TrendingUp, suffix: "" },
  { key: "totalEmployees", label: "Employees", icon: Users, suffix: "" },
  { key: "pendingInvoices", label: "Pending Invoices", icon: FileText, suffix: "" },
  { key: "monthlyGrowth", label: "Monthly Growth", icon: Briefcase, suffix: "%" },
];

export function DashboardStats({ stats }: StatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const value = stats[item.key as keyof typeof stats];
        const Icon = item.icon;
        return (
          <Card key={item.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.prefix || ""}{value}{item.suffix || ""}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.key === "totalRevenue" ? "+23.1% from last month" : "Updated just now"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
