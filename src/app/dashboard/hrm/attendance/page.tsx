import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  PRESENT:  "bg-green-500/10 text-green-700",
  ABSENT:   "bg-red-500/10 text-red-700",
  LATE:     "bg-yellow-500/10 text-yellow-700",
  HALF_DAY: "bg-orange-500/10 text-orange-700",
  ON_LEAVE: "bg-blue-500/10 text-blue-700",
};

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  // Today's date range
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const [todayAttendance, monthStats] = await Promise.all([
    prisma.attendance.findMany({
      where: { workspaceId: wid, date: { gte: todayStart, lte: todayEnd } },
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } }, shift: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.attendance.groupBy({
      by: ["status"],
      where: { workspaceId: wid, date: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } },
      _count: true,
    }).catch(() => []),
  ]);

  const statMap = Object.fromEntries(monthStats.map((s) => [s.status, s._count]));

  return (
    <DashboardLayout title="Attendance" user={session.user}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <p className="text-sm text-muted-foreground">
              Today — {today.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <Button asChild><Link href="/dashboard/hrm/attendance/create"><Plus className="h-4 w-4 mr-2" />Mark Attendance</Link></Button>
        </div>

        {/* This month stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {["PRESENT","ABSENT","LATE","HALF_DAY","ON_LEAVE"].map((s) => (
            <Card key={s}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">{s.replace("_"," ")}</p>
                <p className="text-2xl font-bold mt-0.5">{statMap[s] ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's records */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" />Today's Attendance</CardTitle></CardHeader>
          <CardContent className="p-0">
            {todayAttendance.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">No attendance marked for today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Employee</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Shift</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Check In</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Check Out</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {todayAttendance.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-medium">{a.employee.firstName} {a.employee.lastName} <span className="text-xs text-muted-foreground">({a.employee.employeeId})</span></td>
                        <td className="py-2.5 px-4">{a.shift?.name || "—"}</td>
                        <td className="py-2.5 px-4">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="py-2.5 px-4">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
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
