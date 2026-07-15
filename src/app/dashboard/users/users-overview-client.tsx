// app/dashboard/users/users-overview-client.tsx
"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";

const cards = [
  { title: "Total Users", value: "294", icon: Users, description: "Registered accounts", href: "/dashboard/users/list" },
  { title: "Roles", value: "5", icon: Shield, description: "Access levels defined", href: "/dashboard/users/roles" },
  { title: "Active Now", value: "18", icon: UserCheck, description: "Currently online", href: "/dashboard/users/list" },
  { title: "New Today", value: "3", icon: UserPlus, description: "Joined in last 24h", href: "/dashboard/users/list" },
];

export default function UsersOverviewClient() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Link href="/dashboard/users/roles" className="hover:underline">Roles Overview</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage 5 roles including Super Admin, Admin, Manager, Staff, and Customer with granular permissions.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Link href="/dashboard/users/list" className="hover:underline">Users Overview</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              View all 294 registered users. Filter by role, status, or workspace to manage access.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}