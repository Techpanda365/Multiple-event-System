// app/dashboard/users/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersOverviewClient from "./users-overview-client";

export default async function UsersOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isSuperAdmin = session.user.role?.toUpperCase() === "SUPER_ADMIN";
  
  // ✅ Super Admin ko admin users page pe bhejo
  if (isSuperAdmin) {
    redirect("/admin/users");
  }

  // ✅ Company user ke liye normal page
  return <UsersOverviewClient />;
}