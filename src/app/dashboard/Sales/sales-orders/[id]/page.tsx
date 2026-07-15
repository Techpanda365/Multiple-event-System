"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Pencil, Trash2, Printer, Building2 } from "lucide-react";

type SalesOrder = {
  id: string; orderNumber: string; name: string | null;
  customerName: string; customerEmail: string | null;
  accountName: string | null; assignedUserName: string | null;
  orderDate: string; dueDate: string | null;
  total: number; subtotal: number; discount: number; tax: number;
  status: string; notes: string | null; description: string | null;
  billingAddress: string | null; billingCity: string | null;
  billingState: string | null; billingCountry: string | null; billingPostalCode: string | null;
  shippingAddress: string | null; shippingCity: string | null;
  shippingState: string | null; shippingCountry: string | null; shippingPostalCode: string | null;
  shippingSameAsBilling: boolean;
  shippingProvider: string | null; billingContactName: string | null; shippingContactName: string | null;
  items: { product?: string; qty?: number; unitPrice?: number; discountPct?: number; tax?: string }[];
};

const STATUS_LIST = ["Draft", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const statusColors: Record<string, string> = {
  Draft: "bg-gray-500/10 text-gray-600", Confirmed: "bg-green-500/10 text-green-700",
  Processing: "bg-blue-500/10 text-blue-700", Shipped: "bg-purple-500/10 text-purple-700",
  Delivered: "bg-teal-500/10 text-teal-700", Cancelled: "bg-red-500/10 text-red-700",
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function SalesOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/sales/orders/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled) { setOrder(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this sales order?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sales/orders/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/Sales/sales-orders");
    } finally { setDeleting(false); }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <DashboardLayout title="Sales Order">
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  if (!order) return (
    <DashboardLayout title="Sales Order">
      <div className="p-6 text-center text-muted-foreground">Sales order not found</div>
    </DashboardLayout>
  );

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <DashboardLayout title={`Sales Order ${order.orderNumber}`}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/Sales/sales-orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Sales Order #{order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">{order.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Print</Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/Sales/sales-orders/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-1" />{deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Status & Dates */}
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`text-xs ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</Badge>
              {STATUS_LIST.indexOf(order.status) < STATUS_LIST.length - 1 && STATUS_LIST.indexOf(order.status) >= 0 && (
                <div className="flex gap-1">
                  {STATUS_LIST.slice(STATUS_LIST.indexOf(order.status) + 1).map((s) => (
                    <Button key={s} variant="outline" size="sm" className="text-xs h-7"
                      onClick={async () => {
                        await fetch(`/api/sales/orders/${id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: s }),
                        });
                        const res = await fetch(`/api/sales/orders/${id}`);
                        if (res.ok) setOrder(await res.json());
                      }}>
                      Mark {s}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Order: <strong>{fmtDate(order.orderDate)}</strong></span>
              {order.dueDate && <span>Due: <strong>{fmtDate(order.dueDate)}</strong></span>}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Info */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Customer Information</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{order.customerName}</span></div>
              {order.customerEmail && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{order.customerEmail}</span></div>}
              {order.accountName && <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{order.accountName}</span>
              </div>}
              {order.assignedUserName && <div className="flex justify-between"><span className="text-muted-foreground">Assigned To</span><span>{order.assignedUserName}</span></div>}
              {order.billingContactName && <div className="flex justify-between"><span className="text-muted-foreground">Billing Contact</span><span>{order.billingContactName}</span></div>}
              {order.shippingContactName && <div className="flex justify-between"><span className="text-muted-foreground">Shipping Contact</span><span>{order.shippingContactName}</span></div>}
              {order.shippingProvider && <div className="flex justify-between"><span className="text-muted-foreground">Shipping Provider</span><span>{order.shippingProvider}</span></div>}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Addresses</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Billing Address</p>
                {order.billingAddress ? (
                  <p>{order.billingAddress}{order.billingCity ? `, ${order.billingCity}` : ""}{order.billingState ? `, ${order.billingState}` : ""}{order.billingCountry ? `, ${order.billingCountry}` : ""}{order.billingPostalCode ? ` - ${order.billingPostalCode}` : ""}</p>
                ) : <p className="text-muted-foreground">No billing address</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Shipping Address</p>
                {order.shippingSameAsBilling ? (
                  <p className="text-muted-foreground italic">Same as billing</p>
                ) : order.shippingAddress ? (
                  <p>{order.shippingAddress}{order.shippingCity ? `, ${order.shippingCity}` : ""}{order.shippingState ? `, ${order.shippingState}` : ""}{order.shippingCountry ? `, ${order.shippingCountry}` : ""}{order.shippingPostalCode ? ` - ${order.shippingPostalCode}` : ""}</p>
                ) : <p className="text-muted-foreground">No shipping address</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Order Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Product</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Qty</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Unit Price</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Discount %</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Tax</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No items</td></tr>
                  ) : items.map((item, i) => {
                    const qty = item.qty || 0;
                    const price = item.unitPrice || 0;
                    const sub = qty * price;
                    const discAmt = sub * ((item.discountPct || 0) / 100);
                    const afterDisc = sub - discAmt;
                    return (
                      <tr key={i}>
                        <td className="p-3 font-medium">{item.product || `Item ${i + 1}`}</td>
                        <td className="p-3 text-center">{qty}</td>
                        <td className="p-3 text-right">{fmt(price)}</td>
                        <td className="p-3 text-right">{item.discountPct || 0}%</td>
                        <td className="p-3">{item.tax || "No tax"}</td>
                        <td className="p-3 text-right font-semibold">{fmt(afterDisc)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Order Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-red-500">-{fmt(order.discount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{fmt(order.tax)}</span></div>
              <div className="flex justify-between font-medium text-base border-t pt-2"><span>Total</span><span>{fmt(order.total)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Notes */}
        <div className="grid gap-6 lg:grid-cols-2">
          {order.description && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{order.description}</p></CardContent>
            </Card>
          )}
          {order.notes && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{order.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
