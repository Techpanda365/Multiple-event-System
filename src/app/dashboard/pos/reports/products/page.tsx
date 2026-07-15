"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Package } from "lucide-react";

const products = [
  { name: "Wireless Mouse", sku: "WM-001", sold: 145, revenue: "$4,335.55", avgPrice: "$29.90", stock: 150 },
  { name: "USB-C Hub", sku: "USB-002", sold: 98, revenue: "$4,899.02", avgPrice: "$49.99", stock: 85 },
  { name: "Desk Lamp", sku: "DL-003", sold: 67, revenue: "$2,679.33", avgPrice: "$39.99", stock: 42 },
  { name: "Notebook Set", sku: "NB-004", sold: 210, revenue: "$2,727.90", avgPrice: "$12.99", stock: 200 },
  { name: "Coffee Mug", sku: "CM-005", sold: 180, revenue: "$2,698.20", avgPrice: "$14.99", stock: 0 },
  { name: "Keyboard", sku: "KB-001", sold: 55, revenue: "$3,299.45", avgPrice: "$59.99", stock: 30 },
];

export default function ProductReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Product Report</h2>
          <p className="text-muted-foreground">Product-wise sales performance</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Product Performance</CardTitle>
            <Badge variant="outline"><ArrowUpDown className="h-3 w-3 mr-1" />Sort by Sold</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Qty Sold</th>
                  <th className="text-left p-3 font-medium">Revenue</th>
                  <th className="text-left p-3 font-medium">Avg Price</th>
                  <th className="text-left p-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.sku} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-3"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{p.name}</span></div></td>
                    <td className="p-3 text-muted-foreground">{p.sku}</td>
                    <td className="p-3 font-medium">{p.sold}</td>
                    <td className="p-3">{p.revenue}</td>
                    <td className="p-3">{p.avgPrice}</td>
                    <td className="p-3"><Badge variant={p.stock === 0 ? "destructive" : p.stock < 50 ? "warning" : "success"}>{p.stock === 0 ? "Out" : p.stock}</Badge></td>
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
