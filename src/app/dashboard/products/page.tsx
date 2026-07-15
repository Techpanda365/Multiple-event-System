import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const [total, active, inactive, categories] = await Promise.all([
    prisma.product.count({ where: { workspaceId: wid } }),
    prisma.product.count({ where: { workspaceId: wid, isActive: true } }),
    prisma.product.count({ where: { workspaceId: wid, isActive: false } }),
    prisma.product.findMany({
      where: { workspaceId: wid, category: { not: null } },
      distinct: ["category"],
      select: { category: true },
    }),
  ]);

  const stats = [
    { label: "Total Items",     value: total },
    { label: "Active",          value: active },
    { label: "Categories",      value: categories.length },
    { label: "Inactive Items",  value: inactive },
  ];

  return (
    <DashboardLayout title="Products & Services" user={session.user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Products & Services</h2>
            <p className="text-muted-foreground text-sm">Manage your product catalog and service offerings</p>
          </div>
          <Link href="/dashboard/products/items/create">
            <Button><Plus className="h-4 w-4 mr-2" />New Item</Button>
          </Link>
        </div>

        {/* Real Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Link href="/dashboard/products/items">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-sm">Product / Service Items</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {total} items · {active} active
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dashboard/products/setup">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-sm">System Setup</CardTitle>
                    <p className="text-xs text-muted-foreground">Configure categories, units, and tax</p>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
