// app/dashboard/users/list/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { UsersListClient } from "./users-client";
import { getUserWorkspace } from "@/lib/workspace";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

export default async function UsersListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Sirf workspace ke members dikhao — sab users nahi
  const workspace = await getUserWorkspace(session.user.id);

  if (!workspace) {
    return (
      <UsersListClient
        workspaceName="No Workspace"
        users={[]}
      />
    );
  }

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, isActive: true, role: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <UsersListClient
      workspaceName={workspace.name}
      users={members.map((m) => ({
        id: m.user.id,
        name: m.user.name || m.user.email,
        email: m.user.email,
        phone: m.user.phone || "",
        // Workspace role use karo (ADMIN/MANAGER/STAFF) — user ka global role nahi
        role: roleLabels[m.role] || m.role,
        workspace: workspace.name,
        status: m.user.isActive ? "Enabled" : "Disabled",
      }))}
    />
  );
}