"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Package, Plus, X, Loader2 } from "lucide-react";

type StockItem = {
  id: string;
  product: string;
  sku: string;
  quantity: number;
};

interface Props {
  stock: StockItem[];
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

export function StockClient({ stock: initialStock }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  const [products, setProducts] = useState<{ id: string; name: string; sku: string | null; stock: number }[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
  });

  // Fetch warehouses + products from real APIs
  const fetchData = useCallback(async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        fetch("/api/purchase/warehouses"),
        fetch("/api/products"),
      ]);
      if (whRes.ok) {
        const data = await whRes.json();
        setWarehouses(Array.isArray(data) ? data : []);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setWarehouseLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stock.filter((s) => 
      !q || s.product.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q)
    );
  }, [stock, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          warehouseId: formData.warehouseId || null,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        const product = products.find((p) => p.id === formData.productId);
        const newItem: StockItem = {
          id: data.id || Date.now().toString(),
          product: product?.name || "Unknown",
          sku: product?.sku || "-",
          quantity: (product?.stock || 0) + parseInt(formData.quantity),
        };
        setStock((prev) => prev.map((s) => s.id === formData.productId ? newItem : s));
        if (!stock.find((s) => s.id === formData.productId)) {
          setStock((prev) => [newItem, ...prev]);
        }
        setShowForm(false);
        setFormData({ productId: "", warehouseId: "", quantity: "" });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stock item?")) return;
    try {
      const res = await fetch(`/api/admin/products/stock/${id}`, { method: "DELETE" });
      if (res.ok) setStock((prev) => prev.filter((item) => item.id !== id));
    } catch {}
  };

  return (
    <DashboardLayout title="Product Stock">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Product Stock</h1>
            <p className="text-sm text-muted-foreground">Manage product stock levels</p>
          </div>
          <Button className="gap-2" onClick={() => setShowForm(true)} type="button">
            <Plus className="h-4 w-4" /> Add Stock
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name..." className="pl-9" value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Name</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">SKU</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Quantity</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        No stock data found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, index) => (
                      <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-muted/5 ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.product}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{item.sku}</td>
                        <td className="p-3 text-right font-semibold">{formatNumber(item.quantity)}</td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Stock Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowForm(false)}>
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
              <div>
                <h3 className="text-lg font-semibold">Add Stock</h3>
                <p className="text-xs text-muted-foreground">Add stock to a product</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                onClick={() => setShowForm(false)} type="button">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Product <span className="text-destructive">*</span>
                </label>
                <select className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required>
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
                {formData.productId && (() => {
                  const p = products.find((pr) => pr.id === formData.productId);
                  return p ? (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      SKU: <span className="font-mono font-medium">{p.sku || "-"}</span>
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Warehouse</label>
                {warehouseLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading warehouses...
                  </div>
                ) : warehouses.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No warehouses found</p>
                ) : (
                  <select className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Quantity <span className="text-destructive">*</span>
                </label>
                <Input type="number" min="0" placeholder="Enter quantity" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required className="w-full" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="gap-1.5" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
