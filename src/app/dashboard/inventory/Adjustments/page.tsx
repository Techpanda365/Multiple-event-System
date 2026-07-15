"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Eye, Trash2,
  ChevronLeft, ChevronRight, Loader2,
  X, AlertCircle, CheckCircle2, Package,
} from "lucide-react";

type Adjustment = {
  id: string;
  number: string;
  adjustmentDate: string;
  warehouseName: string | null;
  type: string;
  status: string;
  reason: string | null;
  items: any[];
  createdAt: string;
};

const statusColors: Record<string, string> = {
  Draft:    "bg-yellow-500/10 text-yellow-700",
  Approved: "bg-blue-500/10 text-blue-700",
  Posted:   "bg-green-500/10 text-green-700",
};

const typeColors: Record<string, string> = {
  Increase: "bg-green-500/10 text-green-700",
  Decrease: "bg-red-500/10 text-red-700",
  Recount:  "bg-blue-500/10 text-blue-700",
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function InventoryAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // View modal
  const [viewAdj, setViewAdj] = useState<Adjustment | null>(null);

  // Delete
  const [deleteAdj, setDeleteAdj] = useState<Adjustment | null>(null);
  const [deleting, setDeleting]   = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/adjustments");
      if (res.ok) setAdjustments(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdjustments(); }, []);

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return adjustments;
    return adjustments.filter((a) =>
      a.number.toLowerCase().includes(q) ||
      (a.warehouseName || "").toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  }, [adjustments, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteAdj) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory/adjustments/${deleteAdj.id}`, { method: "DELETE" });
      if (res.ok) {
        setAdjustments((prev) => prev.filter((a) => a.id !== deleteAdj.id));
        setDeleteAdj(null);
        showToast("Adjustment deleted");
      }
    } catch { }
    finally { setDeleting(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Inventory Adjustments">

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
            <h1 className="text-2xl font-bold">Manage Inventory Adjustments</h1>
            <p className="text-sm text-muted-foreground">{adjustments.length} total adjustments</p>
          </div>
          <Link href="/dashboard/inventory/Adjustments/create">
            <Button><Plus className="h-4 w-4 mr-2" />New Adjustment</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search adjustments..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchAdjustments}>Refresh</Button>
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
                <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No adjustments found</p>
                <Link href="/dashboard/inventory/Adjustments/create">
                  <Button size="sm" className="mt-4"><Plus className="h-4 w-4 mr-1" />New Adjustment</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Adjustment Number</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Warehouse</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Type</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Items</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginated.map((adj) => (
                      <tr key={adj.id} className="hover:bg-muted/30 transition-colors">

                        {/* Number */}
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-primary">
                          {adj.number}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-muted-foreground">
                          {fmtDate(adj.adjustmentDate)}
                        </td>

                        {/* Warehouse */}
                        <td className="py-3 px-4">
                          {adj.warehouseName || (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${typeColors[adj.type] || "bg-gray-100 text-gray-600"}`}>
                            {adj.type}
                          </Badge>
                        </td>

                        {/* Items count */}
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {Array.isArray(adj.items) ? adj.items.length : 0}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${statusColors[adj.status] || "bg-gray-100 text-gray-600"}`}>
                            {adj.status}
                          </Badge>
                        </td>

                        {/* Actions — View + Delete only */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View" onClick={() => setViewAdj(adj)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete" onClick={() => setDeleteAdj(adj)}>
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
      {viewAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-background">
              <div>
                <h3 className="font-semibold">Adjustment Details</h3>
                <p className="text-xs font-mono text-muted-foreground">{viewAdj.number}</p>
              </div>
              <button onClick={() => setViewAdj(null)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">

              {/* Header info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{fmtDate(viewAdj.adjustmentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warehouse</p>
                  <p className="font-medium">{viewAdj.warehouseName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge className={`text-xs ${typeColors[viewAdj.type] || ""}`}>{viewAdj.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`text-xs ${statusColors[viewAdj.status] || ""}`}>{viewAdj.status}</Badge>
                </div>
              </div>

              {viewAdj.reason && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p>{viewAdj.reason}</p>
                </div>
              )}

              {/* Items */}
              {Array.isArray(viewAdj.items) && viewAdj.items.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Items ({viewAdj.items.length})
                  </p>
                  <div className="space-y-2">
                    {viewAdj.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                        <div>
                          <p className="font-medium text-sm">{item.productName || `Product ${i + 1}`}</p>
                          {item.productSku && <p className="text-xs text-muted-foreground font-mono">{item.productSku}</p>}
                          {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-muted-foreground">
                            {item.currentStock} → <span className="font-semibold">{item.adjustedStock}</span>
                          </p>
                          <p className={`text-xs font-medium ${
                            item.adjustedStock > item.currentStock
                              ? "text-green-600"
                              : item.adjustedStock < item.currentStock
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}>
                            Qty: {item.quantity > 0 ? "+" : ""}{item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-3 text-xs text-muted-foreground">
                Created: {fmtDate(viewAdj.createdAt)}
              </div>
            </div>
            <div className="px-5 py-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => setViewAdj(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ DELETE CONFIRM ══════════ */}
      {deleteAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Adjustment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delete <strong>{deleteAdj.number}</strong>?
                {deleteAdj.status === "Posted" && (
                  <span className="block mt-1 text-yellow-600 text-xs">
                    ⚠️ This adjustment was Posted — stock will NOT be reversed automatically.
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteAdj(null)} disabled={deleting}>Cancel</Button>
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
