"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";

type Transfer = {
  id: string;
  fromWarehouseName: string;
  toWarehouseName: string;
  productName: string;
  quantity: number;
  date: string;
  status: string;
  notes: string | null;
};

export function TransfersClient() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    try {
      const res = await fetch("/api/purchase/transfers");
      if (res.ok) {
        const data = await res.json();
        setTransfers(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const filtered = useMemo(() => {
    let f = transfers;
    const q = search.toLowerCase();
    if (q) f = f.filter((t) => t.productName.toLowerCase().includes(q) || t.fromWarehouseName.toLowerCase().includes(q) || t.toWarehouseName.toLowerCase().includes(q));
    return f;
  }, [transfers, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout title="Transfers">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Transfers</h1>
          </div>
          <Link href="/dashboard/purchase/transfers/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Transfer
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search transfers..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="text-sm text-muted-foreground">{itemsPerPage} per page</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">From Warehouse</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">To Warehouse</th>
                        <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Quantity</th>
                        <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                        <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No transfers found</td></tr>
                    ) : (
                      paginated.map((t, index) => (
                        <tr key={t.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <span className="font-medium text-sm">{t.productName}</span>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{t.fromWarehouseName}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{t.toWarehouseName}</span></td>
                          <td className="p-3 md:p-4 text-right"><span className="text-sm font-medium">{t.quantity}</span></td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{new Date(t.date).toISOString().slice(0, 10)}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(t.id)}><Trash2 className="h-4 w-4" /></Button>
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

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Transfer</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this transfer? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await fetch(`/api/purchase/transfers/${deletingId}`, { method: "DELETE" });
                  fetchTransfers();
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
