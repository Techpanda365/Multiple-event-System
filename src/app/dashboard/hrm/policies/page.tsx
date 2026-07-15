"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";

const policies = [
  { id: 1, name: "Code of Conduct", category: "HR", desc: "Standards of professional behavior and ethics for all employees.", updated: "Jun 01, 2026", status: "Active" },
  { id: 2, name: "Leave Policy", category: "HR", desc: "Annual, sick, and personal leave entitlement and application process.", updated: "May 15, 2026", status: "Active" },
  { id: 3, name: "IT Security Policy", category: "IT", desc: "Guidelines for secure use of company technology and data.", updated: "May 10, 2026", status: "Active" },
  { id: 4, name: "Expense Reimbursement", category: "Finance", desc: "Process for submitting and approving business expense claims.", updated: "Apr 20, 2026", status: "Active" },
  { id: 5, name: "Travel Policy", category: "Finance", desc: "Rules and allowances for domestic and international business travel.", updated: "Apr 01, 2026", status: "Under Review" },
  { id: 6, name: "Remote Work Policy", category: "HR", desc: "Guidelines for working remotely including eligibility and expectations.", updated: "Mar 15, 2026", status: "Active" },
];

const statusColors: Record<string, "success" | "warning"> = { Active: "success", "Under Review": "warning" };

export default function PoliciesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Company Policies</h2>
            <p className="text-muted-foreground">View and manage company policies</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Add Policy</Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search policies..." className="pl-9" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <CardTitle className="text-sm">{p.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Last updated: {p.updated}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.desc}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">{p.category}</Badge>
                  <Badge variant={statusColors[p.status]}>{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
