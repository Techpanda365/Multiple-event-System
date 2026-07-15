"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban, DollarSign, Users, Target,
  TrendingUp, TrendingDown, FileText, Briefcase,
  CheckCircle, Clock, AlertCircle,
} from "lucide-react";

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalEmployees: number;
  openLeads: number;
  wonDeals: number;
  totalRevenue: number;
  totalInvoices: number;
  totalExpenses: number;
  pendingLeaves: number;
  totalMembers: number;
}

interface RecentInvoice {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date | string;
}

interface RecentExpense {
  id: string;
  category: string;
  amount: number;
  date: Date | string;
  description?: string | null;
}

interface Props {
  isSuperAdmin: boolean;
  user: any;
  workspaceName?: string;
  stats: Stats;
  recentInvoices: RecentInvoice[];
  recentExpenses: RecentExpense[];
}

const statusColors: Record<string, string> = {
  PAID:      "bg-green-500/10 text-green-700",
  SENT:      "bg-blue-500/10 text-blue-700",
  DRAFT:     "bg-gray-500/10 text-gray-600",
  OVERDUE:   "bg-red-500/10 text-red-700",
  CANCELLED: "bg-gray-500/10 text-gray-500",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function DashboardPageClient({ user, workspaceName, stats, recentInvoices, recentExpenses }: Props) {
  const netProfit = stats.totalRevenue - stats.totalExpenses;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      sub: `${stats.totalInvoices} invoices`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats.totalExpenses),
      sub: "All time",
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Net Profit",
      value: formatCurrency(netProfit),
      sub: netProfit >= 0 ? "Profitable" : "Loss",
      icon: TrendingUp,
      color: netProfit >= 0 ? "text-blue-500" : "text-red-500",
      bg: netProfit >= 0 ? "bg-blue-500/10" : "bg-red-500/10",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      sub: `${stats.totalProjects} total`,
      icon: FolderKanban,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Employees",
      value: stats.totalEmployees,
      sub: `${stats.totalMembers} workspace members`,
      icon: Briefcase,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Open Leads",
      value: stats.openLeads,
      sub: `${stats.wonDeals} deals won`,
      icon: Target,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Team Members",
      value: stats.totalMembers,
      sub: "In workspace",
      icon: Users,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves,
      sub: "Needs approval",
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <DashboardLayout user={user} title="Dashboard">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.name || "User"}</span>!
            {workspaceName && <> — <span className="text-primary">{workspaceName}</span></>}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{s.title}</p>
                    <p className="text-xl font-bold mt-0.5 truncate">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{s.sub}</p>
                  </div>
                  <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Data */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <div className="px-4 pb-4 text-sm text-muted-foreground">No invoices yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {recentInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{inv.customerName}</p>
                        <p className="text-xs text-muted-foreground">{inv.number} · {formatDate(inv.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-sm font-semibold">{formatCurrency(inv.total)}</span>
                        <Badge className={`text-xs ${statusColors[inv.status] || "bg-gray-100 text-gray-600"}`}>
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentExpenses.length === 0 ? (
                <div className="px-4 pb-4 text-sm text-muted-foreground">No expenses yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {recentExpenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{exp.category}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {exp.description || "—"} · {formatDate(exp.date)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600 flex-shrink-0 ml-2">
                        -{formatCurrency(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Status Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4 pb-4 px-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{stats.wonDeals} Deals Won</p>
                <p className="text-xs text-muted-foreground">CRM pipeline</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4 pb-4 px-4 flex items-center gap-3">
              <FolderKanban className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{stats.activeProjects} Active Projects</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`${stats.pendingLeaves > 0 ? "border-yellow-500/20 bg-yellow-500/5" : "border-gray-200"}`}>
            <CardContent className="pt-4 pb-4 px-4 flex items-center gap-3">
              <AlertCircle className={`h-8 w-8 flex-shrink-0 ${stats.pendingLeaves > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-semibold">{stats.pendingLeaves} Pending Leaves</p>
                <p className="text-xs text-muted-foreground">Needs approval</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
