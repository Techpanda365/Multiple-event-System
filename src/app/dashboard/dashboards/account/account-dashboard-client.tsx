"use client";

import type { ElementType } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface MonthlyPayment {
  month: string;
  revenue: number;
  expense: number;
}

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status?: string;
}

interface AccountDashboardData {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalClients: number;
  totalVendors: number;
  pendingReceivables: number;
  monthlyPayments: MonthlyPayment[];
  recentRevenue: Transaction[];
  recentExpenses: Transaction[];
}

interface Props {
  data: AccountDashboardData;
  user?: { name?: string | null; image?: string | null; email?: string };
}

const statusVariant: Record<string, "success" | "default" | "destructive" | "secondary"> = {
  PAID: "success",
  SENT: "default",
  PARTIALLY_PAID: "default",
  OVERDUE: "destructive",
  DRAFT: "secondary",
  CANCELLED: "secondary",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: ElementType;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-red-600"
        : "text-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function AccountDashboardClient({ data, user }: Props) {
  const maxValue = Math.max(
    ...data.monthlyPayments.flatMap((item) => [item.revenue, item.expense]),
    1
  );

  return (
    <DashboardLayout user={user} title="Account Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Account Dashboard</h2>
          <p className="text-muted-foreground">
            Financial overview with client and vendor payment tracking
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={DollarSign} tone="positive" />
          <StatCard label="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={TrendingDown} tone="negative" />
          <StatCard label="Net Income" value={formatCurrency(data.netIncome)} icon={TrendingUp} />
          <StatCard label="Clients" value={String(data.totalClients)} icon={Users} />
          <StatCard label="Vendors" value={String(data.totalVendors)} icon={Building2} />
          <StatCard label="Pending Receivables" value={formatCurrency(data.pendingReceivables)} icon={ArrowDownLeft} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Payment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Revenue (incoming)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Expenses (outgoing)
                </span>
              </div>
              <div className="flex items-end gap-3 h-48">
                {data.monthlyPayments.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1 h-36 w-full justify-center">
                      <div
                        className="w-3 rounded-t-md bg-emerald-500/80"
                        style={{ height: `${(item.revenue / maxValue) * 100}%` }}
                        title={`Revenue ${formatCurrency(item.revenue)}`}
                      />
                      <div
                        className="w-3 rounded-t-md bg-red-400/80"
                        style={{ height: `${(item.expense / maxValue) * 100}%` }}
                        title={`Expense ${formatCurrency(item.expense)}`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Revenue</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {data.recentRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground">No revenue transactions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Client</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Invoice</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentRevenue.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-2">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">{item.subtitle}</td>
                          <td className="py-3 px-2 font-semibold text-emerald-600">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-3 px-2">
                            {item.status && (
                              <Badge variant={statusVariant[item.status] || "secondary"}>
                                {item.status.replace("_", " ")}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {data.recentExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expense transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.recentExpenses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.subtitle} · {item.date}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
