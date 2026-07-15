import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  active:      "bg-green-500/10 text-green-700",
  maintenance: "bg-yellow-500/10 text-yellow-700",
  retired:     "bg-gray-500/10 text-gray-600",
  disposed:    "bg-red-500/10 text-red-700",
};

function fmt(n?: number | null) {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default async function AssetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const [assets, statusGroups] = await Promise.all([
    prisma.asset.findMany({
      where: { workspaceId: wid },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.asset.groupBy({
      by: ["status"],
      where: { workspaceId: wid },
      _count: true,
    }),
  ]);

  const totalValue = assets.reduce((s, a) => s + (a.currentValue ?? a.purchasePrice ?? 0), 0);
  const statMap = Object.fromEntries(statusGroups.map((s) => [s.status, s._count]));

  return (
    <DashboardLayout title="Assets" user={session.user}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assets</h1>
            <p className="text-sm text-muted-foreground">{assets.length} total · {fmt(totalValue)} value</p>
          </div>
          <Link href="/dashboard/assets/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add Asset</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["active","maintenance","retired","disposed"].map((s) => (
            <Card key={s}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground capitalize">{s}</p>
                <p className="text-2xl font-bold mt-0.5">{statMap[s] ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Package className="h-4 w-4" />All Assets</CardTitle></CardHeader>
          <CardContent className="p-0">
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No assets yet</p>
                <Link href="/dashboard/assets/create">
                  <Button size="sm" className="mt-3"><Plus className="h-4 w-4 mr-1" />Add First Asset</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Name</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Category</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Location</th>
                      <th className="text-right py-2.5 px-4 font-medium text-muted-foreground text-xs">Value</th>
                      <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {assets.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-4 font-medium">{a.name}</td>
                        <td className="py-2.5 px-4 capitalize">{a.category}</td>
                        <td className="py-2.5 px-4">{a.location || "—"}</td>
                        <td className="py-2.5 px-4 text-right">{fmt(a.currentValue ?? a.purchasePrice)}</td>
                        <td className="py-2.5 px-4"><Badge className={`text-xs ${statusColors[a.status] || "bg-gray-100 text-gray-600"}`}>{a.status}</Badge></td>
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
