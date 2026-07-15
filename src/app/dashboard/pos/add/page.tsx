"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart, Search, Plus, Minus, Trash2,
  Loader2, CreditCard, X,
} from "lucide-react";

type Product = {
  id: string; name: string; sku: string | null;
  price: number; cost: number | null; stock: number;
  category: string | null; image: string | null;
};

type Counter = { id: string; name: string };
type Customer = { id: string; name: string; email: string | null; phone: string | null };

type CartItem = {
  productId: string; name: string; image: string | null;
  price: number; qty: number; total: number;
};

const fmt = (n: number) => `${n.toFixed(2)}$`;

// ─── SKU Input Component ─────────────────────────────────────────────────────
function SkuInput({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) {
  const [sku, setSku] = useState("");
  const [tooltip, setTooltip] = useState<"hint" | "notfound" | "added" | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBySku();
    }
  };

  const addBySku = () => {
    const trimmed = sku.trim().toLowerCase();
    if (!trimmed) return;
    const product = products.find(
      (p) => p.sku?.toLowerCase() === trimmed || p.name.toLowerCase() === trimmed
    );
    if (product) {
      onAdd(product);
      setSku("");
      setTooltip("added");
      setTimeout(() => setTooltip(null), 1500);
    } else {
      setTooltip("notfound");
      setTimeout(() => setTooltip(null), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Tooltip */}
      {tooltip && (
        <div className={`absolute -top-9 left-0 px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg z-20 whitespace-nowrap ${
          tooltip === "hint"     ? "bg-white border border-border text-foreground" :
          tooltip === "added"    ? "bg-emerald-500 text-white" :
          "bg-red-50 border border-red-200 text-red-600"
        }`}>
          {tooltip === "hint"     && "Enter SKU to add product to cart."}
          {tooltip === "added"    && "✓ Product added to cart!"}
          {tooltip === "notfound" && "SKU not found — try again"}
        </div>
      )}

      {/* Input */}
      <div className={`flex items-center gap-2.5 h-10 px-3 rounded-xl border-2 transition-colors ${
        focused ? "border-emerald-400 bg-white" : "border-border bg-muted/20"
      }`}>
        {/* Barcode icon */}
        <div className="flex gap-0.5 flex-shrink-0">
          {[2, 4, 2, 4, 2].map((w, i) => (
            <div key={i} className={`bg-muted-foreground/40 rounded-sm h-4`} style={{ width: w }} />
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Add To Cart by SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); setTooltip("hint"); }}
          onBlur={() => { setFocused(false); setTooltip(null); }}
          className="flex-1 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:text-foreground"
        />
        {sku && (
          <button
            onClick={addBySku}
            className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex-shrink-0"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

export default function AddPOSPage() {
  const router = useRouter();
  const [products, setProducts]     = useState<Product[]>([]);
  const [counters, setCounters]     = useState<Counter[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch]         = useState("");
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [counterId, setCounterId]   = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [placing, setPlacing]     = useState(false);
  const [error, setError]         = useState("");

  // Fixed tax rates (can be made dynamic later)
  const GST_RATE = 18;
  const VAT_RATE = 12;

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.ok ? r.json() : []),
      fetch("/api/pos/counters").then((r) => r.ok ? r.json() : []),
      fetch("/api/sales/customers").then((r) => r.ok ? r.json() : []),
      fetch("/api/purchase/warehouses").then((r) => r.ok ? r.json() : []),
    ]).then(([p, c, cust, w]) => {
      setProducts(Array.isArray(p) ? p.filter((x: Product) => x.stock > 0 && x.isActive !== false) : []);
      setCounters(Array.isArray(c) ? c : []);
      setCustomers(Array.isArray(cust) ? cust : []);
      setWarehouses(Array.isArray(w) ? w : []);
    }).catch(() => {})
    .finally(() => setLoadingData(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q) ?? false) ||
      (p.category?.toLowerCase().includes(q) ?? false)
    );
  }, [products, search]);

  // ─── Cart helpers ─────────────────────────────────────────────────────────
  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === p.id);
      if (existing) {
        return prev.map((c) =>
          c.productId === p.id
            ? { ...c, qty: c.qty + 1, total: (c.qty + 1) * c.price }
            : c
        );
      }
      return [...prev, { productId: p.id, name: p.name, image: p.image, price: p.price, qty: 1, total: p.price }];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.productId !== productId) return c;
        const newQty = Math.max(1, c.qty + delta);
        return { ...c, qty: newQty, total: newQty * c.price };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  // ─── Totals ───────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, c) => s + c.total, 0);
  const gstAmt   = subtotal * (GST_RATE / 100);
  const vatAmt   = subtotal * (VAT_RATE / 100);
  const grandTotal = subtotal + gstAmt + vatAmt;

  // ─── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) { setError("Add at least one item"); return; }
    setError(""); setPlacing(true);
    try {
      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counterId: counterId || null,
          customerName: customerName.trim() || null,
          warehouseId: warehouseId || null,
          items: cart.map((c) => ({
            productId: c.productId,
            quantity:  c.qty,
            price:     c.price,
            total:     c.total,
          })),
          subtotal,
          tax:   gstAmt + vatAmt,
          total: grandTotal,
          status: "SUCCEEDED",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }

      // Reduce stock
      for (const item of cart) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          await fetch(`/api/products/${item.productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: prod.stock - item.qty }),
          });
        }
      }

      setCart([]);
      setCustomerId("");
      setCustomerName("");
      setCounterId("");
      router.push("/dashboard/pos/orders");
    } catch { setError("Network error"); }
    finally { setPlacing(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="New POS Order">
      <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-3.5rem)] -m-4 lg:-m-6 overflow-hidden">

        {/* ═══════ LEFT: Products ═══════ */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">

          {/* Search Bar */}
          <div className="p-4 border-b border-border bg-background sticky top-0 z-10 space-y-2">
            {/* Search by name */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, category..."
                className="pl-9 h-10 bg-muted/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add by SKU */}
            <SkuInput products={products} onAdd={addToCart} />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingData ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-sm">{search ? "No products match your search" : "No products available"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product) => {
                  // Calculate a fake discount for demo (products with no cost use 0% off)
                  const discountPct = product.cost && product.cost < product.price
                    ? Math.round(((product.price - product.cost) / product.price) * 100)
                    : 0;
                  const inCart = cart.find((c) => c.productId === product.id);

                  return (
                    <div
                      key={product.id}
                      className="relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => addToCart(product)}
                    >
                      {/* Discount Badge */}
                      {discountPct > 0 && (
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          {discountPct}% OFF
                        </div>
                      )}

                      {/* In-cart indicator */}
                      {inCart && (
                        <div className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {inCart.qty}
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="aspect-square bg-muted/30 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/20 select-none">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Add Button */}
                      <div className="absolute bottom-[72px] right-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-3 pt-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{product.sku || "—"}</p>
                        <div className="mt-1 flex items-end justify-between">
                          <div>
                            {discountPct > 0 && (
                              <p className="text-xs text-muted-foreground line-through">{fmt(product.price)}</p>
                            )}
                            <p className="text-base font-bold text-emerald-600">
                              {discountPct > 0
                                ? fmt(product.price * (1 - discountPct / 100))
                                : fmt(product.price)}
                            </p>
                          </div>
                          {/* Stock */}
                          <span className={`text-sm font-bold ${product.stock <= 10 ? "text-red-500" : "text-muted-foreground"}`}>
                            {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════ RIGHT: Cart ═══════ */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col border-l border-border bg-background">

          {/* Billing Counter */}
          <div className="p-4 border-b border-border">
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Billing Counter <span className="text-destructive">*</span>
            </label>
            <select
              value={counterId}
              onChange={(e) => setCounterId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Billing Counter</option>
              {counters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div className="px-4 py-3 border-b border-border">
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Customer <span className="text-muted-foreground/60 text-xs">(optional)</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                const id = e.target.value;
                setCustomerId(id);
                const cust = customers.find((c) => c.id === id);
                setCustomerName(cust?.name || "");
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ""}</option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div className="px-4 py-3 border-b border-border">
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Warehouse</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Cart Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              <span className="font-bold text-base">Shopping Cart</span>
            </div>
            <div className="flex items-center gap-2">
              {totalItems > 0 && (
                <span className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs opacity-70">Click products to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    {/* Name + Price */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-emerald-600 font-medium">{fmt(item.price)} each</p>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price + Qty */}
                  <div className="flex items-center justify-between px-3 pb-3">
                    <div className="bg-muted/50 rounded-lg px-3 py-1">
                      <span className="text-xs text-muted-foreground">Price: </span>
                      <span className="text-xs font-medium">{fmt(item.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(item.productId, -1)}
                        className="h-7 w-7 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        onClick={() => changeQty(item.productId, 1)}
                        className="h-7 w-7 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="ml-2 font-bold text-sm min-w-16 text-right">{fmt(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Price Breakdown + Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-border p-4 space-y-3">
              {/* Breakdown */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST ({GST_RATE}.00%)</span>
                  <span>{fmt(gstAmt)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT ({VAT_RATE}.00%)</span>
                  <span>{fmt(vatAmt)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border">
                  <span>Total</span>
                  <span className="text-emerald-600">{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Error */}
              {error && <p className="text-xs text-destructive">{error}</p>}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={placing}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {placing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>
                ) : (
                  <><CreditCard className="h-4 w-4" />Checkout</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
