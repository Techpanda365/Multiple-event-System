// app/dashboard/sales-invoice/invoices/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Mail,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  PenTool,
  FileDown,
  RefreshCw,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  balance: number;
  status: string;
}

const statusColors = {
  paid: "text-green-700 bg-green-50 border-green-200",
  unpaid: "text-yellow-700 bg-yellow-50 border-yellow-200",
  overdue: "text-red-700 bg-red-50 border-red-200",
  draft: "text-gray-700 bg-gray-50 border-gray-200",
  partial: "text-blue-700 bg-blue-50 border-blue-200",
};

const statusIcons = {
  paid: CheckCircle,
  unpaid: Clock,
  overdue: AlertCircle,
  draft: FileText,
  partial: AlertCircle,
};

export default function SalesInvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/sales/invoices");
        if (res.ok) {
          const data = await res.json();
          setInvoices(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const stats = useMemo(() => {
    const totalRev = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdue = invoices.filter((inv) => inv.status === "Overdue");
    const unpaid = invoices.filter(
      (inv) => inv.status === "Sent" || inv.status === "Posted",
    );
    const paid = invoices.filter((inv) => inv.status === "Paid");
    const draft = invoices.filter((inv) => inv.status === "Draft");

    return {
      outstanding: {
        amount: unpaid.reduce((sum, inv) => sum + inv.balance, 0),
        count: unpaid.length,
      },
      overdue: {
        amount: overdue.reduce((sum, inv) => sum + inv.balance, 0),
        count: overdue.length,
      },
      collected: {
        amount: paid.reduce((sum, inv) => sum + inv.total, 0),
        count: paid.length,
      },
      drafted: {
        amount: draft.reduce((sum, inv) => sum + inv.total, 0),
        count: draft.length,
      },
      total: totalRev,
    };
  }, [invoices]);

  // Filter and Search
  const filtered = useMemo(() => {
    let result = [...invoices];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q),
      );
    }

    return result;
  }, [search, invoices]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    try {
      const res = await fetch(`/api/sales/invoices/${id}/generate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setInvoices(prev => prev.map(inv =>
          inv.id === id
            ? { ...inv, status: data.invoice.status }
            : inv
        ));
        showToast(`Invoice generated! Status: ${data.invoice.status}`);
      } else {
        showToast(data.error || "Failed to generate", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const res = await fetch(`/api/sales/invoices/${id}/pdf`);
      if (!res.ok) { showToast("Failed to load PDF data", "error"); return; }
      const data = await res.json();
      const inv = data.invoice;
      const cust = data.customer;
      const comp = data.company;

      const items = Array.isArray(inv.items)
        ? inv.items.filter((i: { _type?: string }) => i._type !== "meta")
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
    ${cust.city ? `<p>${cust.city}</p>` : ""}
  </div>
</div>
${inv.notes ? `<div class="notes"><strong>Notes:</strong> ${inv.notes}</div>` : ""}
<table>
  <thead><tr><th>#</th><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>
    ${items.map((item: { product?: string; description?: string; quantity: number; unitPrice: number }, i: number) => `<tr><td>${i + 1}</td><td>${item.product || item.description || "—"}</td><td style="text-align:right">${item.quantity}</td><td style="text-align:right">$${Number(item.unitPrice).toFixed(2)}</td><td style="text-align:right">$${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</td></tr>`).join("")}
  </tbody>
</table>
<div class="totals">
  <div class="totals-box">
    <div class="totals-row"><span>Subtotal</span><span>$${inv.subtotal.toFixed(2)}</span></div>
    ${inv.discount ? `<div class="totals-row"><span>Discount</span><span>—$${inv.discount.toFixed(2)}</span></div>` : ""}
    ${inv.tax ? `<div class="totals-row"><span>Tax</span><span>$${inv.tax.toFixed(2)}</span></div>` : ""}
    <div class="totals-row grand"><span>Total</span><span>$${inv.total.toFixed(2)}</span></div>
  </div>
</div>
${inv.signature ? `<div class="signature-section"><div class="sig-box"><img src="${inv.signature}" alt="Signature" /><div class="sig-label">Authorized Signature</div></div></div>` : ""}
<script>
(window.print || window.printHelper)();
setTimeout(() => window.close(), 1000);
</script>
</body></html>`;

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch {
      showToast("Failed to generate PDF", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const response = await fetch(`/api/sales/invoices/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  return (
    <DashboardLayout title="Manage Sales Invoices">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manage Sales Invoices
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all sales invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              className="gap-2"
              onClick={() =>
                router.push("/dashboard/sales-invoice/invoices/create")
              }
            >
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold">
                    ${stats.outstanding.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.outstanding.count} invoices
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">
                    ${stats.overdue.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.overdue.count} invoices
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-2xl font-bold">
                    ${stats.collected.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.collected.count} paid in full
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafted</p>
                  <p className="text-2xl font-bold">
                    ${stats.drafted.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.drafted.count} not yet sent
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <select
            className="h-9 px-3 rounded-lg border bg-background text-sm"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">
                      Invoice Number
                    </th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">
                      Customer
                    </th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">
                      Invoice Date
                    </th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">
                      Due Date
                    </th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">
                      Total Amount
                    </th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">
                      Balance
                    </th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Loading invoices...
                        </p>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          No invoices found
                        </p>
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() =>
                            router.push(
                              "/dashboard/sales-invoice/invoices/create",
                            )
                          }
                        >
                          Create your first invoice
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((invoice) => {
                      const s =
                        invoice.status.toLowerCase() as keyof typeof statusIcons;
                      const StatusIcon = statusIcons[s] || FileText;
                      return (
                        <tr
                          key={invoice.id}
                          className="border-b border-border hover:bg-muted/5"
                        >
                          <td className="p-3 font-mono text-xs font-medium">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="p-3">
                            <div className="font-medium">
                              {invoice.customerName}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            ${invoice.total.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            ${invoice.balance.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[s] || statusColors.draft}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {invoice.status.charAt(0).toUpperCase() +
                                invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales-invoice/invoices/${invoice.id}`,
                                  )
                                }
                                title="View Invoice"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-purple-500"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales-invoice/invoices/${invoice.id}`,
                                  )
                                }
                                title="Add Signature"
                              >
                                <PenTool className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-orange-500"
                                onClick={() => handleDownloadPdf(invoice.id)}
                                title="Download PDF"
                              >
                                <FileDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-cyan-500"
                                onClick={() => handleGenerate(invoice.id)}
                                disabled={generatingId === invoice.id}
                                title="Generate Invoice"
                              >
                                {generatingId === invoice.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-blue-500"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales-invoice/invoices/${invoice.id}/edit`,
                                  )
                                }
                                title="Edit Invoice"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-green-500"
                                onClick={() =>
                                  window.open(
                                    `mailto:?subject=Invoice ${invoice.invoiceNumber}`,
                                    "_blank",
                                  )
                                }
                                title="Send via Email"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500"
                                onClick={() => handleDelete(invoice.id)}
                                title="Delete Invoice"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * perPage + 1} to{" "}
              {Math.min(currentPage * perPage, filtered.length)} of{" "}
              {filtered.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 text-xs"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-sm text-muted-foreground">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 text-xs"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
