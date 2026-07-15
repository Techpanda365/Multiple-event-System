"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserPlus, Building2 } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "New Invoice", icon: FileText, href: "/dashboard/accounting" },
  { label: "Add Employee", icon: UserPlus, href: "/dashboard/hrm" },
  { label: "New Project", icon: Building2, href: "/dashboard/projects" },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex items-center justify-start gap-2 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
