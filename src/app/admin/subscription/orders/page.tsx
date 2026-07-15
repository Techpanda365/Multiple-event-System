"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Loader2 } from "lucide-react";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  plan: { name: string; price: number; interval: string } | null;
}

const statusColors: Record<string, string> = {
  SUCCEEDED: "text-green-600 bg-green-50 border-green-200",
  PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
  FAILED: "text-red-600 bg-red-50 border-red-200",
  REFUNDED: "text-blue-600 bg-blue-50 border-blue-200",
};

export default function OrdersPage() {
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/subscriptions").then((r) => r.json()),
    ]).then(([sessionData, ordersData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      setOrders(ordersData.subscriptions || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Orders" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground text-sm">View all subscription orders and transactions</p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by Order ID, Plan or User..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">No orders found</p></td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{order.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3">{order.user?.name || order.user?.email || "—"}</td>
                    <td className="px-4 py-3">{order.plan?.name || "—"} <span className="text-xs text-muted-foreground">({order.plan?.interval})</span></td>
                    <td className="px-4 py-3 font-medium">${order.plan?.price ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[order.status] || ""}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
