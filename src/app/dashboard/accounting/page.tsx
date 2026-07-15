import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, TrendingDown, TrendingUp, DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  PAID:          "bg-green-500/10 text-green-700",
  SENT:          "bg-blue-500/10 text-blue-700",
  DRAFT:         "bg-gray-500/10 text-gray-600",
  OVERDUE:       "bg-red-500/10 text-red-700",
  PARTIALLY_PAID:"bg-yellow-500/10 text-yellow-700",
  CANCELLED:     "bg-gray-400/10 text-gray-500",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default async function AccountingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const [invoiceAgg, expenseAgg, recentInvoices, recentExpenses, overdueCount] = await Promise.all([
    prisma.invoice.aggregate({ where: { workspaceId: wid }, _sum: { total: true }, _count: true }),
    prisma.expense.aggregate({ where: { workspaceId: wid }, _sum: { amount: true }, _count: true }),
    prisma.invoice.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, number: true, customerName: true, total: true, status: true, dueDate: true, createdAt: true },
    }),
    prisma.expense.findMany({
      where: { workspaceId: wid },
      orderBy: { date: "desc" },
      take: 5,
      select: { id: true, category: true, amount: true, date: true, description: true },
    }),
    prisma.invoice.count({ where: { workspaceId: wid, status: "OVERDUE" } }),
  ]);

  const totalRevenue = invoiceAgg._sum.total ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <DashboardLayout title="Accounting" user={session.user}>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Accounting</h2>
            <p className="text-muted-foreground text-sm">Invoices, expenses and financial overview</p>
          </div>
          <Link href="/dashboard/accounting/customers">
            <Button><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: fmt(totalRevenue), sub: `${invoiceAgg._count} invoices`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Total Expenses", value: fmt(totalExpenses), sub: `${expenseAgg._count} entries`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Net Profit", value: fmt(netProfit), sub: netProfit >= 0 ? "Profitable" : "Net loss", icon: DollarSign, color: netProfit >= 0 ? "text-blue-500" : "text-red-500", bg: netProfit >= 0 ? "bg-blue-500/10" : "bg-red-500/10" },
            { label: "Overdue Invoices", value: overdueCount, sub: "Need attention", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                  </div>
                  <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Invoices table */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
              <Link href="/dashboard/sales-invoice/invoices">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-muted-foreground">No invoices yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Invoice</th>
                        <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Customer</th>
                        <th className="text-right py-2.5 px-4 font-medium text-muted-foreground text-xs">Amount</th>
                        <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {recentInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30">
                          <td className="py-2.5 px-4 font-medium">{inv.number}</td>
                          <td className="py-2.5 px-4 truncate max-w-[140px]">{inv.customerName}</td>
                          <td className="py-2.5 px-4 text-right font-semibold">{fmt(inv.total)}</td>
                          <td className="py-2.5 px-4">
                            <Badge className={`text-xs ${statusColors[inv.status] || "bg-gray-100 text-gray-600"}`}>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
              <Link href="/dashboard/accounting/expense">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentExpenses.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-muted-foreground">No expenses yet</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentExpenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{exp.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600 ml-2">{fmt(exp.amount)}</span>
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
