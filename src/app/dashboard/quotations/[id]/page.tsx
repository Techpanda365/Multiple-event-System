"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Printer, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "text-gray-700 bg-gray-100",
  sent: "text-blue-700 bg-blue-100",
  accepted: "text-green-700 bg-green-100",
  rejected: "text-red-700 bg-red-100",
  expired: "text-yellow-700 bg-yellow-100",
};

const statusIcons: Record<string, any> = {
  draft: FileText, sent: Clock, accepted: CheckCircle, rejected: XCircle, expired: Clock,
};

const nextStatus: Record<string, { label: string; status: string; variant?: string }[]> = {
  draft: [{ label: "Mark as Sent", status: "Sent" }],
  sent: [
    { label: "Accept", status: "Accepted" },
    { label: "Reject", status: "Rejected", variant: "destructive" },
  ],
  accepted: [{ label: "Mark Expired", status: "Expired" }],
};

export default function QuotationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [q, setQ] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quotations/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setQ(data))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setQ(updated);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Quotation">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (!q) {
    return (
      <DashboardLayout title="Quotation">
        <div className="p-6 text-center text-muted-foreground">Quotation not found</div>
      </DashboardLayout>
    );
  }

  const sk = (q.status || "draft").toLowerCase();
  const Icon = statusIcons[sk] || FileText;
  const items = q.items || [];
  const computedTax = items.reduce((s: number, i: any) => {
    const lineTotal = (i.qty || 0) * (i.unitPrice || 0);
    const discAmt = lineTotal * ((i.discount || 0) / 100);
    return s + (lineTotal - discAmt) * ((i.tax || 0) / 100);
  }, 0);
  const showTax = q.tax || computedTax;

  return (
    <DashboardLayout title="Quotation Details">
      <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/quotations")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quotation #{q.number}</h1>
              <p className="text-sm text-muted-foreground">{q.number}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Printer className="h-4 w-4" /> Print</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[sk] || "text-gray-700 bg-gray-100"}`}>
                <Icon className="h-3.5 w-3.5" />
                {sk.charAt(0).toUpperCase() + sk.slice(1)}
              </span>
              {nextStatus[sk] && (
                <div className="flex gap-2">
                  {nextStatus[sk].map((action) => (
                    <Button key={action.status} size="sm" variant={(action.variant as any) || "default"} disabled={updating} onClick={() => updateStatus(action.status)}>
                      {updating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${(q.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
              <p className="font-semibold">{q.customerName}</p>
              {q.customerEmail && <p className="text-sm text-muted-foreground">{q.customerEmail}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{q.proposalDate ? new Date(q.proposalDate).toLocaleDateString() : "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium">{q.dueDate ? new Date(q.dueDate).toLocaleDateString() : "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Warehouse</span><span className="font-medium">{q.warehouse || "-"}</span></div>
                {q.paymentTerms && <div className="flex justify-between"><span className="text-muted-foreground">Terms</span><span className="font-medium">{q.paymentTerms}</span></div>}
              </div>
            </CardContent>
          </Card>
          {q.notes && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
                <p className="text-sm text-muted-foreground">{q.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-5 border-b"><h3 className="text-base font-semibold">Items</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 border-b">
                    <th className="text-left p-3 md:p-4 font-semibold text-xs uppercase text-muted-foreground">Product</th>
                    <th className="text-center p-3 md:p-4 font-semibold text-xs uppercase text-muted-foreground">Qty</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase text-muted-foreground">Unit Price</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase text-muted-foreground">Discount</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase text-muted-foreground">Tax</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No items</td></tr>
                  ) : (
                    items.map((item: any, i: number) => {
                      const qty = item.qty || 0;
                      const price = item.unitPrice || 0;
                      const lineTotal = qty * price;
                      const discAmt = lineTotal * ((item.discount || 0) / 100);
                      const taxAmt = (lineTotal - discAmt) * ((item.tax || 0) / 100);
                      const itemTotal = lineTotal - discAmt + taxAmt;
                      return (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/5">
                          <td className="p-3 md:p-4"><p className="font-medium">{item.product || "-"}</p>{item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}</td>
                          <td className="p-3 md:p-4 text-center">{qty}</td>
                          <td className="p-3 md:p-4 text-right">${price.toFixed(2)}</td>
                          <td className="p-3 md:p-4 text-right">{item.discount > 0 ? `${item.discount}%` : "-"}</td>
                          <td className="p-3 md:p-4 text-right">{item.tax > 0 ? `${item.tax}%` : "-"}</td>
                          <td className="p-3 md:p-4 text-right font-semibold">${itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t bg-muted/10">
              <div className="max-w-xs ml-auto space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${(q.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-red-500">-${(q.discount || 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${(showTax || 0).toFixed(2)}</span></div>
                <div className="flex justify-between pt-2 border-t font-semibold text-base"><span>Total</span><span>${(q.total || 0).toFixed(2)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
