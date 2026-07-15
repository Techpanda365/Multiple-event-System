"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

const customers = [
  { name: "John Doe", email: "john@example.com", orders: 12, spent: "$1,245.80", lastPurchase: "Jun 18, 2026", points: 450 },
  { name: "Jane Smith", email: "jane@example.com", orders: 8, spent: "$876.50", lastPurchase: "Jun 17, 2026", points: 320 },
  { name: "Bob Wilson", email: "bob@example.com", orders: 15, spent: "$2,340.00", lastPurchase: "Jun 16, 2026", points: 680 },
  { name: "Alice Brown", email: "alice@example.com", orders: 5, spent: "$445.25", lastPurchase: "Jun 14, 2026", points: 180 },
  { name: "Tom Davis", email: "tom@example.com", orders: 20, spent: "$3,890.75", lastPurchase: "Jun 15, 2026", points: 950 },
  { name: "Sarah Lee", email: "sarah@example.com", orders: 3, spent: "$210.00", lastPurchase: "Jun 10, 2026", points: 90 },
  { name: "Mike Chen", email: "mike@example.com", orders: 10, spent: "$1,560.40", lastPurchase: "Jun 12, 2026", points: 510 },
];

export default function CustomerReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Customer Report</h2>
          <p className="text-muted-foreground">Customer purchase history and loyalty</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Customer Details</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Orders</th>
                  <th className="text-left p-3 font-medium">Total Spent</th>
                  <th className="text-left p-3 font-medium">Last Purchase</th>
                  <th className="text-left p-3 font-medium">Loyalty Points</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.email} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-3"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{c.name}</span></div></td>
                    <td className="p-3 text-muted-foreground">{c.email}</td>
                    <td className="p-3">{c.orders}</td>
                    <td className="p-3">{c.spent}</td>
                    <td className="p-3 text-muted-foreground">{c.lastPurchase}</td>
                    <td className="p-3"><Badge variant="secondary"><Star className="h-3 w-3 mr-1" />{c.points}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
