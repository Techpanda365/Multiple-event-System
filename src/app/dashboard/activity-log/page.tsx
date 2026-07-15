import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default async function ActivityLogPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const logs = await prisma.activityLog.findMany({
    where: { workspaceId: wid },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  function timeAgo(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-500/10 text-green-700",
    UPDATE: "bg-blue-500/10 text-blue-700",
    DELETE: "bg-red-500/10 text-red-700",
    VIEW:   "bg-gray-500/10 text-gray-600",
  };

  return (
    <DashboardLayout title="Activity Log" user={session.user}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-muted-foreground">{logs.length} recent activities</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><History className="h-4 w-4" />Recent Activity</CardTitle></CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No activity recorded yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30">
                    <div className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0 ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>
                      {log.action}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium capitalize">{log.entity}</span>
                        {log.description && <span className="text-muted-foreground"> — {log.description}</span>}
                      </p>
                      {log.entityId && <p className="text-xs text-muted-foreground font-mono">ID: {log.entityId}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
