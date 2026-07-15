"use client";

import type { ElementType } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShoppingCart,
  Target,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export type ModuleStat = {
  label: string;
  value: string;
};

export type ModuleLink = {
  title: string;
  href: string;
};

interface Props {
  title: string;
  description: string;
  stats: ModuleStat[];
  links: ModuleLink[];
  icon?: ElementType;
}

function StatCard({ label, value }: ModuleStat) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function ModuleDashboardClient({ title, description, stats, links, icon: Icon = LayoutDashboard }: Props) {
  return (
    <DashboardLayout title={title}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}

        {links.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button variant="outline" className="w-full justify-between">
                      {link.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export const moduleIcons: Record<string, ElementType> = {
  project: FolderKanban,
  hrm: Briefcase,
  pos: ShoppingCart,
  crm: Target,
  sales: ShoppingCart,
  account: LayoutDashboard,
};

export { Users, FolderKanban, ShoppingCart, Target, Briefcase };
