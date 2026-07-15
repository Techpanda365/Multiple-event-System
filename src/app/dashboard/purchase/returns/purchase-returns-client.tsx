"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";

type PurchaseReturn = {
  id: string;
  returnNumber: string;
  vendorName: string;
  warehouseName: string | null;
  returnDate: string;
  totalAmount: number;
  status: string;
  items: { product: string; productId: string; quantity: number; unitPrice: number; discountPct?: number; tax?: string; reason?: string }[];
};

const STATUSES = ["Draft", "Pending", "Approved", "Rejected", "Completed"];
const STATUS_COLORS: Record<string, string> = {
  Completed: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Approved: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Pending: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Rejected: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  Draft: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export function PurchaseReturnsClient() {
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingReturn, setViewingReturn] = useState<PurchaseReturn | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      const res = await fetch("/api/purchase/returns");
      if (res.ok) {
        const data = await res.json();
        setReturns(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/purchase/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      }
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    let f = returns;
    const q = search.toLowerCase();
    if (q) f = f.filter((ret) => ret.returnNumber.toLowerCase().includes(q) || ret.vendorName.toLowerCase().includes(q));
    return f;
  }, [returns, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);

  return (
    <DashboardLayout title="Purchase Returns">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Purchase Returns</h1>
          </div>
          <Link href="/dashboard/purchase/returns/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Return
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by return number..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{itemsPerPage} per page</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Return Number</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Vendor</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Warehouse</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Return Date</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total Amount</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Items</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No returns found</td></tr>
                    ) : (
                      paginated.map((ret, index) => (
                        <tr key={ret.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4"><span className="font-medium text-sm">{ret.returnNumber}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{ret.vendorName}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{ret.warehouseName || "—"}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{new Date(ret.returnDate).toISOString().slice(0, 10)}</span></td>
                          <td className="p-3 md:p-4 text-right"><span className="text-sm font-medium">{formatCurrency(ret.totalAmount)}</span></td>
                          <td className="p-3 md:p-4">
                            <div className="flex flex-col gap-0.5">
                              {Array.isArray(ret.items) && ret.items.length > 0 ? (
                                ret.items.map((item, idx) => (
                                  <span key={idx} className="text-sm whitespace-nowrap">
                                    {item.product} <span className="text-muted-foreground">×{item.quantity}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={STATUS_COLORS[ret.status] || "bg-gray-500/10 text-gray-700"}>{ret.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewingReturn(ret)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <select value={ret.status} onChange={(e) => handleStatusChange(ret.id, e.target.value)}
                                disabled={updatingId === ret.id}
                                className="h-7 rounded border border-input bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                                {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                              </select>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(ret.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Modal */}
        {viewingReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingReturn(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Purchase Return Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setViewingReturn(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground">Return Number</span><p className="font-medium">{viewingReturn.returnNumber}</p></div>
                  <div><span className="text-xs text-muted-foreground">Vendor</span><p className="font-medium">{viewingReturn.vendorName}</p></div>
                  <div><span className="text-xs text-muted-foreground">Warehouse</span><p>{viewingReturn.warehouseName || "—"}</p></div>
                  <div><span className="text-xs text-muted-foreground">Return Date</span><p>{new Date(viewingReturn.returnDate).toISOString().slice(0, 10)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Total Amount</span><p className="font-medium">{formatCurrency(viewingReturn.totalAmount)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p>
                    <Badge className={STATUS_COLORS[viewingReturn.status] || "bg-gray-500/10 text-gray-700"}>{viewingReturn.status}</Badge>
                  </p></div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Items</span>
                  <div className="mt-1 space-y-1">
                    {Array.isArray(viewingReturn.items) && viewingReturn.items.length > 0 ? (
                      viewingReturn.items.map((item, idx) => (
                        <div key={idx} className="text-sm flex justify-between bg-muted/30 px-3 py-1.5 rounded">
                          <span>{item.product}</span>
                          <span className="text-muted-foreground">×{item.quantity}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No items</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t">
                <Button variant="outline" onClick={() => setViewingReturn(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Return</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this return?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await fetch(`/api/purchase/returns/${deletingId}`, { method: "DELETE" });
                  fetchReturns();
                  setDeletingId(null);
                }}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
