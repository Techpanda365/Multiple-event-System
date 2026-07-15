"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Plus, Trash2, Loader2,
  Package, Warehouse, Calendar, FileText,
} from "lucide-react";

type Product = { id: string; name: string; sku: string | null; stock: number };
type WarehouseItem = { id: string; name: string };

type AdjItem = {
  _key: number;
  productId: string;
  productName: string;
  currentStock: number;
  quantity: string;
  notes: string;
};

const ADJUSTMENT_TYPES = ["Increase", "Decrease", "Recount"];
const STATUSES = ["Draft", "Approved", "Posted"];

export default function CreateAdjustmentPage() {
  const router = useRouter();

  // Master data
  const [products, setProducts]   = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form
  const [adjustmentDate, setAdjustmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [warehouseId, setWarehouseId]   = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [type, setType]                 = useState("Increase");
  const [status, setStatus]             = useState("Draft");
  const [reason, setReason]             = useState("");
  const [items, setItems]               = useState<AdjItem[]>([
    { _key: Date.now(), productId: "", productName: "", currentStock: 0, quantity: "", notes: "" },
  ]);

  // State
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  // ─── Load products & warehouses from real API ─────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/inventory").then((r) => r.ok ? r.json() : []),
      fetch("/api/purchase/warehouses").then((r) => r.ok ? r.json() : []),
    ])
      .then(([p, w]) => {
        setProducts(Array.isArray(p) ? p : []);
        setWarehouses(Array.isArray(w) ? w : []);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  // ─── Item helpers ─────────────────────────────────────────────────────────
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { _key: Date.now(), productId: "", productName: "", currentStock: 0, quantity: "", notes: "" },
    ]);
  };

  const removeItem = (key: number) => {
    if (items.length > 1) setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const updateItem = (key: number, field: keyof AdjItem, value: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        if (field === "productId") {
          const p = products.find((p) => p.id === value);
          return { ...i, productId: value, productName: p?.name || "", currentStock: p?.stock ?? 0 };
        }
        return { ...i, [field]: value };
      })
    );
  };

  // Adjusted stock preview
  const calcAdjusted = (item: AdjItem) => {
    const qty = Number(item.quantity) || 0;
    if (type === "Increase") return item.currentStock + qty;
    if (type === "Decrease") return Math.max(0, item.currentStock - qty);
    if (type === "Recount")  return qty;
    return item.currentStock;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSave = async (saveStatus: string) => {
    setError("");

    if (!adjustmentDate) { setError("Adjustment date is required"); return; }
    if (items.some((i) => !i.productId)) { setError("Please select a product for all items"); return; }
    if (items.some((i) => !i.quantity)) { setError("Please enter quantity for all items"); return; }

    setSaving(true);
    try {
      const payload = {
        adjustmentDate,
        warehouseId: warehouseId || null,
        warehouseName: warehouseName || null,
        type,
        reason: reason.trim() || null,
        status: saveStatus,
        items: items.map((i) => ({
          productId: i.productId,
          quantity:  Number(i.quantity) || 0,
          notes:     i.notes.trim() || null,
        })),
      };

      const res = await fetch("/api/inventory/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create adjustment"); return; }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/inventory/Adjustments");
        router.refresh();
      }, 800);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Create Inventory Adjustment">
      <div className="max-w-5xl mx-auto space-y-5 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon"
              onClick={() => router.push("/dashboard/inventory/Adjustments")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create Inventory Adjustment</h1>
              <p className="text-sm text-muted-foreground">Adjust stock levels for your products</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"
              onClick={() => router.push("/dashboard/inventory/Adjustments")}
              disabled={saving}>
              Cancel
            </Button>
            <Button variant="outline"
              onClick={() => handleSave("Draft")}
              disabled={saving || success}>
              {saving && status === "Draft" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave("Posted")}
              disabled={saving || success}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {saving ? "Saving..." : "Post Adjustment"}
            </Button>
          </div>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            ✅ Adjustment created! Redirecting...
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Adjustment Details ── */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />Adjustment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Adjustment Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={adjustmentDate}
                  onChange={(e) => setAdjustmentDate(e.target.value)}
                />
              </div>

              {/* Warehouse — real DB */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Warehouse className="h-3.5 w-3.5" />Warehouse
                </label>
                {loadingData ? (
                  <div className="h-9 flex items-center px-3 rounded-md border border-input bg-muted/30 text-xs text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  <select
                    value={warehouseId}
                    onChange={(e) => {
                      setWarehouseId(e.target.value);
                      const w = warehouses.find((w) => w.id === e.target.value);
                      setWarehouseName(w?.name || "");
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.length === 0 ? (
                      <option disabled>No warehouses — add one first</option>
                    ) : (
                      warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Adjustment Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Adjustment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ADJUSTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {type === "Increase" && "➕ Add stock to products"}
                  {type === "Decrease" && "➖ Remove stock from products"}
                  {type === "Recount" && "🔄 Set stock to exact quantity"}
                </p>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Reason / Notes</label>
                <textarea
                  placeholder="e.g. Damaged goods, Physical count..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Right: Adjustment Items ── */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Adjustment Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {loadingData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {items.map((item, index) => (
                    <div key={item._key}
                      className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">

                      {/* Item header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          Item {index + 1}
                        </span>
                        {items.length > 1 && (
                          <Button variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-red-50"
                            onClick={() => removeItem(item._key)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Product — real DB */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-sm font-medium">
                            Inventory Item <span className="text-destructive">*</span>
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(item._key, "productId", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}{p.sku ? ` (${p.sku})` : ""} — Stock: {p.stock}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">
                            Quantity <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) => updateItem(item._key, "quantity", e.target.value)}
                          />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Notes</label>
                          <Input
                            placeholder="Item notes..."
                            value={item.notes}
                            onChange={(e) => updateItem(item._key, "notes", e.target.value)}
                          />
                        </div>

                        {/* Current Stock + Adjusted Stock — live preview */}
                        {item.productId && (
                          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground">Current Stock</label>
                              <div className="h-9 flex items-center px-3 rounded-md border border-input bg-muted/30 text-sm font-medium">
                                {item.currentStock}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground">Adjusted Stock (Preview)</label>
                              <div className={`h-9 flex items-center px-3 rounded-md border text-sm font-semibold ${
                                calcAdjusted(item) > item.currentStock
                                  ? "border-green-300 bg-green-50 text-green-700"
                                  : calcAdjusted(item) < item.currentStock
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : "border-input bg-muted/30"
                              }`}>
                                {calcAdjusted(item)}
                                {item.quantity && (
                                  <span className="text-xs font-normal ml-2 opacity-70">
                                    ({calcAdjusted(item) >= item.currentStock ? "+" : ""}{calcAdjusted(item) - item.currentStock})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Item */}
                  <button
                    onClick={addItem}
                    className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />Add Item
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
