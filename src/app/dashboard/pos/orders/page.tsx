"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Eye, Trash2,
  ChevronLeft, ChevronRight, Loader2,
  X, AlertCircle, CheckCircle2, ShoppingCart,
} from "lucide-react";

type PosOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerId: string | null;
  warehouseId: string | null;
  warehouseName: string | null;
  counterName: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  orderItems: {
    id: string; quantity: number; price: number; total: number;
    product: { id: string; name: string } | null;
  }[];
};

const statusColors: Record<string, string> = {
  SUCCEEDED: "bg-green-500/10 text-green-700",
  PENDING:   "bg-yellow-500/10 text-yellow-700",
  FAILED:    "bg-red-500/10 text-red-700",
  REFUNDED:  "bg-blue-500/10 text-blue-700",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function POSOrdersPage() {
  const router = useRouter();
  const [orders, setOrders]         = useState<PosOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast]           = useState("");
  const showToast = (msg: string)   => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const [viewOrder, setViewOrder]   = useState<PosOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<PosOrder | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/pos/orders").then((r) => r.ok ? r.json() : []).then((data) => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch("/api/pos/orders").then((r) => r.ok ? r.json() : []).then((data) => { setOrders(data); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    let f = orders;
    if (statusFilter !== "ALL") f = f.filter((o) => o.status === statusFilter);
    const q = search.toLowerCase();
    if (q) f = f.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.counterName || "").toLowerCase().includes(q)
    );
    return f;
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const todayTotal = orders
    .filter((o) =>
      o.status === "SUCCEEDED" &&
      new Date(o.createdAt).toDateString() === new Date().toDateString()
    )
    .reduce((s, o) => s + o.total, 0);

  const handleDelete = async () => {
    if (!deleteOrder) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pos/orders/${deleteOrder.id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
        setDeleteOrder(null);
        showToast("Order deleted");
      }
    } catch { }
    finally { setDeleting(false); }
  };

  return (
    <DashboardLayout title="POS Orders">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">POS Orders</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} total · Today: {fmt(todayTotal)}
            </p>
          </div>
          {/* <Button onClick={() => router.push("/dashboard/pos/add")}>
            <Plus className="h-4 w-4 mr-2" />New Order
          </Button> */}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sale #, customer, counter..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchOrders}>Refresh</Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No orders found</p>
                <Button size="sm" className="mt-4" onClick={() => router.push("/dashboard/pos/add")}>
                  <Plus className="h-4 w-4 mr-1" />Create First Order
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Sale Number</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Warehouse</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginated.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">

                        {/* Sale Number */}
                        <td className="py-3 px-4">
                          <p className="font-mono text-xs font-semibold text-primary">{order.orderNumber}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(order.createdAt)}</p>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <p className="font-medium">{order.customerName || "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? "s" : ""}
                          </p>
                        </td>

                        {/* Warehouse */}
                        <td className="py-3 px-4">
                          {order.warehouseName ? (
                            <span className="text-sm">{order.warehouseName}</span>
                          ) : order.counterName ? (
                            <span className="text-xs text-muted-foreground">{order.counterName} (counter)</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4 text-right font-semibold">
                          {fmt(order.total)}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View"
                              onClick={() => setViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                              onClick={() => setDeleteOrder(order)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ VIEW MODAL ══════════ */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-background">
              <div>
                <h3 className="font-semibold">Sale Receipt</h3>
                <p className="text-xs font-mono text-muted-foreground">{viewOrder.orderNumber}</p>
              </div>
              <button onClick={() => setViewOrder(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewOrder.customerName || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Warehouse</p><p className="font-medium">{viewOrder.warehouseName || viewOrder.counterName || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p>{fmtDate(viewOrder.createdAt)}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`text-xs ${statusColors[viewOrder.status] || ""}`}>{viewOrder.status}</Badge>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-1">
                  {viewOrder.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product?.name || "Product"} × {item.quantity}</span>
                      <span className="font-medium">{fmt(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(viewOrder.subtotal)}</span></div>
                {viewOrder.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{fmt(viewOrder.tax)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-1 mt-1">
                  <span>Total</span><span className="text-primary">{fmt(viewOrder.total)}</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => setViewOrder(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ DELETE CONFIRM ══════════ */}
      {deleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Order</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delete <strong>{deleteOrder.orderNumber}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteOrder(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
