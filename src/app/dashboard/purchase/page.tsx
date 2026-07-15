"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Warehouse, ArrowRightLeft, RotateCcw, DollarSign } from "lucide-react";
import Link from "next/link";

const cards = [
  { title: "Purchase Orders", value: "48", icon: ShoppingCart, description: "This quarter", href: "/dashboard/purchase/invoices" },
  { title: "Warehouses", value: "5", icon: Warehouse, description: "Locations active", href: "/dashboard/purchase/warehouses" },
  { title: "Stock Transfers", value: "36", icon: ArrowRightLeft, description: "This quarter", href: "/dashboard/purchase/transfers" },
  { title: "Returns", value: "12", icon: RotateCcw, description: "To vendors", href: "/dashboard/purchase/returns" },
  { title: "Total Spend", value: "$87,400", icon: DollarSign, description: "This quarter", href: "/dashboard/purchase/invoices" },
];

export default function PurchaseOverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Purchase</h2>
          <p className="text-muted-foreground">Manage procurement, warehouses, and stock transfers</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Link href="/dashboard/purchase/invoices" className="hover:underline">Purchase Orders</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              48 purchase orders this quarter. Create and manage POs, track vendor payments and order status.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Link href="/dashboard/purchase/warehouses" className="hover:underline">Warehouses & Inventory</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              5 warehouses with 19,200 total units. Manage inventory, transfers between locations, and returns.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
