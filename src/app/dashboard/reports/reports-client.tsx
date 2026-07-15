"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, FolderKanban, Target } from "lucide-react";

type ReportStats = {
  totalRevenue: number;
  totalEmployees: number;
  openLeads: number;
  activeProjects: number;
  pendingInvoices: number;
  totalDeals: number;
};

interface Props {
  stats: ReportStats;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ReportsClient({ stats }: Props) {
  const cards = [
    {
      title: "Sales Report",
      description: `${formatCurrency(stats.totalRevenue)} total revenue · ${stats.pendingInvoices} pending invoices`,
      icon: DollarSign,
      href: "/dashboard/sales/invoices",
    },
    {
      title: "HR Report",
      description: `${stats.totalEmployees} employees across departments`,
      icon: Users,
      href: "/dashboard/hrm",
    },
    {
      title: "Financial Report",
      description: `${formatCurrency(stats.totalRevenue)} revenue tracked in workspace`,
      icon: TrendingUp,
      href: "/dashboard/dashboards/account",
    },
    {
      title: "Project Analytics",
      description: `${stats.activeProjects} active projects in progress`,
      icon: BarChart3,
      href: "/dashboard/projects",
    },
    {
      title: "CRM Analytics",
      description: `${stats.openLeads} open leads · ${stats.totalDeals} deals in pipeline`,
      icon: Target,
      href: "/dashboard/dashboards/crm",
    },
    {
      title: "Project Dashboard",
      description: "Detailed project performance and task tracking",
      icon: FolderKanban,
      href: "/dashboard/projects/report",
    },
  ];

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">View business insights and performance metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
