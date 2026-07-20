"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaLibraryPicker } from "@/components/media/media-library-picker";
import { ArrowLeft, Loader2 } from "lucide-react";

type Tax = { id: string; name: string; rate: number };
type Category = { id: string; name: string; color: string };
type Warehouse = { id: string; name: string };
type Unit = { id: string; name: string };

const ITEM_TYPES = ["Product", "Service"];
const PRODUCT_TYPES = [
  "Clothing", "Electronics", "Food", "Furniture", "Software",
  "Digital Product", "Service", "Other",
];

function generateSKU() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `SKU-${code}`;
}

export function CreateItemClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mediaPicker, setMediaPicker] = useState<"product" | "additional" | null>(null);

  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [form, setForm] = useState({
    itemType: "Product",
    name: "",
    sku: generateSKU(),
    taxId: "",
    categoryId: "",
    shortDescription: "",
    description: "",
    productType: "",
    warrantyInfo: "",
    salePrice: "",
    purchasePrice: "",
    quantity: "1",
    productImage: "",
    additionalImages: [] as string[],
    warehouseId: "",
    unitId: "",
    reorderLevel: "",
    maxLevel: "",
    valuationMethod: "Weighted Average",
    trackInventory: false,
  });

  const set = (key: string, value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    Promise.all([
      fetch("/api/taxes").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/product-categories").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/purchase/warehouses").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/units").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([t, c, w, u]) => {
        setTaxes(Array.isArray(t) ? t : []);
        setCategories(Array.isArray(c) ? c : []);
        setWarehouses(Array.isArray(w) ? w : []);
        setUnits(Array.isArray(u) ? u : []);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }

    setSaving(true);
    setError("");

    try {
      const selectedTax = taxes.find((t) => t.id === form.taxId);

      const body: Record<string, unknown> = {
        name: form.name.trim(),
        itemType: form.itemType,
        sku: form.sku.trim() || null,
        taxId: form.taxId || null,
        taxRate: selectedTax?.rate || 0,
        categoryId: form.categoryId || null,
        shortDescription: form.shortDescription.trim() || null,
        description: form.description.trim() || null,
        productType: form.productType || null,
        warrantyInfo: form.warrantyInfo.trim() || null,
        price: form.salePrice ? Number(form.salePrice) : 0,
        cost: form.purchasePrice ? Number(form.purchasePrice) : null,
        stock: form.quantity ? Number(form.quantity) : 0,
        image: form.productImage || null,
        additionalImages: form.additionalImages,
        warehouseId: form.warehouseId || null,
        unitId: form.unitId || null,
        reorderLevel: form.reorderLevel ? Number(form.reorderLevel) : null,
        maxLevel: form.maxLevel ? Number(form.maxLevel) : null,
        valuationMethod: form.valuationMethod,
        trackInventory: form.trackInventory,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create item"); return; }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/products/items");
        router.refresh();
      }, 800);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Create Item">
      <div className="max-w-3xl mx-auto space-y-5 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/products/items")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Item</h1>
            <p className="text-sm text-muted-foreground">Add a new product or service to your catalog</p>
          </div>
        </div>

        {/* Success / Error */}
        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            Item created successfully! Redirecting...
          </div>
        )}
        {error && !success && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* ─── Basic Information ─── */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Create Item</h2>

            {/* Item Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Item Type</label>
              <select
                value={form.itemType}
                onChange={(e) => set("itemType", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ITEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
              <Input
                placeholder="Enter item name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SKU <span className="text-destructive">*</span></label>
              <div className="flex gap-2">
                <Input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  className="flex-1 max-w-xs"
                />
                <Button variant="outline" type="button" onClick={() => set("sku", generateSKU())}>
                  Generate
                </Button>
              </div>
            </div>

            {/* Tax */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tax <span className="text-destructive">*</span></label>
              <select
                value={form.taxId}
                onChange={(e) => set("taxId", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Tax</option>
                {taxes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Short Description</label>
              <Input
                placeholder="Brief description"
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Full description..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Product Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Product Type</label>
              <select
                value={form.productType}
                onChange={(e) => set("productType", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Product Type</option>
                {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Warranty Information */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Warranty Information</label>
              <Input
                placeholder="Warranty details..."
                value={form.warrantyInfo}
                onChange={(e) => set("warrantyInfo", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Pricing ─── */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Pricing & Stock</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sale Price <span className="text-destructive">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" min={0} step={0.01} placeholder="0.00"
                    value={form.salePrice}
                    onChange={(e) => set("salePrice", e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input type="number" min={0} step={0.01} placeholder="0.00"
                    value={form.purchasePrice}
                    onChange={(e) => set("purchasePrice", e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Quantity</label>
              <Input type="number" min={1} step={1} placeholder="1"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                className="max-w-40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Unit</label>
              <select
                value={form.unitId}
                onChange={(e) => set("unitId", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Unit</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ─── Images ─── */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Images</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              {form.productImage ? (
                <div className="relative w-40 h-40 rounded-lg border overflow-hidden">
                  <img src={form.productImage} alt="Product" className="w-full h-full object-cover" />
                  <button onClick={() => set("productImage", "")}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >×</button>
                  <button onClick={() => setMediaPicker("product")}
                    className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded"
                  >Change</button>
                </div>
              ) : (
                <button onClick={() => setMediaPicker("product")}
                  className="flex flex-col items-center justify-center w-40 h-40 rounded-lg border border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary transition-colors bg-background"
                >
                  <svg className="h-6 w-6 text-muted-foreground mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-muted-foreground">From Media Library</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Images</label>
              <div className="flex flex-wrap gap-3">
                {form.additionalImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg border overflow-hidden">
                    <img src={img} alt={`img ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => set("additionalImages", form.additionalImages.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >×</button>
                  </div>
                ))}
                <button onClick={() => setMediaPicker("additional")}
                  className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary transition-colors bg-background"
                >
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Select multiple images from media library</p>
            </div>

            <MediaLibraryPicker
              open={mediaPicker === "product"}
              onClose={() => setMediaPicker(null)}
              onSelect={(urls) => { if (urls[0]) set("productImage", urls[0]); }}
            />
            <MediaLibraryPicker
              open={mediaPicker === "additional"}
              onClose={() => setMediaPicker(null)}
              onSelect={(urls) => set("additionalImages", [...form.additionalImages, ...urls])}
              multiple
              selectedUrls={form.additionalImages}
            />
          </CardContent>
        </Card>

        {/* ─── Inventory ─── */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Inventory</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Warehouse</label>
              <select
                value={form.warehouseId}
                onChange={(e) => set("warehouseId", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Reorder Level</label>
                <Input type="number" min={0} placeholder="Enter Reorder Level"
                  value={form.reorderLevel}
                  onChange={(e) => set("reorderLevel", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Maximum Level</label>
                <Input type="number" min={0} placeholder="Enter Maximum Level"
                  value={form.maxLevel}
                  onChange={(e) => set("maxLevel", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Valuation Method</label>
              <select
                value={form.valuationMethod}
                onChange={(e) => set("valuationMethod", e.target.value)}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Weighted Average">Weighted Average</option>
                <option value="FIFO">FIFO</option>
                <option value="LIFO">LIFO</option>
                <option value="Standard Cost">Standard Cost</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.trackInventory}
                onChange={(e) => set("trackInventory", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm font-medium">Track Inventory</span>
            </label>
          </CardContent>
        </Card>

        {/* ─── Actions ─── */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/products/items")} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || success}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Creating..." : "Create"}
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}