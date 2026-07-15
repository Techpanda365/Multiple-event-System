import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [invoices, employees, leads, projects, deals] = await Promise.all([
    prisma.invoice.findMany(),
    prisma.employee.count({ where: { isActive: true } }),
    prisma.crmLead.findMany(),
    prisma.project.findMany(),
    prisma.crmDeal.count(),
  ]);

  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total, 0);
  const pendingInvoices = invoices.filter((i) =>
    ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(i.status)
  ).length;
  const openLeads = leads.filter((l) => !["WON", "LOST"].includes(l.status)).length;
  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS").length;

  return (
    <ReportsClient
      stats={{
        totalRevenue,
        totalEmployees: employees,
        openLeads,
        activeProjects,
        pendingInvoices,
        totalDeals: deals,
      }}
    />
  );
}
