"use client";

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Total Leads", value: "847", icon: Users, change: "+12%", href: "/dashboard/crm/leads" },
  { title: "Open Deals", value: "24", icon: Target, change: "+4%", href: "/dashboard/crm/deals" },
  { title: "Conversion Rate", value: "23.5%", icon: TrendingUp, change: "+2.1%", href: "/dashboard/crm/reports/leads" },
  { title: "Avg Deal Value", value: "$12,850", icon: DollarSign, change: "+8%", href: "/dashboard/crm/reports/deals" },
];

const sections = [
  { title: "Leads", description: "View and manage all leads in the pipeline", href: "/dashboard/crm/leads" },
  { title: "Deals", description: "Track deals through the sales pipeline", href: "/dashboard/crm/deals" },
  { title: "Reports", description: "Analyze CRM performance metrics", href: "/dashboard/crm/reports" },
  { title: "Setup", description: "Configure CRM stages, sources, and rules", href: "/dashboard/crm/setup" },
];

export default function CRMOverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">CRM</h2>
          <p className="text-muted-foreground">Manage leads, deals, and customer relationships</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} this month</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <Link key={section.title} href={section.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
