import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardPageClient } from "./_components/dashboard-page-client";
import { AdminDashboard } from "./_components/admin-dashboard";
import { getUserWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role?.toUpperCase() || "";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  if (isSuperAdmin) {
    const workspaceCount = await prisma.workspace.count();
    const userCount = await prisma.user.count();
    const totalRevenue = await prisma.invoice.aggregate({ _sum: { total: true } });
    return (
      <AdminDashboard
        workspaceCount={workspaceCount}
        userCount={userCount}
        totalRevenue={totalRevenue._sum.total || 0}
        user={session.user}
      />
    );
  }

  // Company user — workspace-specific data
  const workspace = await getUserWorkspace(session.user.id);
  const workspaceId = workspace?.id;

  const [
    totalProjects,
    activeProjects,
    totalEmployees,
    openLeads,
    wonDeals,
    invoiceStats,
    expenseStats,
    recentInvoices,
    recentExpenses,
    pendingLeaves,
    totalMembers,
  ] = await Promise.all([
    prisma.project.count({ where: { workspaceId: workspaceId ?? "" } }),
    prisma.project.count({ where: { workspaceId: workspaceId ?? "", status: "IN_PROGRESS" } }),
    prisma.employee.count({ where: { workspaceId: workspaceId ?? "", isActive: true } }),
    prisma.crmLead.count({ where: { workspaceId: workspaceId ?? "", status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } } }),
    prisma.crmDeal.count({ where: { workspaceId: workspaceId ?? "", stage: "closed_won" } }),
    prisma.invoice.aggregate({ where: { workspaceId: workspaceId ?? "" }, _sum: { total: true }, _count: true }),
    prisma.expense.aggregate({ where: { workspaceId: workspaceId ?? "" }, _sum: { amount: true } }),
    prisma.invoice.findMany({
      where: { workspaceId: workspaceId ?? "" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, number: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.expense.findMany({
      where: { workspaceId: workspaceId ?? "" },
      orderBy: { date: "desc" },
      take: 5,
      select: { id: true, category: true, amount: true, date: true, description: true },
    }),
    prisma.leaveApplication.count({ where: { workspaceId: workspaceId ?? "", status: "PENDING" } }).catch(() => 0),
    prisma.workspaceMember.count({ where: { workspaceId: workspaceId ?? "" } }),
  ]);

  return (
    <DashboardPageClient
      isSuperAdmin={false}
      user={session.user}
      workspaceName={workspace?.name || "My Workspace"}
      stats={{
        totalProjects,
        activeProjects,
        totalEmployees,
        openLeads,
        wonDeals,
        totalRevenue: invoiceStats._sum.total || 0,
        totalInvoices: invoiceStats._count,
        totalExpenses: expenseStats._sum.amount || 0,
        pendingLeaves,
        totalMembers,
      }}
      recentInvoices={recentInvoices}
      recentExpenses={recentExpenses}
    />
  );
}
