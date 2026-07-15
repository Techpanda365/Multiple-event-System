"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Percent, CheckCircle2, Loader2, Calendar, ShoppingCart, Eye, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Discount = {
  id: string;
  name: string;
  applyOn: string;
  discountType: string;
  value: number;
  minimumQuantity: number;
  startDate: string | null;
  endDate: string | null;
  productIds: string[];
  selectedCategory: string | null;
  isActive: boolean;
};

export default function POSDiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const [viewDiscount, setViewDiscount] = useState<Discount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/pos/discounts")
      .then((r) => r.json())
      .then((data) => { setDiscounts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pos/discounts/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setDiscounts((p) => p.filter((d) => d.id !== deleteId));
        showToast("Discount deleted");
      }
    } catch { showToast("Failed to delete"); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <DashboardLayout title="POS Discounts">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />{toast}
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">POS Discounts</h1>
            <p className="text-sm text-muted-foreground">Manage discount rules</p>
          </div>
          <Link href="/dashboard/pos/discounts/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />Create Discount
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-16">
                <Percent className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No discounts yet</p>
                <Link href="/dashboard/pos/discounts/create">
                  <Button size="sm" className="mt-4"><Plus className="h-4 w-4 mr-1" />Create Discount</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Apply On</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Value</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Min Qty</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Products</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Period</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {discounts.map((d) => (
                      <tr key={d.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{d.name}</td>
                        <td className="py-3 px-4"><Badge className="text-xs bg-purple-500/10 text-purple-700">{d.applyOn}</Badge></td>
                        <td className="py-3 px-4"><Badge className="text-xs bg-blue-500/10 text-blue-700">{d.discountType}</Badge></td>
                        <td className="py-3 px-4 text-right font-semibold">{d.discountType === "PERCENTAGE" ? `${d.value}%` : `$${d.value}`}</td>
                        <td className="py-3 px-4 text-center">{d.minimumQuantity}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-500/10 text-gray-600 px-2 py-1 rounded-full">
                            <ShoppingCart className="h-3 w-3" />{d.productIds.length}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(d.startDate)} — {fmtDate(d.endDate)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={d.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}>
                            {d.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600"
                              title="View" onClick={() => setViewDiscount(d)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-yellow-600"
                              title="Edit" onClick={() => router.push(`/dashboard/pos/discounts/create?id=${d.id}`)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500"
                              title="Delete" onClick={() => setDeleteId(d.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* View Modal */}
      {viewDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">Discount Details</h3>
              <button onClick={() => setViewDiscount(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Name</p><p className="font-semibold">{viewDiscount.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge className={viewDiscount.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-600"}>{viewDiscount.isActive ? "Active" : "Inactive"}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Apply On</p><Badge className="text-xs bg-purple-500/10 text-purple-700">{viewDiscount.applyOn}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Discount Type</p><Badge className="text-xs bg-blue-500/10 text-blue-700">{viewDiscount.discountType}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Value</p><p className="font-semibold">{viewDiscount.discountType === "PERCENTAGE" ? `${viewDiscount.value}%` : `$${viewDiscount.value}`}</p></div>
                <div><p className="text-xs text-muted-foreground">Min. Quantity</p><p>{viewDiscount.minimumQuantity}</p></div>
                <div><p className="text-xs text-muted-foreground">Products</p><p>{viewDiscount.productIds.length} product(s)</p></div>
                {viewDiscount.selectedCategory && <div><p className="text-xs text-muted-foreground">Category</p><p>{viewDiscount.selectedCategory}</p></div>}
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Period</p><p>{fmtDate(viewDiscount.startDate)} — {fmtDate(viewDiscount.endDate)}</p></div>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setViewDiscount(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <Percent className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Discount?</h3>
              <p className="text-sm text-muted-foreground mt-1">This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
