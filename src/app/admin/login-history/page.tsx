import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { LoginHistoryClient } from "./login-history-client";

export default async function LoginHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isSuperAdmin = session.user.role?.toUpperCase() === "SUPER_ADMIN";
  if (!isSuperAdmin) redirect("/dashboard");

  const logs = await prisma.loginLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const history = logs.map((log) => ({
    user: log.email,
    role: log.role || "USER",
    ip: log.ip || "-",
    locationDevice: log.userAgent ? log.userAgent.substring(0, 50) : "-",
    time: formatTimeAgo(log.createdAt),
    status: log.status === "SUCCESS" ? "Success" : "Failed",
  }));

  return <LoginHistoryClient history={history} user={session.user} />;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
