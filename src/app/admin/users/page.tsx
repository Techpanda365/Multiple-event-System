// app/admin/users/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "./admin-users-client";

export default async function AdminUsersPage() {
  const session = await auth();
  
  console.log("AdminUsersPage - Session:", session?.user?.role);
  
  if (!session?.user) {
    console.log("No session, redirecting to login");
    redirect("/login");
  }

  const isSuperAdmin = session.user.role?.toUpperCase() === "SUPER_ADMIN";
  console.log("AdminUsersPage - isSuperAdmin:", isSuperAdmin);
  
  if (!isSuperAdmin) {
    console.log("Not Super Admin, redirecting to dashboard");
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "USER",
    status: user.isActive ? "Enabled" : "Disabled",
    company: user.companyName || "",
  }));

  return <AdminUsersClient users={formattedUsers} user={session.user} />;
}