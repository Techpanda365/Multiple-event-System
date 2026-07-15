"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Printer, RotateCcw, Building } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "text-gray-700 bg-gray-100",
  pending: "text-yellow-700 bg-yellow-100",
  approved: "text-blue-700 bg-blue-100",
  rejected: "text-red-700 bg-red-100",
  completed: "text-green-700 bg-green-100",
};

function calcTotals(items: any[]) {
  let subtotal = 0, tax = 0, total = 0;
  for (const item of items) {
    const qty = item.qty || item.quantity || 0;
    const price = item.unitPrice || 0;
    const lineTotal = qty * price;
    const discPct = item.discount || 0;
    const taxPct = item.tax || 0;
    const discAmt = lineTotal * (discPct / 100);
    const taxAmt = (lineTotal - discAmt) * (taxPct / 100);
    subtotal += lineTotal;
    tax += taxAmt;
    total += lineTotal - discAmt + taxAmt;
  }
  return { subtotal, tax, total };
}

export default function ReturnDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ret, setRet] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/sales/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRet(updated);
      }
    } catch (e) {
      console.error("Status update failed", e);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sales/returns/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setRet(data);
        if (data?.customerId) {
          fetch(`/api/sales/customers/${data.customerId}`)
            .then((r) => r.ok ? r.json() : null)
            .then((c) => setCustomer(c))
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Sales Return Details">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (!ret) {
    return (
      <DashboardLayout title="Sales Return Details">
        <div className="p-6 text-center text-muted-foreground">Return not found</div>
      </DashboardLayout>
    );
  }

  const items = ret.items || [];
  const statusKey = (ret.status || "draft").toLowerCase();
  const totals = calcTotals(items);
  const returnAmt = ret.totalAmount || totals.total;

  return (
    <DashboardLayout title="Sales Return Details">
      <div className="p-4 md:p-6 space-y-6 bg-gray-50/30 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/sales-invoice/returns")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Sales Return #{ret.returnNumber}</h1>
              <p className="text-sm text-muted-foreground">{ret.returnNumber}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {/* Status + Amount hero */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[statusKey] || "text-gray-700 bg-gray-100"}`}>
                <RotateCcw className="h-3.5 w-3.5" />
                {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
              </span>
              {/* Status action buttons */}
              <div className="flex gap-2">
                {statusKey === "draft" && (
                  <Button size="sm" disabled={updating} onClick={() => updateStatus("Pending")}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Mark as Pending
                  </Button>
                )}
                {statusKey === "pending" && (
                  <>
                    <Button size="sm" variant="default" disabled={updating} onClick={() => updateStatus("Approved")}>
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" disabled={updating} onClick={() => updateStatus("Rejected")}>
                      Reject
                    </Button>
                  </>
                )}
                {statusKey === "approved" && (
                  <Button size="sm" disabled={updating} onClick={() => updateStatus("Completed")}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${returnAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </div>

        {/* Customer + Shipping + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
              <div>
                <p className="font-semibold text-base">{customer?.name || ret.customerName}</p>
                {customer?.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
              </div>
              {customer?.billingAddress && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {customer.billingName && <p>{customer.billingName}</p>}
                  <p>{customer.billingAddress}</p>
                  {customer.billingAddress2 && <p>{customer.billingAddress2}</p>}
                  <p>{[customer.billingCity, customer.billingState, customer.billingZip].filter(Boolean).join(", ")}</p>
                  {customer.billingCountry && <p>{customer.billingCountry}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</h3>
              {customer?.shippingAddress ? (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {customer.shippingName && <p>{customer.shippingName}</p>}
                  <p>{customer.shippingAddress}</p>
                  {customer.shippingAddress2 && <p>{customer.shippingAddress2}</p>}
                  <p>{[customer.shippingCity, customer.shippingState, customer.shippingZip].filter(Boolean).join(", ")}</p>
                  {customer.shippingCountry && <p>{customer.shippingCountry}</p>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {customer?.billingAddress ? (
                    <div className="space-y-0.5">
                      {customer.billingName && <p>{customer.billingName}</p>}
                      <p>{customer.billingAddress}</p>
                      {customer.billingAddress2 && <p>{customer.billingAddress2}</p>}
                      <p>{[customer.billingCity, customer.billingState, customer.billingZip].filter(Boolean).join(", ")}</p>
                      {customer.billingCountry && <p>{customer.billingCountry}</p>}
                    </div>
                  ) : (
                    <p className="text-muted-foreground/60">Same as billing</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Date</span>
                  <span className="font-medium">{ret.returnDate ? new Date(ret.returnDate).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warehouse</span>
                  <span className="font-medium">{ret.warehouseName || "-"}</span>
                </div>
                {ret.reason && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="font-medium">{ret.reason}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Return Amount */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <span className="text-lg font-semibold">Return Amount</span>
            <span className="text-2xl font-bold">${returnAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </CardContent>
        </Card>

        {/* Return Items Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-5 border-b">
              <h3 className="text-base font-semibold">Return Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 border-b">
                    <th className="text-left p-3 md:p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="text-center p-3 md:p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Qty</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Unit Price</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Discount</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tax</th>
                    <th className="text-right p-3 md:p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">No items</td>
                    </tr>
                  ) : (
                    items.map((item: any, i: number) => {
                      const qty = item.qty || item.quantity || 0;
                      const price = item.unitPrice || 0;
                      const discPct = item.discount || 0;
                      const taxPct = item.tax || 0;
                      const lineTotal = qty * price;
                      const discAmt = lineTotal * (discPct / 100);
                      const taxAmt = (lineTotal - discAmt) * (taxPct / 100);
                      const itemTotal = lineTotal - discAmt + taxAmt;
                      return (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/5">
                          <td className="p-3 md:p-4">
                            <p className="font-medium">{item.product || item.name || "-"}</p>
                            {item.sku && <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>}
                            {item.description && <p className="text-xs text-muted-foreground/60 mt-0.5 max-w-xs">{item.description}</p>}
                          </td>
                          <td className="p-3 md:p-4 text-center">{qty}</td>
                          <td className="p-3 md:p-4 text-right">${price.toFixed(2)}</td>
                          <td className="p-3 md:p-4 text-right">
                            {discPct > 0 ? <span className="text-red-500">{discPct}%</span> : "-"}
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            {taxPct > 0 ? <span>{taxPct}%</span> : "-"}
                          </td>
                          <td className="p-3 md:p-4 text-right font-semibold">${itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-5 border-t bg-muted/10">
              <div className="max-w-xs ml-auto space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold text-base">
                  <span>Total Return Amount</span>
                  <span>${returnAmt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
