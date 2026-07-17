"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, List, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RetainersPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, monthlyRevenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/retainers")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const total = list.length;
        const active = list.filter((r: any) => r.status === "Active" || r.status === "Sent").length;
        const pending = list.filter((r: any) => r.status === "Draft").length;
        const monthlyRevenue = list
          .filter((r: any) => r.status !== "Cancelled")
          .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        setStats({ total, active, monthlyRevenue, pending });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Retainers</h2>
            <p className="text-muted-foreground">Manage retainer agreements and recurring payments</p>
          </div>
          <Link href="/dashboard/retainers/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Retainer
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Retainers</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `$${stats.monthlyRevenue.toLocaleString()}`}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pending}</div>
            </CardContent>
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
                    <CardTitle className="text-sm">Payments</CardTitle>
                    <p className="text-xs text-muted-foreground">Track retainer payments</p>
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
