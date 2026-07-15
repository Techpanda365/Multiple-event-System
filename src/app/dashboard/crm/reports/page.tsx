"use client";

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CRMReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">CRM Reports</h2>
          <p className="text-muted-foreground">View detailed CRM analytics and reports</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/crm/reports/leads">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Lead Reports</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Lead generation, conversion rates, and source analytics</p>
                <span className="text-sm text-primary flex items-center gap-1">
                  View Reports <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/crm/reports/deals">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Deal Reports</CardTitle>
                <Target className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Pipeline analysis, deal value, and stage distribution</p>
                <span className="text-sm text-primary flex items-center gap-1">
                  View Reports <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
