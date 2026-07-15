import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ShoppingCart, ClipboardList, RotateCcw,
  Barcode, Columns3, Percent, BarChart3, DollarSign,
} from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default async function POSOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, totalOrders, lowStockCount, todaySalesAgg] = await Promise.all([
    prisma.posOrder.count({ where: { workspaceId: wid, createdAt: { gte: today } } }),
    prisma.posOrder.count({ where: { workspaceId: wid } }),
    prisma.product.count({ where: { workspaceId: wid, isActive: true, stock: { lte: 10 } } }),
    prisma.posOrder.aggregate({
      where: { workspaceId: wid, createdAt: { gte: today } },
      _sum: { total: true },
    }),
  ]);

  const stats = [
    { title: "Today's Sales", value: fmt(todaySalesAgg._sum.total || 0), icon: DollarSign, color: "text-green-500" },
    { title: "Today's Orders", value: todayOrders, icon: ShoppingCart, color: "text-blue-500" },
    { title: "Total Orders", value: totalOrders, icon: ClipboardList, color: "text-purple-500" },
    { title: "Low Stock Items", value: lowStockCount, icon: BarChart3, color: "text-red-500" },
  ];

  const links = [
    { title: "New Order", href: "/dashboard/pos/add", icon: ShoppingCart, desc: "Create a POS sale" },
    { title: "Orders", href: "/dashboard/pos/orders", icon: ClipboardList, desc: "View all orders" },
    { title: "Returns", href: "/dashboard/pos/returns", icon: RotateCcw, desc: "Process returns" },
    { title: "Barcode", href: "/dashboard/pos/barcode", icon: Barcode, desc: "Print barcodes" },
    { title: "Counters", href: "/dashboard/pos/counters", icon: Columns3, desc: "Billing counters" },
    { title: "Discounts", href: "/dashboard/pos/discounts", icon: Percent, desc: "Manage discounts" },
    { title: "Reports", href: "/dashboard/pos/reports", icon: BarChart3, desc: "Sales reports" },
  ];

  return (
    <DashboardLayout title="POS" user={session.user}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">POS Overview</h2>
          <p className="text-muted-foreground text-sm">Point of Sale management dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {links.map((l) => (
            <Link key={l.title} href={l.href}>
              <Card className="hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <l.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{l.title}</span>
                  <span className="text-[10px] text-muted-foreground">{l.desc}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
