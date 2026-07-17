"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, ChevronLeft, ChevronRight, PackagePlus, X, Warehouse,Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  price: number;
  cost: number | null;
  stock: number;
  isActive: boolean;
  image: string | null;
};

interface Props {
  initialProducts: Product[];
  user?: { name?: string | null; image?: string | null; email?: string };
}

export function ProductsClient({ initialProducts, user }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // View / Delete state
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Add Stock modal state
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockProductId, setStockProductId] = useState("");
  const [stockWarehouseId, setStockWarehouseId] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [savingStock, setSavingStock] = useState(false);
  const [stockError, setStockError] = useState("");

  // Load warehouses from real DB
  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await fetch("/api/purchase/warehouses");
      if (res.ok) {
        const data = await res.json();
        setWarehouses(Array.isArray(data) ? data : []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.sku?.toLowerCase().includes(q) ?? false)
    );
  }, [products, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openStockModal = () => {
    setStockProductId("");
    setStockWarehouseId("");
    setStockQty("");
    setStockError("");
    setShowStockForm(true);
  };

  const handleSaveStock = async () => {
    const qty = parseInt(stockQty);
    if (!stockProductId || isNaN(qty) || qty <= 0) {
      setStockError("Select a product and enter a valid quantity");
      return;
    }
    setSavingStock(true);
    setStockError("");
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjust", productId: stockProductId, quantity: qty, warehouseId: stockWarehouseId || null }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => p.id === stockProductId ? { ...p, stock: p.stock + qty } : p)
        );
        setShowStockForm(false);
      } else {
        const d = await res.json();
        setStockError(d.error || "Failed to update stock");
      }
    } catch {
      setStockError("Network error");
    } finally {
      setSavingStock(false);
    }
  };

  const handleDelete = async (item: Product) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    const res = await fetch(`/api/products/${item.id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== item.id));
  };

  return (
    <DashboardLayout user={user} title="Products">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Product / Service Items</h2>
            <p className="text-muted-foreground text-sm">{products.length} items in catalog</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/products/items/create">
              <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            </Link>
            <Button variant="outline" onClick={openStockModal}>
              <PackagePlus className="h-4 w-4 mr-2" />Add Stock
            </Button>
          </div>
        </div>

        {/* Add Stock Modal */}
        {showStockForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="font-semibold">Add Stock</h2>
                <button onClick={() => setShowStockForm(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {stockError && (
                  <p className="text-sm text-destructive">{stockError}</p>
                )}

                {/* Product */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Product <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={stockProductId}
                    onChange={(e) => setStockProductId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Current: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse — real DB */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Warehouse className="h-3.5 w-3.5" /> Warehouse
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </label>
                  {warehouses.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No warehouses found.{" "}
                      <Link href="/dashboard/purchase/warehouses/create" className="text-primary underline">
                        Add a warehouse
                      </Link>
                    </p>
                  ) : (
                    <select
                      value={stockWarehouseId}
                      onChange={(e) => setStockWarehouseId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Quantity to Add <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 50"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-4 border-t">
                <Button variant="outline" onClick={() => setShowStockForm(false)}>Cancel</Button>
                <Button onClick={handleSaveStock} disabled={savingStock}>
                  {savingStock ? "Saving..." : "Add Stock"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Items Grid — Cards */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} items</p>
          {paginated.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
                <Package className="h-10 w-10 mb-2 text-muted-foreground/50" />
                <p>No items found.</p>
                <Link href="/dashboard/products/items/create" className="text-primary underline text-sm mt-1">
                  Add one
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((item) => (
                <Card key={item.id} className="overflow-hidden rounded-xl hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      {item.sku && <p className="text-xs text-muted-foreground font-mono truncate">SKU: {item.sku}</p>}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-green-600">Sale: {formatCurrency(item.price)}</span>
                      <span className="text-muted-foreground">Purchase: {formatCurrency(item.cost ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => setViewingProduct(item)}>View</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => router.push(`/dashboard/products/items/${item.id}/edit`)}>Edit</Button>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive"
                        onClick={() => handleDelete(item)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* View Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingProduct(null)}>
          <div className="bg-card rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold">{viewingProduct.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setViewingProduct(null)}>✕</Button>
            </div>
            <div className="p-5 space-y-3">
              {viewingProduct.image && (
                <div className="rounded-lg overflow-hidden">
                  <img src={viewingProduct.image} alt={viewingProduct.name} className="w-full h-48 object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-xs text-muted-foreground">SKU</span><p className="font-medium font-mono">{viewingProduct.sku || "—"}</p></div>
                <div><span className="text-xs text-muted-foreground">Category</span><p>{viewingProduct.category || "—"}</p></div>
                <div><span className="text-xs text-muted-foreground">Sale Price</span><p className="font-medium text-green-600">{formatCurrency(viewingProduct.price)}</p></div>
                <div><span className="text-xs text-muted-foreground">Purchase Price</span><p className="font-medium">{formatCurrency(viewingProduct.cost ?? 0)}</p></div>
                <div><span className="text-xs text-muted-foreground">Stock</span><p className="font-semibold">{viewingProduct.stock}</p></div>
                <div><span className="text-xs text-muted-foreground">Status</span><Badge variant={viewingProduct.isActive ? "success" : "secondary"}>{viewingProduct.isActive ? "Active" : "Inactive"}</Badge></div>
              </div>
              {viewingProduct.description && (
                <div><span className="text-xs text-muted-foreground">Description</span><p className="text-sm mt-1">{viewingProduct.description}</p></div>
              )}
            </div>
            <div className="flex justify-end px-5 py-4 border-t">
              <Button variant="outline" onClick={() => setViewingProduct(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
