"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, Loader2, Save, X } from "lucide-react";

type Product = { id: string; name: string; sku: string | null; price: number; category: string | null };

export default function CreateDiscountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [applyOn, setApplyOn] = useState("Product");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [value, setValue] = useState("0");
  const [minQty, setMinQty] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (searchTerm) params.set("search", searchTerm);
      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);
        const cats = [...new Set(data.map((p) => p.category).filter(Boolean))] as string[];
        setCategories((prev) => (prev.length ? prev : cats));
      }
    } catch { }
    finally { setProductLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [categoryFilter, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        setProductLoading(false);
        const cats = [...new Set(data.map((p) => p.category).filter(Boolean))] as string[];
        setCategories((prev) => (prev.length ? prev : cats));
      })
      .catch(() => setProductLoading(false));
  }, []);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === products.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(products.map((p) => p.id)));
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    if (!value || Number(value) <= 0) { setError("Discount value must be > 0"); return; }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) { setError("End date must be after start date"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/pos/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          applyOn,
          discountType,
          value: Number(value),
          minimumQuantity: Number(minQty),
          startDate: startDate || null,
          endDate: endDate || null,
          productIds: applyOn === "Product" ? [...selectedIds] : [],
          selectedCategory: applyOn === "Category" ? selectedCategory : null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      router.push("/dashboard/pos/discounts");
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Discount">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Discount</h1>
            <p className="text-sm text-gray-400 mt-1">Discount Details</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Form Fields */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Name <span className="text-red-400">*</span></label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter discount name"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {/* Apply On */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Apply On <span className="text-red-400">*</span></label>
                <select
                  value={applyOn}
                  onChange={(e) => setApplyOn(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Product">Product</option>
                  <option value="Category">Category</option>
                  <option value="All">All Products</option>
                </select>
              </div>

              {/* Discount Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Discount Type <span className="text-red-400">*</span></label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">
                  Discount {discountType === "PERCENTAGE" ? "(%)" : "($)"} <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {/* Minimum Quantity */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Minimum Quantity <span className="text-red-400">*</span></label>
                <Input
                  type="number"
                  min={1}
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  placeholder="1"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Start Date <span className="text-red-400">*</span></label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">End Date <span className="text-red-400">*</span></label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - conditional on Apply On */}
          <div className="lg:col-span-2">
            {applyOn === "Product" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Select Products</h3>
                    <span className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full">{selectedIds.size} selected</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={products.length > 0 && selectedIds.size === products.length}
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Select All</span>
                    </label>

                    <div className="h-5 w-px bg-gray-700" />

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 rounded-md border border-gray-700 bg-gray-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Categories</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 h-9 rounded-md border border-gray-700 bg-gray-900 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                  {productLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">No products found</div>
                  ) : (
                    <div className="divide-y divide-gray-700/50">
                      {products.map((p) => (
                        <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/30 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleProduct(p.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{p.sku || "—"}</p>
                          </div>
                          <span className="text-sm text-gray-300 font-medium flex-shrink-0">
                            ${p.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {applyOn === "Category" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Select Category</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a category...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {applyOn === "All" && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 text-center">
                <p className="text-gray-400 text-sm">Discount will apply to <strong className="text-white">all products</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>
            <X className="h-4 w-4 mr-2" />Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Creating..." : "Create Discount"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
