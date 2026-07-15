"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft, ChevronRight, Search, Plus, Eye, Pencil,
  Trash2, Loader2, AlertCircle, ShoppingCart, Building2,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type SalesOrder = {
  id: string;
  orderNumber: string;
  name: string | null;
  customerName: string;
  customerEmail: string | null;
  accountName: string | null;
  assignedUserName: string | null;
  orderDate: string;
  dueDate: string | null;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  status: string;
  notes: string | null;
  description: string | null;
  items: { product?: string; name?: string; qty?: number; unitPrice?: number }[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LIST = ["Draft", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors: Record<string, string> = {
  Draft:      "bg-gray-500/10 text-gray-600",
  Confirmed:  "bg-green-500/10 text-green-700",
  Processing: "bg-blue-500/10 text-blue-700",
  Shipped:    "bg-purple-500/10 text-purple-700",
  Delivered:  "bg-teal-500/10 text-teal-700",
  Cancelled:  "bg-red-500/10 text-red-700",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Component ────────────────────────────────────────────────────────────────
export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders]           = useState<SalesOrder[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [toast, setToast]             = useState("");

  // Modals
  const [deleteOrder, setDeleteOrder] = useState<SalesOrder | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales/orders");
      if (res.ok) setOrders(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let f = orders;
    if (statusFilter !== "ALL") f = f.filter((o) => o.status === statusFilter);
    const q = search.toLowerCase();
    if (q) f = f.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      (o.name || "").toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.accountName || "").toLowerCase().includes(q) ||
      (o.assignedUserName || "").toLowerCase().includes(q)
    );
    return f;
  }, [orders, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteOrder) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sales/orders/${deleteOrder.id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
        setDeleteOrder(null);
        showToast("Order deleted successfully");
      }
    } catch { }
    finally { setDeleting(false); }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalAmount = orders.reduce((s, o) => s + (o.total || 0), 0);
  const confirmed   = orders.filter((o) => ["Confirmed","Delivered","Shipped"].includes(o.status)).length;
  const pending     = orders.filter((o) => ["Draft","Processing"].includes(o.status)).length;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Sales Orders">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Sales Orders</h1>
            <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
          </div>
          <Link href="/dashboard/Sales/sales-orders/create">
            <Button><Plus className="h-4 w-4 mr-2" />Create Order</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold">{fmt(totalAmount)}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Confirmed / Delivered</p>
            <p className="text-xl font-bold text-green-600">{confirmed}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{pending}</p>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search order, name, account..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="ALL">All Status</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={fetchOrders}>Refresh</Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No sales orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Order Number</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Account</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Order Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Assigned User</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginated.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-primary">{order.orderNumber}</td>
                        <td className="py-3 px-4 font-medium">{order.name || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{order.customerName}</td>
                        <td className="py-3 px-4">
                          {order.accountName ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{order.accountName}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{fmtDate(order.orderDate)}</td>
                        <td className="py-3 px-4 text-right font-semibold">{fmt(order.total)}</td>
                        <td className="py-3 px-4">
                          {order.assignedUserName ? (
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                                {order.assignedUserName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm">{order.assignedUserName}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* VIEW */}
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View" onClick={() => router.push(`/dashboard/Sales/sales-orders/${order.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* EDIT */}
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              title="Edit" onClick={() => router.push(`/dashboard/Sales/sales-orders/${order.id}/edit`)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {/* DELETE */}
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete" onClick={() => setDeleteOrder(order)}>
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
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ DELETE CONFIRM ══════════ */}
      {deleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Sales Order</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delete <strong>{deleteOrder.orderNumber}</strong>?
                <br />This action cannot be undone.
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
