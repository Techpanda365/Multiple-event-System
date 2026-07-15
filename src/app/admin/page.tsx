import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/app/dashboard/_components/admin-dashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isSuperAdmin = session.user.role?.toUpperCase() === "SUPER_ADMIN";
  if (!isSuperAdmin) redirect("/dashboard");

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
