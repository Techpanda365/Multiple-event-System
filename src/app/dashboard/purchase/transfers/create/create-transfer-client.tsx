"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

type Warehouse = { id: string; name: string };
type Product = { id: string; name: string; stock: number };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateTransferClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    fromWarehouseId: "",
    fromWarehouseName: "",
    toWarehouseId: "",
    toWarehouseName: "",
    productId: "",
    productName: "",
    quantity: "",
    date: todayStr(),
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/products").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([w, p]) => {
        setWarehouses(Array.isArray(w) ? w : []);
        setProducts(Array.isArray(p) ? p : []);
      })
      .catch(() => {});
  }, []);

  const set = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const selectedFrom = warehouses.find((w) => w.id === formData.fromWarehouseId);
  const toWarehouses = warehouses.filter((w) => w.id !== formData.fromWarehouseId);
  const hasFrom = !!formData.fromWarehouseId;

  const handleSave = async () => {
    if (!formData.fromWarehouseId || !formData.toWarehouseId || !formData.productId || !formData.quantity) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/purchase/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouseId: formData.fromWarehouseId,
          fromWarehouseName: selectedFrom?.name || formData.fromWarehouseName,
          toWarehouseId: formData.toWarehouseId,
          toWarehouseName: toWarehouses.find((w) => w.id === formData.toWarehouseId)?.name || "",
          productId: formData.productId,
          productName: products.find((p) => p.id === formData.productId)?.name || "",
          quantity: Number(formData.quantity),
          date: formData.date,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create transfer");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/purchase/transfers");
        router.refresh();
      }, 800);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Transfer">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/purchase/transfers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Transfer</h1>
            <p className="text-sm text-muted-foreground">Transfer stock between warehouses</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            Transfer created successfully! Redirecting...
          </div>
        )}

        {error && !success && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">From Warehouse <span className="text-destructive">*</span></label>
                <select value={formData.fromWarehouseId} onChange={(e) => {
                  const w = warehouses.find((wh) => wh.id === e.target.value);
                  setFormData({
                    ...formData,
                    fromWarehouseId: e.target.value,
                    fromWarehouseName: w?.name || "",
                    toWarehouseId: "",
                    toWarehouseName: "",
                    productId: "",
                    productName: "",
                    quantity: "",
                  });
                }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">To Warehouse <span className="text-destructive">*</span></label>
                <select value={formData.toWarehouseId} onChange={(e) => {
                  const w = warehouses.find((wh) => wh.id === e.target.value);
                  set("toWarehouseId", e.target.value);
                  set("toWarehouseName", w?.name || "");
                }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">{hasFrom ? "Select warehouse" : "Select from warehouse first"}</option>
                  {toWarehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Product <span className="text-destructive">*</span></label>
                <select value={formData.productId} onChange={(e) => {
                  const p = products.find((pr) => pr.id === e.target.value);
                  set("productId", e.target.value);
                  set("productName", p?.name || "");
                }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="">{hasFrom ? "Select product" : "Select from warehouse first"}</option>
                  {products.map((p) => (<option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Quantity <span className="text-destructive">*</span></label>
                <Input
                  type="number" min={1}
                  placeholder={formData.productId ? "Enter quantity" : "Select product first"}
                  value={formData.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={formData.date}
                onChange={(e) => set("date", e.target.value)}
                className="max-w-60"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button variant="outline" onClick={() => router.push("/dashboard/purchase/transfers")}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || success}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {saving ? "Saving..." : "Save Transfer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
