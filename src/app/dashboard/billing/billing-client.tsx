"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: string;
  users: string;
  storage: string;
  features: string[];
  popular: boolean;
  isCurrent: boolean;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  nextBilling: string;
  amount: string;
};

interface Props {
  plans: Plan[];
  subscriptions: Subscription[];
}

export function BillingClient({ plans, subscriptions }: Props) {
  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Billing & Subscriptions</h2>
          <p className="text-muted-foreground">Manage plans, subscriptions, and payments</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.popular ? "border-primary ring-1 ring-primary" : ""}
            >
              <CardHeader>
                {plan.popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
                {plan.isCurrent && <Badge variant="success" className="w-fit mb-2">Current Plan</Badge>}
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{plan.users} users</p>
                  <p className="text-sm text-muted-foreground">{plan.storage} storage</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.isCurrent ? "secondary" : plan.popular ? "default" : "outline"}
                  disabled={plan.isCurrent}
                >
                  {plan.isCurrent ? "Current Plan" : plan.popular ? "Subscribe" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active subscriptions.</p>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{sub.plan}</p>
                      <p className="text-xs text-muted-foreground">Next billing: {sub.nextBilling}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{sub.amount}</span>
                      <Badge variant="success">{sub.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
