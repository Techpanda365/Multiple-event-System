"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Trash2, CheckCircle2, Loader2 } from "lucide-react";

type PosReturn = {
  id: string; returnNumber: string; customerName: string | null;
  warehouseName: string | null; returnDate: string; totalAmount: number;
  items: { productName?: string; quantity?: number; total?: number }[];
  status: string; reason?: string; notes?: string;
  orderId?: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const statusBadge = (s: string) => {
  const map: Record<string, string> = { Draft: "secondary", Completed: "success", Refunded: "default" };
  return <Badge variant={(map[s] || "outline") as "default" | "secondary" | "destructive" | "outline"}>{s}</Badge>;
};

export default function POSReturnsPage() {
  const router = useRouter();
  const [returns, setReturns]     = useState<PosReturn[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [viewReturn, setViewReturn] = useState<PosReturn | null>(null);
  const [toast, setToast]         = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pos/returns").then((r) => r.json()).then((data) => {
      if (cancelled) return;
      setReturns(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.returnNumber.toLowerCase().includes(q) || (r.customerName || "").toLowerCase().includes(q);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this return record?")) return;
    const res = await fetch(`/api/pos/returns/${id}`, { method: "DELETE" });
    if (res.ok) { setReturns((prev) => prev.filter((r) => r.id !== id)); showToast("Return deleted"); }
    else showToast("Failed to delete");
  };

  return (
    <DashboardLayout title="POS Returns">
      {toast && <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{toast}</div>}

      {/* View Modal */}
      {viewReturn && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setViewReturn(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Return Details</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Return #</span><p className="font-mono font-semibold">{viewReturn.returnNumber}</p></div>
                <div><span className="text-muted-foreground">Customer</span><p>{viewReturn.customerName || "N/A"}</p></div>
                <div><span className="text-muted-foreground">Warehouse</span><p>{viewReturn.warehouseName || "N/A"}</p></div>
                <div><span className="text-muted-foreground">Date</span><p>{new Date(viewReturn.returnDate).toLocaleDateString("en-IN")}</p></div>
                <div><span className="text-muted-foreground">Total</span><p className="font-bold text-primary">{fmt(viewReturn.totalAmount)}</p></div>
                <div><span className="text-muted-foreground">Status</span><div>{statusBadge(viewReturn.status)}</div></div>
              </div>
              {viewReturn.reason && <div><span className="text-muted-foreground">Reason</span><p>{viewReturn.reason}</p></div>}
              {viewReturn.notes && <div><span className="text-muted-foreground">Notes</span><p>{viewReturn.notes}</p></div>}
              <div><span className="text-muted-foreground">Items ({viewReturn.items?.length || 0})</span>
                <div className="border rounded-lg divide-y mt-1">
                  {(viewReturn.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between px-3 py-1.5 text-xs">
                      <span>{item.productName || "Product"} × {item.quantity}</span>
                      <span>{fmt(item.total || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => setViewReturn(null)}>Close</Button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">POS Returns</h1>
            <p className="text-sm text-muted-foreground">Manage order returns and refunds</p>
          </div>
          <Button onClick={() => router.push("/dashboard/pos/returns/create")}>
            <Plus className="h-4 w-4 mr-2" />New Return
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search return #, customer..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {search ? "No returns match search" : "No returns yet. Click 'New Return' to process one."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Return Number</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Warehouse</th>
                      <th className="px-4 py-3 font-medium">Return Date</th>
                      <th className="px-4 py-3 font-medium text-right">Total Amount</th>
                      <th className="px-4 py-3 font-medium text-center">Items</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{r.returnNumber}</td>
                        <td className="px-4 py-3">{r.customerName || "N/A"}</td>
                        <td className="px-4 py-3">{r.warehouseName || "N/A"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(r.returnDate).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-bold">{fmt(r.totalAmount)}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline">{r.items?.length || 0}</Badge>
                        </td>
                        <td className="px-4 py-3">{statusBadge(r.status)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewReturn(r)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" title="Delete" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4" />
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
      </div>
    </DashboardLayout>
  );
}
