"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, DollarSign, ShoppingCart, Percent, Users, TrendingUp, PlusCircle } from "lucide-react";
import Link from "next/link";

interface PlanSummary {
  id: string;
  name: string;
  price: number;
  interval: string;
  isActive: boolean;
}

interface SubscriptionSummary {
  id: string;
  status: string;
  plan: { name: string; price: number; interval: string };
  user: { name: string; email: string };
}

export default function SubscriptionOverviewPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<SubscriptionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPlans: 0, activeSubscriptions: 0, totalRevenue: 0, activePlans: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/subscription-plans").then(r => r.json()),
      fetch("/api/admin/subscriptions").then(r => r.json()),
    ]).then(([plansRes, subsRes]) => {
      const plansList = plansRes.plans || [];
      const subsList = subsRes.subscriptions || [];
      setPlans(plansList);
      setRecentSubscriptions(subsList.slice(0, 5));
      setStats({
        totalPlans: plansList.length,
        activeSubscriptions: subsList.filter((s: any) => s.status === "SUCCEEDED").length,
        totalRevenue: subsList.reduce((sum: number, s: any) => sum + (s.plan?.price || 0), 0),
        activePlans: plansList.filter((p: any) => p.isActive).length,
      });
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Subscription</h2>
            <p className="text-muted-foreground">Manage plans, coupons, and orders</p>
          </div>
          <Link href="/admin/subscription/settings">
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
              Manage Plans
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Plans</CardTitle>
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPlans}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePlans}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                  <Users className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Subscription Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  {plans.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No plans created</p>
                  ) : (
                    <div className="space-y-3">
                      {plans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-medium">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">${plan.price} / {plan.interval?.toLowerCase()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={plan.isActive ? "default" : "secondary"}>
                              {plan.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{plan.subscriptions?.length || 0} subs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentSubscriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No subscriptions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentSubscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{sub.user?.name || sub.user?.email}</p>
                            <p className="text-xs text-muted-foreground">{sub.plan?.name}</p>
                          </div>
                          <Badge variant={sub.status === "SUCCEEDED" ? "default" : "secondary"}>
                            {sub.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/subscription/coupons"><Button variant="outline" size="sm"><Percent className="h-4 w-4 mr-1" />Coupons</Button></Link>
              <Link href="/admin/subscription/orders"><Button variant="outline" size="sm"><ShoppingCart className="h-4 w-4 mr-1" />Orders</Button></Link>
              <Link href="/admin/subscription/bank-transfer-requests"><Button variant="outline" size="sm"><DollarSign className="h-4 w-4 mr-1" />Bank Transfers</Button></Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
