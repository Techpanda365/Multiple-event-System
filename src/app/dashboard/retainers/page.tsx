"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, List, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RetainersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Retainers</h2>
            <p className="text-muted-foreground">Manage retainer agreements and recurring payments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Retainer
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Retainers</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">8</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">5</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">$9,500</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">2</div></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Link href="/dashboard/retainers/list">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <List className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-sm">Retainer List</CardTitle>
                    <p className="text-xs text-muted-foreground">View all retainer agreements</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dashboard/retainers/payments">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-sm">Retainer Payments</CardTitle>
                    <p className="text-xs text-muted-foreground">Track retainer payment history</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
