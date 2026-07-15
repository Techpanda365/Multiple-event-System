import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT:      "bg-gray-500/10 text-gray-600",
  PROCESSING: "bg-blue-500/10 text-blue-700",
  PAID:       "bg-green-500/10 text-green-700",
};

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default async function PayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const payrollRuns = await prisma.payrollRun.findMany({
    where: { workspaceId: wid },
    include: { _count: { select: { payslips: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  }).catch(() => []);

  const totalPaid = payrollRuns.filter((r) => r.status === "PAID").reduce((s, r) => s + r.totalNet, 0);
  const draft = payrollRuns.filter((r) => r.status === "DRAFT").length;

  return (
    <DashboardLayout title="Payroll" user={session.user}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payroll</h1>
            <p className="text-sm text-muted-foreground">{payrollRuns.length} payroll runs</p>
          </div>
          <Link href="/dashboard/hrm/payroll/create">
            <Button><Plus className="h-4 w-4 mr-2" />Run Payroll</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-xl font-bold text-green-600">{fmt(totalPaid)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Draft Runs</p><p className="text-xl font-bold">{draft}</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-4"><p className="text-xs text-muted-foreground">Total Runs</p><p className="text-xl font-bold">{payrollRuns.length}</p></CardContent></Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" />Payroll Runs</CardTitle></CardHeader>
          <CardContent className="p-0">
            {payrollRuns.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">No payroll runs yet</p>
                <Link href="/dashboard/hrm/payroll/create">
                  <Button size="sm" className="mt-3"><Plus className="h-4 w-4 mr-1" />Run First Payroll</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Period</th>
                      <th className="text-right py-2.5 px-4 font-medium text-muted-foreground text-xs">Gross</th>
                      <th className="text-right py-2.5 px-4 font-medium text-muted-foreground text-xs">Net Pay</th>
                      <th className="text-center py-2.5 px-4 font-medium text-muted-foreground text-xs">Employees</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {payrollRuns.map((run) => (
                      <tr key={run.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-medium">{MONTHS[run.month]} {run.year}</td>
                        <td className="py-2.5 px-4 text-right">{fmt(run.totalGross)}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-green-600">{fmt(run.totalNet)}</td>
                        <td className="py-2.5 px-4 text-center">{run._count.payslips}</td>
                        <td className="py-2.5 px-4"><Badge className={`text-xs ${statusColors[run.status] || ""}`}>{run.status}</Badge></td>
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
