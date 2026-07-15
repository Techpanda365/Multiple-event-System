"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Loader2, Download, FileText, PenTool,
  Trash2, CheckCircle2, AlertCircle, Printer,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type InvoiceItem = { product?: string; description?: string; quantity: number; unitPrice: number; tax?: number; total?: number };
type Invoice = {
  id: string; invoiceNumber: string; customerName: string;
  invoiceDate: string; dueDate: string | null; status: string;
  paymentTerms: string | null; notes: string | null;
  items: InvoiceItem[]; subtotal: number; discount: number; tax: number;
  total: number; balance: number; signature: string | null; generatedAt: string | null;
};

const statusColors: Record<string, string> = {
  Draft:   "bg-gray-500/10 text-gray-600",
  Sent:    "bg-blue-500/10 text-blue-700",
  Paid:    "bg-green-500/10 text-green-700",
  Overdue: "bg-red-500/10 text-red-700",
  Cancelled: "bg-gray-400/10 text-gray-500",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Signature Pad Component ─────────────────────────────────────────────────
function SignaturePad({
  onSave, onClear, existingSignature, saving,
}: {
  onSave: (data: string) => void;
  onClear: () => void;
  existingSignature: string | null;
  saving: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showExisting, setShowExisting] = useState(!!existingSignature);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true); setHasDrawn(true); setShowExisting(false);
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    e.preventDefault();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false); setShowExisting(false);
    onClear();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (!hasDrawn) return;
    const dataURL = canvas.toDataURL("image/png");
    onSave(dataURL);
  };

  return (
    <div className="space-y-3">
      {/* Show existing signature */}
      {showExisting && existingSignature ? (
        <div className="relative">
          <div className="border-2 border-dashed border-green-300 rounded-xl p-3 bg-green-50">
            <p className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />Signature saved
            </p>
            <img src={existingSignature} alt="Saved signature" className="max-h-24 mx-auto" />
          </div>
          <Button variant="outline" size="sm" className="mt-2 text-destructive" onClick={() => setShowExisting(false)}>
            <PenTool className="h-3.5 w-3.5 mr-1.5" />Re-sign
          </Button>
        </div>
      ) : (
        <>
          <div className="relative border-2 border-dashed border-border rounded-xl overflow-hidden bg-gray-50/50">
            <canvas
              ref={canvasRef}
              width={500} height={140}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground">Sign here...</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearCanvas} disabled={!hasDrawn}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Clear
            </Button>
            <Button size="sm" onClick={saveSignature} disabled={!hasDrawn || saving}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
              {saving ? "Saving..." : "Save Signature"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [savingSig, setSavingSig] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/sales/invoices/${id}`);
      if (res.ok) setInvoice(await res.json());
    } catch { }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  // ─── Save Signature ───────────────────────────────────────────────────────
  const handleSaveSignature = async (signatureData: string) => {
    if (!id) return;
    setSavingSig(true);
    try {
      const res = await fetch(`/api/sales/invoices/${id}/signature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signatureData }),
      });
      if (res.ok) {
        setInvoice((prev) => prev ? { ...prev, signature: signatureData } : prev);
        showToast("Signature saved successfully");
      } else { showToast("Failed to save signature", "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setSavingSig(false); }
  };

  const handleClearSignature = async () => {
    if (!id || !invoice?.signature) return;
    try {
      await fetch(`/api/sales/invoices/${id}/signature`, { method: "DELETE" });
      setInvoice((prev) => prev ? { ...prev, signature: null } : prev);
    } catch { }
  };

  // ─── Generate Invoice ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/sales/invoices/${id}/generate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setInvoice((prev) => prev ? { ...prev, status: data.invoice.status, generatedAt: data.invoice.generatedAt } : prev);
        showToast(`Invoice generated! Status: ${data.invoice.status}`);
      } else { showToast(data.error || "Failed to generate", "error"); }
    } catch { showToast("Network error", "error"); }
    finally { setGenerating(false); }
  };

  // ─── Download PDF (using browser print) ──────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!id) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/sales/invoices/${id}/pdf`);
      if (!res.ok) { showToast("Failed to load PDF data", "error"); return; }
      const data = await res.json();
      const inv = data.invoice;
      const cust = data.customer;
      const comp = data.company;

      const items = Array.isArray(inv.items)
        ? inv.items.filter((i: any) => i._type !== "meta")
        : [];

      const html = `<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
  .company h1 { font-size: 24px; color: #2563eb; margin: 0 0 4px 0; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 28px; color: #2563eb; margin: 0; }
  .invoice-meta p { margin: 2px 0; color: #6b7280; font-size: 13px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .party { background: #f9fafb; padding: 16px; border-radius: 8px; }
  .party h3 { font-size: 11px; text-transform: uppercase; color: #6b7280; margin: 0 0 8px 0; letter-spacing: 1px; }
  .party p { margin: 2px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #2563eb; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .totals { display: flex; justify-content: flex-end; }
  .totals-box { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
  .totals-row.grand { border-top: 2px solid #1a1a1a; font-weight: bold; font-size: 16px; padding-top: 8px; margin-top: 4px; color: #2563eb; }
  .signature-section { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
  .sig-box { border: 1px dashed #d1d5db; border-radius: 8px; padding: 16px; display: inline-block; min-width: 200px; }
  .sig-box img { max-height: 80px; }
  .sig-label { font-size: 11px; color: #6b7280; margin-top: 8px; border-top: 1px solid #d1d5db; padding-top: 4px; }
  .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="header">
  <div class="company">
    <h1>${comp.name}</h1>
    ${comp.email ? `<p>${comp.email}</p>` : ""}
    ${comp.phone ? `<p>${comp.phone}</p>` : ""}
    ${comp.address ? `<p>${comp.address}</p>` : ""}
  </div>
  <div class="invoice-meta">
    <h2>INVOICE</h2>
    <p><strong>${inv.invoiceNumber}</strong></p>
    <p>Date: ${inv.invoiceDate}</p>
    ${inv.dueDate ? `<p>Due: ${inv.dueDate}</p>` : ""}
    <p style="margin-top:8px; padding: 4px 10px; background: #dbeafe; color: #1d4ed8; border-radius: 4px; font-size:12px; display:inline-block">${inv.status}</p>
  </div>
</div>
<div class="parties">
  <div class="party">
    <h3>Bill From</h3>
    <p><strong>${comp.name}</strong></p>
    ${comp.address ? `<p>${comp.address}</p>` : ""}
    ${comp.email ? `<p>${comp.email}</p>` : ""}
  </div>
  <div class="party">
    <h3>Bill To</h3>
    <p><strong>${cust.name}</strong></p>
    ${cust.email ? `<p>${cust.email}</p>` : ""}
    ${cust.phone ? `<p>${cust.phone}</p>` : ""}
    ${cust.address ? `<p>${cust.address}</p>` : ""}
  </div>
</div>
<table>
  <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Total</th></tr></thead>
  <tbody>
    ${items.map((item: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.product || item.description || "Item"}</td>
        <td>${item.quantity || 1}</td>
        <td>$${(item.unitPrice || 0).toFixed(2)}</td>
        <td>${item.tax || 0}%</td>
        <td>$${(item.total || (item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}</td>
      </tr>`).join("")}
  </tbody>
</table>
<div class="totals">
  <div class="totals-box">
    <div class="totals-row"><span>Subtotal</span><span>$${inv.subtotal.toFixed(2)}</span></div>
    ${inv.discount > 0 ? `<div class="totals-row"><span>Discount</span><span>-$${inv.discount.toFixed(2)}</span></div>` : ""}
    ${inv.tax > 0 ? `<div class="totals-row"><span>Tax</span><span>$${inv.tax.toFixed(2)}</span></div>` : ""}
    <div class="totals-row grand"><span>Total</span><span>$${inv.total.toFixed(2)}</span></div>
  </div>
</div>
${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${inv.notes}</div>` : ""}
${inv.signature ? `
<div class="signature-section">
  <div class="sig-box">
    <img src="${inv.signature}" alt="Signature" />
    <p class="sig-label">Authorized Signature</p>
  </div>
</div>` : ""}
</body></html>`;

      const win = window.open("", "_blank");
      if (!win) { showToast("Popup blocked — please allow popups", "error"); return; }
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); }, 500);
      showToast("PDF opened for download/print");
    } catch { showToast("Failed to generate PDF", "error"); }
    finally { setDownloadingPdf(false); }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Invoice">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout title="Invoice">
        <div className="text-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-muted-foreground">Invoice not found</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/sales-invoice/invoices")}>
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const items = Array.isArray(invoice.items) ? invoice.items.filter((i: any) => i._type !== "meta") : [];

  return (
    <DashboardLayout title={`Invoice ${invoice.invoiceNumber}`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-5 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/sales-invoice/invoices")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
                <Badge className={`text-xs ${statusColors[invoice.status] || "bg-gray-100 text-gray-600"}`}>
                  {invoice.status}
                </Badge>
              </div>
              {invoice.generatedAt && (
                <p className="text-xs text-muted-foreground">Generated: {fmtDate(invoice.generatedAt)}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloadingPdf}>
              {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Download PDF
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              {generating ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        </div>

        {/* Invoice Details */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-semibold">{invoice.customerName}</p></div>
              <div><p className="text-xs text-muted-foreground">Invoice Date</p><p className="font-medium">{fmtDate(invoice.invoiceDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-medium">{fmtDate(invoice.dueDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Payment Terms</p><p className="font-medium">{invoice.paymentTerms || "—"}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Invoice Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Description</th>
                    <th className="text-center py-2.5 px-4 text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Unit Price</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">No items</td></tr>
                  ) : items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-4 font-medium">{item.product || item.description || "Item"}</td>
                      <td className="py-2.5 px-4 text-center">{item.quantity || 1}</td>
                      <td className="py-2.5 px-4 text-right">{fmt(item.unitPrice || 0)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">
                        {fmt(item.total || (item.quantity || 1) * (item.unitPrice || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end p-4 border-t border-border">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
                {invoice.discount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{fmt(invoice.discount)}</span></div>}
                {invoice.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{fmt(invoice.tax)}</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-1.5 mt-1"><span>Total</span><span className="text-primary">{fmt(invoice.total)}</span></div>
                {invoice.balance !== invoice.total && (
                  <div className="flex justify-between text-muted-foreground text-xs"><span>Balance Due</span><span>{fmt(invoice.balance)}</span></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Signature Pad */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PenTool className="h-4 w-4 text-primary" />
              Authorized Signature
            </CardTitle>
            <p className="text-xs text-muted-foreground">Draw your signature below to authorize this invoice</p>
          </CardHeader>
          <CardContent>
            <SignaturePad
              onSave={handleSaveSignature}
              onClear={handleClearSignature}
              existingSignature={invoice.signature}
              saving={savingSig}
            />
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="flex gap-3 pb-8">
          <Button variant="outline" className="flex-1" onClick={handleDownloadPdf} disabled={downloadingPdf}>
            {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
            Print / Download PDF
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            {generating ? "Generating..." : "Generate Invoice"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
