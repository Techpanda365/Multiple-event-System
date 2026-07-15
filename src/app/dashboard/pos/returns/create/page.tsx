"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2, Save, X, Package } from "lucide-react";

type PosOrder = {
  id: string; orderNumber: string; customerName: string | null;
  total: number; createdAt: string;
  warehouse?: { id: string; name: string } | null;
  warehouseName?: string | null;
  orderItems: { id: string; quantity: number; price: number; total: number; product: { id: string; name: string } | null }[];
};

type Warehouse = { id: string; name: string };

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const returnReasons = ["Defective", "Damaged", "Wrong Item", "Not as Described", "Other"];

export default function CreatePOSReturnPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedItemIds(new Set(order.orderItems.map((i) => i.id)));
      if (!warehouseId && (order.warehouseName || order.warehouse?.name)) {
        const wh = warehouses.find((w) => w.name === (order.warehouseName || order.warehouse?.name));
        if (wh) setWarehouseId(wh.id);
      }
    } else {
      setSelectedItemIds(new Set());
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/pos/orders?status=SUCCEEDED").then((r) => r.json()).catch(() => []),
      fetch("/api/purchase/warehouses").then((r) => r.ok ? r.json() : []).catch(() => []),
    ]).then(([o, w]) => {
      if (cancelled) return;
      setOrders(Array.isArray(o) ? o : []);
      setWarehouses(Array.isArray(w) ? w : []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedItems = selectedOrder?.orderItems.filter((i) => selectedItemIds.has(i.id)) || [];
  const totalReturnAmount = selectedItems.reduce((sum, i) => sum + i.total, 0);

  const handleSubmit = async () => {
    setError("");
    if (!selectedOrderId) { setError("Please select an order"); return; }
    if (selectedItems.length === 0) { setError("Select at least one item to return"); return; }

    setSaving(true);
    try {
      const items = selectedItems.map((i) => ({
        productName: i.product?.name || "Product",
        quantity: i.quantity,
        price: i.price,
        total: i.total,
        productId: i.product?.id,
      }));

      const order = selectedOrder!;
      const warehouse = warehouses.find((w) => w.id === warehouseId);

      const res = await fetch("/api/pos/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customerName || "Walk-in",
          warehouseId: warehouseId || null,
          warehouseName: warehouse?.name || order.warehouseName || order.warehouse?.name || null,
          returnDate: new Date(returnDate).toISOString(),
          reason: reason || null,
          notes: notes || null,
          items,
          totalAmount: totalReturnAmount,
          status: "Completed",
        }),
      });

      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to create return"); return; }

      await fetch(`/api/pos/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REFUNDED" }),
      });

      for (const item of items) {
        if (item.productId) {
          await fetch(`/api/products/${item.productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock_increment: item.quantity }),
          }).catch(() => {});
        }
      }

      router.push("/dashboard/pos/returns");
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create POS Return">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted/30 rounded-lg transition">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Create POS Return</h1>
            <p className="text-sm text-muted-foreground mt-1">POS Return Details</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Form Fields */}
        <Card>
          <CardHeader><CardTitle className="text-base">Return Information</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Return Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Return Date <span className="text-red-500">*</span></label>
              <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>

            {/* Original POS Order */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Original POS Order <span className="text-red-500">*</span></label>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading orders...</div>
              ) : (
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select POS Order</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.customerName || "Walk-in"} ({fmt(o.total)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Return Reason */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Return Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select reason...</option>
                {returnReasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Selection */}
        {selectedOrder && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Order Items</CardTitle>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {selectedItems.length} items selected for return
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {selectedOrder.orderItems.map((item) => {
                  const checked = selectedItemIds.has(item.id);
                  return (
                    <label key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4 rounded border-gray-400 text-primary focus:ring-primary flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.name || "Product"}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {fmt(item.price)}</p>
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0">{fmt(item.total)}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedOrder && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Select an order to see its items</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>
            <X className="h-4 w-4 mr-2" />Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Creating..." : "Create Return"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
