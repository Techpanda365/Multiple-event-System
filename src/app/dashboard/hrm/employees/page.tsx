import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Users, Briefcase } from "lucide-react";

export default async function EmployeesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const [employees, departments, deptCounts] = await Promise.all([
    prisma.employee.findMany({
      where: { workspaceId: wid },
      include: { department: { select: { name: true } } },
      orderBy: { firstName: "asc" },
    }),
    prisma.department.findMany({ where: { workspaceId: wid }, orderBy: { name: "asc" } }),
    prisma.employee.groupBy({ by: ["departmentId"], where: { workspaceId: wid, isActive: true }, _count: true }),
  ]);

  const active = employees.filter((e) => e.isActive).length;

  return (
    <DashboardLayout title="Employees" user={session.user}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employees</h1>
            <p className="text-sm text-muted-foreground">{active} active · {employees.length} total</p>
          </div>
          <Link href="/dashboard/hrm/employees/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{employees.length}</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-red-500">{employees.length - active}</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Departments</p><p className="text-2xl font-bold">{departments.length}</p></CardContent></Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" />All Employees</CardTitle></CardHeader>
          <CardContent className="p-0">
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">No employees yet</p>
                <Link href="/dashboard/hrm/employees/create">
                  <Button size="sm" className="mt-3"><Plus className="h-4 w-4 mr-1" />Add First Employee</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Employee ID</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Name</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Email</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Department</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Position</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-mono text-xs">{emp.employeeId}</td>
                        <td className="py-2.5 px-4 font-medium">{emp.firstName} {emp.lastName}</td>
                        <td className="py-2.5 px-4 text-muted-foreground truncate max-w-[180px]">{emp.email}</td>
                        <td className="py-2.5 px-4">{emp.department?.name || "—"}</td>
                        <td className="py-2.5 px-4">{emp.position || "—"}</td>
                        <td className="py-2.5 px-4">
                          <Badge className={emp.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}>
                            {emp.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
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
