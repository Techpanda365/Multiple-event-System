"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Plus, X, Wand2, Tag } from "lucide-react";

interface Coupon {
  id: string;
  name: string;
  code: string;
  type: string;
  discount: number;
  usageLimit: number | null;
  limitPerUser: number | null;
  minSpend: number | null;
  maxSpend: number | null;
  description: string | null;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    name: "", code: "", type: "PERCENTAGE", discount: 0, usageLimit: "",
    limitPerUser: "", minSpend: "", maxSpend: "", description: "", expiryDate: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/coupons").then((r) => r.json()),
    ]).then(([sessionData, couponsData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      // Fix: Check if couponsData has the right structure
      setCoupons(couponsData.coupons || couponsData.data || couponsData || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm((prev) => ({ ...prev, code }));
  };

  const createCoupon = async () => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Fix: Check response structure
        const newCoupon = data.data || data.coupon || data;
        setCoupons((prev) => [newCoupon, ...prev]);
        setShowForm(false);
        setForm({ 
          name: "", code: "", type: "PERCENTAGE", discount: 0, usageLimit: "", 
          limitPerUser: "", minSpend: "", maxSpend: "", description: "", expiryDate: "" 
        });
      } else {
        console.error("Failed to create coupon:", data.error);
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((x) => x.id !== id));
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  // FIX: Add null/undefined checks in filter
  const filtered = (coupons || []).filter((c) => {
    if (!c) return false;
    const name = c.name?.toLowerCase() || "";
    const code = c.code?.toLowerCase() || "";
    const query = searchQuery?.toLowerCase() || "";
    return name.includes(query) || code.includes(query);
  });

  return (
    <DashboardLayout title="Coupons" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Coupons</h2>
            <p className="text-muted-foreground text-sm">Manage discount coupons for subscriptions</p>
          </div>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add Coupon
          </Button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search coupons..." 
            className="pl-9 h-9" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Used</th>
                <th className="text-left px-4 py-3 font-medium">Expiry</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No coupons found</p>
                </td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono font-bold tracking-wider bg-muted px-2 py-0.5 rounded">{c.code}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {c.type === "PERCENTAGE" ? `${c.discount}%` : `$${c.discount}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5">{c.type}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.usageLimit ?? "∞"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "No expiry"}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      className={`relative inline-flex h-5 w-9 items-center rounded-full ${c.isActive ? "bg-green-500" : "bg-gray-300"}`} 
                      onClick={() => toggleStatus(c.id, c.isActive)}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${c.isActive ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500" 
                      onClick={() => deleteCoupon(c.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create Coupon</h3>
                  <p className="text-xs text-muted-foreground">Create a discount coupon for subscriptions</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name <span className="text-destructive">*</span></label>
                    <Input 
                      placeholder="e.g. Summer Sale" 
                      className="h-10 rounded-xl" 
                      value={form.name} 
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Code <span className="text-destructive">*</span></label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. SUMMER20" 
                        className="h-10 rounded-xl font-mono uppercase" 
                        value={form.code} 
                        onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} 
                      />
                      <Button variant="outline" className="h-10 w-10 rounded-xl shrink-0" onClick={generateCode}>
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Discount Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["PERCENTAGE", "FLAT"].map((t) => (
                        <label key={t} className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 cursor-pointer ${form.type === t ? "border-primary bg-primary/5" : "border-border"}`}>
                          <input 
                            type="radio" 
                            name="type" 
                            value={t} 
                            checked={form.type === t} 
                            onChange={() => setForm((p) => ({ ...p, type: t }))} 
                            className="sr-only" 
                          />
                          <span className="text-sm font-medium">{t === "PERCENTAGE" ? "Percentage" : "Flat"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{form.type === "PERCENTAGE" ? "Discount (%)" : "Discount ($)"}</label>
                    <Input 
                      className="h-10 rounded-xl" 
                      type="number" 
                      placeholder="e.g. 20" 
                      value={form.discount} 
                      onChange={(e) => setForm((p) => ({ ...p, discount: parseFloat(e.target.value) || 0 }))} 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Expiry Date</label>
                    <Input 
                      type="date" 
                      className="h-10 rounded-xl" 
                      value={form.expiryDate} 
                      onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Usage Limit</label>
                    <Input 
                      placeholder="e.g. 100" 
                      className="h-10 rounded-xl" 
                      value={form.usageLimit} 
                      onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Min. Spend ($)</label>
                      <Input 
                        placeholder="e.g. 50" 
                        className="h-10 rounded-xl" 
                        value={form.minSpend} 
                        onChange={(e) => setForm((p) => ({ ...p, minSpend: e.target.value }))} 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Max. Spend ($)</label>
                      <Input 
                        placeholder="e.g. 500" 
                        className="h-10 rounded-xl" 
                        value={form.maxSpend} 
                        onChange={(e) => setForm((p) => ({ ...p, maxSpend: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description</label>
                    <textarea 
                      className="flex min-h-[70px] w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none" 
                      placeholder="Enter description" 
                      value={form.description} 
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button 
                className="rounded-xl gap-1.5" 
                onClick={createCoupon} 
                disabled={!form.name || !form.code}
              >
                <Tag className="h-4 w-4" /> Create Coupon
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}