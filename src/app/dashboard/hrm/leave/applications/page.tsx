import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, CalendarCheck } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING:   "bg-yellow-500/10 text-yellow-700",
  APPROVED:  "bg-green-500/10 text-green-700",
  REJECTED:  "bg-red-500/10 text-red-700",
  CANCELLED: "bg-gray-500/10 text-gray-600",
};

export default async function LeaveApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const [applications, stats] = await Promise.all([
    prisma.leaveApplication.findMany({
      where: { workspaceId: wid },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true } },
        leaveType: { select: { name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }).catch(() => []),
    prisma.leaveApplication.groupBy({
      by: ["status"],
      where: { workspaceId: wid },
      _count: true,
    }).catch(() => []),
  ]);

  const statMap = Object.fromEntries(stats.map((s) => [s.status, s._count]));

  return (
    <DashboardLayout title="Leave Applications" user={session.user}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leave Applications</h1>
            <p className="text-sm text-muted-foreground">{applications.length} applications</p>
          </div>
          <Link href="/dashboard/hrm/leave/applications/create">
            <Button><Plus className="h-4 w-4 mr-2" />Apply Leave</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["PENDING","APPROVED","REJECTED","CANCELLED"].map((s) => (
            <Card key={s}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">{s}</p>
                <p className="text-2xl font-bold mt-0.5">{statMap[s] ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarCheck className="h-4 w-4" />All Applications</CardTitle></CardHeader>
          <CardContent className="p-0">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <CalendarCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No leave applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Employee</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Leave Type</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">From</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">To</th>
                      <th className="text-center py-2.5 px-4 font-medium text-muted-foreground text-xs">Days</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {applications.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-medium">{a.employee.firstName} {a.employee.lastName}</td>
                        <td className="py-2.5 px-4">{a.leaveType.name}</td>
                        <td className="py-2.5 px-4">{new Date(a.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="py-2.5 px-4">{new Date(a.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="py-2.5 px-4 text-center font-medium">{a.days}</td>
                        <td className="py-2.5 px-4"><Badge className={`text-xs ${statusColors[a.status] || ""}`}>{a.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
