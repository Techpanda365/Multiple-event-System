"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Filter, Plus, Eye, Edit, Trash2, Loader2, FileText, Copy, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-500/10 text-gray-700",
  Sent: "bg-blue-500/10 text-blue-700",
  Accepted: "bg-green-500/10 text-green-700",
  Rejected: "bg-red-500/10 text-red-700",
  Expired: "bg-yellow-500/10 text-yellow-700",
};

type SalesQuote = {
  id: string;
  quoteNumber: string;
  name: string | null;
  customerName: string;
  customerEmail: string | null;
  assignedUserName: string | null;
  quoteDate: string;
  total: number;
  status: string;
  items: { productId?: string; productName?: string; qty?: number; unitPrice?: number; discountPct?: number; tax?: string }[];
  billingAddress: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingCountry: string | null;
  billingPostalCode: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingCountry: string | null;
  shippingPostalCode: string | null;
  description: string | null;
  notes: string | null;
  customerId: string | null;
  opportunityId: string | null;
  opportunityName: string | null;
  accountId: string | null;
  accountName: string | null;
  assignedUserId: string | null;
  warehouseId: string | null;
  warehouseName: string | null;
  billingContactId: string | null;
  billingContactName: string | null;
  shippingContactId: string | null;
  shippingContactName: string | null;
  shippingProvider: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  quoteDate: string;
  expiryDate: string | null;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);

export default function SalesQuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<SalesQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/sales/quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotes(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    let f = quotes;
    const q = search.toLowerCase();
    if (q) f = f.filter((o) => o.quoteNumber.toLowerCase().includes(q) || (o.name || "").toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    return f;
  }, [quotes, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const downloadPDF = (quote: SalesQuote) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sales Quote", 14, 22);
    doc.setFontSize(10);
    doc.text(`Quote #: ${quote.quoteNumber}`, 14, 30);
    doc.text(`Date: ${new Date(quote.quoteDate).toLocaleDateString()}`, 14, 36);
    if (quote.expiryDate) doc.text(`Expiry: ${new Date(quote.expiryDate).toLocaleDateString()}`, 14, 42);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 46, 196, 46);
    const info = [
      ["Customer", quote.customerName],
      ["Assigned To", quote.assignedUserName || "—"],
      ["Status", quote.status],
    ];
    autoTable(doc, {
      startY: 50,
      head: [["Field", "Value"]],
      body: info,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    const afterInfo = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    const items = Array.isArray(quote.items) ? quote.items : [];
    const tableBody = items.map((i) => [
      i.productName || "—",
      String(i.qty || 0),
      formatCurrency(i.unitPrice || 0),
      `${i.discountPct || 0}%`,
      i.tax || "—",
      formatCurrency(((i.qty || 0) * (i.unitPrice || 0))),
    ]);
    autoTable(doc, {
      startY: afterInfo,
      head: [["Product", "Qty", "Unit Price", "Discount", "Tax", "Total"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
    const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(quote.subtotal || 0)}`, 140, afterTable);
    doc.text(`Discount: ${formatCurrency(quote.discount || 0)}`, 140, afterTable + 6);
    doc.text(`Tax: ${formatCurrency(quote.tax || 0)}`, 140, afterTable + 12);
    doc.setFontSize(11);
    doc.text(`Total: ${formatCurrency(quote.total)}`, 140, afterTable + 20);
    const footerY = afterTable + 30;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a system generated document.", 14, footerY);
    doc.save(`Quote_${quote.quoteNumber}.pdf`);
  };

  const handleDuplicate = async (quote: SalesQuote) => {
    setActionLoading(quote.id);
    try {
      const res = await fetch(`/api/sales/quotes/${quote.id}`);
      if (!res.ok) return;
      const full: SalesQuote = await res.json();
      await fetch("/api/sales/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...full,
          name: full.name ? `Copy of ${full.name}` : null,
          status: "Draft",
        }),
      });
      fetchQuotes();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertToOrder = async (quote: SalesQuote) => {
    setActionLoading(quote.id);
    try {
      const res = await fetch(`/api/sales/quotes/${quote.id}`);
      if (!res.ok) return;
      const full: SalesQuote = await res.json();
      const orderRes = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: full.name || `Order from ${full.quoteNumber}`,
          customerId: full.customerId,
          customerName: full.customerName,
          customerEmail: full.customerEmail,
          opportunityId: full.opportunityId,
          accountId: full.accountId,
          accountName: full.accountName,
          assignedUserId: full.assignedUserId,
          assignedUserName: full.assignedUserName,
          warehouseId: full.warehouseId,
          warehouseName: full.warehouseName,
          billingAddress: full.billingAddress,
          billingCity: full.billingCity,
          billingState: full.billingState,
          billingCountry: full.billingCountry,
          billingPostalCode: full.billingPostalCode,
          shippingSameAsBilling: full.shippingSameAsBilling,
          shippingAddress: full.shippingAddress,
          shippingCity: full.shippingCity,
          shippingState: full.shippingState,
          shippingCountry: full.shippingCountry,
          shippingPostalCode: full.shippingPostalCode,
          billingContactId: full.billingContactId,
          billingContactName: full.billingContactName,
          shippingContactId: full.shippingContactId,
          shippingContactName: full.shippingContactName,
          shippingProvider: full.shippingProvider,
          description: full.description,
          notes: full.notes,
          items: full.items,
          quoteId: full.id,
          quoteNumber: full.quoteNumber,
          status: "Draft",
        }),
      });
      if (orderRes.ok) {
        const order = await orderRes.json();
        router.push(`/dashboard/Sales/orders/${order.id}`);
      }
    } catch {
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Quotes</h1>
          </div>
          <Link href="/dashboard/Sales/quotes/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search quotes..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{itemsPerPage} per page</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Quote Number</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Quote Date</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No quotes found</td></tr>
                    ) : (
                      paginated.map((quote, index) => (
                        <tr key={quote.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4"><span className="font-medium text-sm">{quote.quoteNumber}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{quote.name || "—"}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{quote.customerName}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{quote.assignedUserName || "—"}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{new Date(quote.quoteDate).toLocaleDateString()}</span></td>
                          <td className="p-3 md:p-4 text-right"><span className="text-sm font-medium">{formatCurrency(quote.total)}</span></td>
                          <td className="p-3 md:p-4 text-center">
                            <Badge className={statusColors[quote.status] || "bg-gray-500/10 text-gray-700"}>{quote.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF"
                                onClick={() => downloadPDF(quote)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Duplicate"
                                onClick={() => handleDuplicate(quote)} disabled={actionLoading === quote.id}>
                                {actionLoading === quote.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Convert to Sale Order"
                                onClick={() => handleConvertToOrder(quote)} disabled={actionLoading === quote.id}>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              <Link href={`/dashboard/Sales/quotes/${quote.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View"><Eye className="h-4 w-4" /></Button>
                              </Link>
                              <Link href={`/dashboard/Sales/quotes/${quote.id}/edit`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit"><Edit className="h-4 w-4" /></Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Delete"
                                onClick={() => setDeletingId(quote.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Quote</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this quote?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await fetch(`/api/sales/quotes/${deletingId}`, { method: "DELETE" });
                  fetchQuotes();
                  setDeletingId(null);
                }}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} results
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
