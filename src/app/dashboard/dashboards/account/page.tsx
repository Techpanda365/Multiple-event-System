import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AccountDashboardClient } from "./account-dashboard-client";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

export default async function AccountDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
    }),
  ]);

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID");
  const pendingInvoices = invoices.filter((invoice) =>
    ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status)
  );

  const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingReceivables = pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalClients = new Set(invoices.map((invoice) => invoice.customerName)).size;
  const totalVendors = new Set(expenses.map((expense) => expense.category)).size;

  const now = new Date();
  const monthlyPayments = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      month: monthLabel(date),
      key: monthKey(date),
      revenue: 0,
      expense: 0,
    };
  });

  for (const invoice of paidInvoices) {
    const key = monthKey(invoice.createdAt);
    const bucket = monthlyPayments.find((item) => item.key === key);
    if (bucket) bucket.revenue += invoice.total;
  }

  for (const expense of expenses) {
    const key = monthKey(expense.date);
    const bucket = monthlyPayments.find((item) => item.key === key);
    if (bucket) bucket.expense += expense.amount;
  }

  return (
    <AccountDashboardClient
      user={session.user}
      data={{
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        totalClients,
        totalVendors,
        pendingReceivables,
        monthlyPayments: monthlyPayments.map(({ month, revenue, expense }) => ({
          month,
          revenue,
          expense,
        })),
        recentRevenue: invoices.slice(0, 6).map((invoice) => ({
          id: invoice.id,
          title: invoice.customerName,
          subtitle: invoice.number,
          amount: invoice.total,
          date: invoice.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: invoice.status,
        })),
        recentExpenses: expenses.slice(0, 6).map((expense) => ({
          id: expense.id,
          title: expense.category,
          subtitle: expense.description || "Expense",
          amount: expense.amount,
          date: expense.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        })),
      }}
    />
  );
}
