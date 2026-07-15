"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, Eye,
  ChevronLeft, ChevronRight, Loader2,
  X, Package,
} from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  price: number;
  cost: number | null;
  stock: number;
  isActive: boolean;
  reorderLevel: number | null;
  maxLevel: number | null;
  valuationMethod: string | null;
  trackInventory: boolean;
};

  const valuationColor: Record<string, string> = {
  "FIFO":             "bg-green-500/10 text-green-700",
  "LIFO":             "bg-blue-500/10 text-blue-700",
  "Weighted Average": "bg-purple-500/10 text-purple-700",
};

export default function InventoryItemsPage() {
  const [items, setItems]         = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast] = useState("");
  // View modal
  const [viewItem, setViewItem] = useState<Product | null>(null);

  // ─── Fetch from real API ──────────────────────────────────────────────────
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) setItems(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  // ─── Client-side filter ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      (i.sku?.toLowerCase().includes(q) ?? false) ||
      (i.category?.toLowerCase().includes(q) ?? false)
    );
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ─── No edit/delete here — View only ────────────────────────────────────

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Inventory Items">

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Inventory Items</h1>
            <p className="text-sm text-muted-foreground">{items.length} total items</p>
          </div>
          <Link href="/dashboard/products/items/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add New Item</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products, SKU..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchItems}>Refresh</Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />Items ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No inventory items found</p>
                <Link href="/dashboard/products/items/create">
                  <Button size="sm" className="mt-4"><Plus className="h-4 w-4 mr-1" />Add Item</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase">SKU</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Reorder Level</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Maximum Level</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Valuation Method</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Tracked</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginated.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">

                        {/* Product */}
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.category && (
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            )}
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                          {item.sku || "—"}
                        </td>

                        {/* Reorder Level */}
                        <td className="py-3 px-4 text-right">
                          {item.reorderLevel != null ? (
                            <span className={`font-medium ${item.stock <= item.reorderLevel ? "text-red-600" : ""}`}>
                              {item.reorderLevel.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Maximum Level */}
                        <td className="py-3 px-4 text-right">
                          {item.maxLevel != null ? (
                            <span className="font-medium">{item.maxLevel.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Valuation Method */}
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-xs ${valuationColor[item.valuationMethod || ""] || "bg-gray-100 text-gray-600"}`}>
                            {item.valuationMethod || "—"}
                          </Badge>
                        </td>

                        {/* Tracked */}
                        <td className="py-3 px-4 text-center">
                          <Badge className={item.trackInventory
                            ? "bg-green-500/10 text-green-700"
                            : "bg-gray-500/10 text-gray-600"
                          }>
                            {item.trackInventory ? "Yes" : "No"}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <Button variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View" onClick={() => setViewItem(item)}>
                              <Eye className="h-4 w-4" />
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
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-background">
              <div>
                <h3 className="font-semibold">Item Details</h3>
                <p className="text-xs text-muted-foreground font-mono">{viewItem.sku || "No SKU"}</p>
              </div>
              <button onClick={() => setViewItem(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">

              {/* Basic */}
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Product Name</p><p className="font-semibold">{viewItem.name}</p></div>
                <div><p className="text-xs text-muted-foreground">SKU</p><p className="font-mono">{viewItem.sku || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Category</p><p>{viewItem.category || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${viewItem.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}`}>
                    {viewItem.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pricing & Stock</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-xs text-muted-foreground">Sale Price</p><p className="font-semibold">${viewItem.price.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Cost Price</p><p>{viewItem.cost != null ? `$${viewItem.cost.toFixed(2)}` : "—"}</p></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Stock</p>
                    <p className={`font-semibold ${viewItem.stock <= 0 ? "text-red-600" : viewItem.stock <= (viewItem.reorderLevel || 10) ? "text-yellow-600" : "text-green-600"}`}>
                      {viewItem.stock}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inventory Settings */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Inventory Settings</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Reorder Level</p>
                    <p className="font-medium">{viewItem.reorderLevel != null ? viewItem.reorderLevel.toFixed(2) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maximum Level</p>
                    <p className="font-medium">{viewItem.maxLevel != null ? viewItem.maxLevel.toFixed(2) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valuation Method</p>
                    <p className="font-medium">{viewItem.valuationMethod || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Track Inventory</p>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${viewItem.trackInventory ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}`}>
                      {viewItem.trackInventory ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => setViewItem(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
