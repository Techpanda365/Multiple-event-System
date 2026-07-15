// src/app/dashboard/sales/page.tsx
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Receipt, RotateCcw, TrendingUp } from "lucide-react";
import Link from "next/link";

const cards = [
  { 
    title: "Total Revenue", 
    value: "$124,580", 
    icon: DollarSign, 
    description: "Current month", 
    href: "/dashboard/sales/invoices"  // ✅ sahi
  },
  { 
    title: "Invoices", 
    value: "156", 
    icon: Receipt, 
    description: "Total this quarter", 
    href: "/dashboard/sales/invoices"  // ✅ sahi
  },
  { 
    title: "Returns", 
    value: "23", 
    icon: RotateCcw, 
    description: "This quarter", 
    href: "/dashboard/sales/returns"  // ✅ sahi
  },
  { 
    title: "Growth", 
    value: "+12.5%", 
    icon: TrendingUp, 
    description: "vs last month", 
    href: "/dashboard/sales/invoices"  // ✅ sahi
  },
];

export default function SalesOverviewPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Sales</h2>
          <p className="text-muted-foreground">Overview of sales, invoices, and returns</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <Link href="/dashboard/sales/invoices" className="hover:underline">
                  Sale Invoice
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage all sales invoices with payment tracking.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Link href="/dashboard/sales/returns" className="hover:underline">
                  Invoice Returns
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Track returned items, manage refunds, and analyze return reasons.
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}