import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700",
  ACTIVE:  "bg-green-500/10 text-green-700",
  EXPIRED: "bg-gray-500/10 text-gray-600",
  REVOKED: "bg-red-500/10 text-red-700",
};

export default async function WorkPermitsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const permits = await prisma.workPermit.findMany({
    where: { workspaceId: wid },
    include: { contractor: { select: { name: true, company: true } } },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const statMap = permits.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout title="Work Permits" user={session.user}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Work Permits</h1>
            <p className="text-sm text-muted-foreground">{permits.length} total permits</p>
          </div>
          <Link href="/dashboard/work-permit/permits/create">
            <Button><Plus className="h-4 w-4 mr-2" />New Permit</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["PENDING","ACTIVE","EXPIRED","REVOKED"].map((s) => (
            <Card key={s}><CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{s}</p>
              <p className="text-2xl font-bold mt-0.5">{statMap[s] ?? 0}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><ClipboardList className="h-4 w-4" />All Permits</CardTitle></CardHeader>
          <CardContent className="p-0">
            {permits.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No work permits yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Permit #</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Type</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Contractor</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Valid Until</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {permits.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-mono text-xs">{p.permitNumber}</td>
                        <td className="py-2.5 px-4">{p.type}</td>
                        <td className="py-2.5 px-4">{p.contractor.name}{p.contractor.company ? ` (${p.contractor.company})` : ""}</td>
                        <td className="py-2.5 px-4">{new Date(p.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="py-2.5 px-4"><Badge className={`text-xs ${statusColors[p.status] || ""}`}>{p.status}</Badge></td>
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
