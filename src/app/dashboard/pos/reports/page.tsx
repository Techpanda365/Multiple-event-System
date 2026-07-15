"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

type Report = {
  totalRevenue: number; totalOrders: number; totalItems: number; avgOrderValue: number;
  salesChart: { date: string; total: number }[];
  topProducts: { productId: string; name: string; category: string | null; qty: number; revenue: number; profit: number }[];
  topCustomers: { name: string; orders: number; spent: number }[];
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function POSReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  const [from, setFrom] = useState(monthStart);
  const [to, setTo]     = useState(today);
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/reports?from=${from}&to=${to}`);
      if (res.ok) setData(await res.json());
    } catch { }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { fetchReport(); }, []);

  return (
    <DashboardLayout title="POS Reports">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">POS Reports</h1>
          <p className="text-sm text-muted-foreground">Sales analytics for your POS system</p>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="py-4 px-5">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
              </div>
              <Button onClick={fetchReport} className="bg-teal-600 hover:bg-teal-700 text-white">Apply</Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : !data ? (
          <p className="text-center text-muted-foreground py-10">No data available</p>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: fmt(data.totalRevenue), icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
                { label: "Total Orders", value: data.totalOrders, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Items Sold", value: data.totalItems, icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
                { label: "Avg Order Value", value: fmt(data.avgOrderValue), icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
              ].map((s) => (
                <Card key={s.label} className={s.bg}>
                  <CardContent className="pt-5 pb-4 px-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                      </div>
                      <s.icon className={`h-5 w-5 ${s.color} mt-1`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sales Chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Sales by Day</CardTitle></CardHeader>
              <CardContent>
                {data.salesChart.length === 0 ? (
                  <p className="text-center py-10 text-sm text-muted-foreground">No sales in selected period</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.salesChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]} />
                      <Bar dataKey="total" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              {/* Top Products */}
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Top Products</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {data.topProducts.length === 0 ? (
                    <p className="text-center py-8 text-sm text-muted-foreground">No data</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Product</th>
                          <th className="text-center py-2.5 px-2 text-xs font-medium text-muted-foreground">Qty</th>
                          <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {data.topProducts.map((p) => (
                          <tr key={p.productId} className="hover:bg-muted/20">
                            <td className="py-2.5 px-4">
                              <p className="font-medium">{p.name}</p>
                              {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                            </td>
                            <td className="py-2.5 px-2 text-center">{p.qty}</td>
                            <td className="py-2.5 px-4 text-right font-semibold">{fmt(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Top Customers */}
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium">Top Customers</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {data.topCustomers.length === 0 ? (
                    <p className="text-center py-8 text-sm text-muted-foreground">No data</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                          <th className="text-center py-2.5 px-2 text-xs font-medium text-muted-foreground">Orders</th>
                          <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {data.topCustomers.map((c, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium">{c.name}</td>
                            <td className="py-2.5 px-2 text-center">{c.orders}</td>
                            <td className="py-2.5 px-4 text-right font-semibold">{fmt(c.spent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
