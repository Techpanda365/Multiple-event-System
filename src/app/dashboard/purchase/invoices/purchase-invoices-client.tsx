"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Trash2,
  Loader2,
  Eye,
  Edit,
  FileText,
  Copy,
  CheckCircle,
} from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "text-gray-700 bg-gray-100",
  paid: "text-green-700 bg-green-100",
  partially_paid: "text-blue-700 bg-blue-100",
  overdue: "text-red-700 bg-red-100",
  cancelled: "text-gray-500 bg-gray-200",
};

type PurchaseInvoice = {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string | null;
  warehouseName: string | null;
  items: unknown[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  balance: number;
  status: string;
};

export function PurchaseInvoicesClient() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/purchase/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]); // eslint-disable-line react-hooks/set-state-in-effect

  const filtered = useMemo(() => {
    let f = invoices;
    const q = search.toLowerCase();
    if (q) f = f.filter((inv) => inv.invoiceNumber.toLowerCase().includes(q) || inv.vendorName.toLowerCase().includes(q));
    return f;
  }, [invoices, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);

  const handleMarkPaid = async (inv: PurchaseInvoice) => {
    setUpdatingId(inv.id);
    try {
      const res = await fetch(`/api/purchase/invoices/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" }),
      });
      if (res.ok) fetchInvoices();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDuplicate = async (inv: PurchaseInvoice) => {
    try {
      await fetch("/api/purchase/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: inv.vendorId || "",
          vendorName: inv.vendorName,
          invoiceDate: new Date().toISOString().slice(0, 10),
          dueDate: inv.dueDate,
          warehouseId: inv.warehouseId || "",
          warehouseName: inv.warehouseName,
          paymentTerms: inv.paymentTerms,
          notes: inv.notes,
          items: inv.items,
          subtotal: inv.subtotal,
          discount: inv.discount,
          tax: inv.tax,
          total: inv.total,
          status: "Draft",
        }),
      });
      fetchInvoices();
    } catch { /* ignore */ }
  };

  return (
    <DashboardLayout title="Purchase Invoices">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Purchase Invoices</h1>
          </div>
          <Link href="/dashboard/purchase/invoices/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by invoice number..." className="pl-9" value={search}
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Invoice</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Vendor</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Warehouse</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Balance</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No invoices found</td></tr>
                    ) : (
                      paginated.map((inv, index) => {
                        const sk = (inv.status || "draft").toLowerCase().replace(/\s+/g, "_");
                        return (
                          <tr key={inv.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                            <td className="p-3 md:p-4"><span className="font-medium text-sm">{inv.invoiceNumber}</span></td>
                            <td className="p-3 md:p-4"><span className="text-sm">{inv.vendorName}</span></td>
                            <td className="p-3 md:p-4"><span className="text-sm">{inv.warehouseName || "—"}</span></td>
                            <td className="p-3 md:p-4"><span className="text-sm">{new Date(inv.invoiceDate).toISOString().slice(0, 10)}</span></td>
                            <td className="p-3 md:p-4 text-right"><span className="text-sm font-medium">{formatCurrency(inv.total)}</span></td>
                            <td className="p-3 md:p-4 text-right"><span className={`text-sm ${inv.balance === 0 ? "text-green-600" : ""}`}>{formatCurrency(inv.balance)}</span></td>
                            <td className="p-3 md:p-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[sk] || "text-gray-700 bg-gray-100"}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Link href={`/dashboard/purchase/invoices/${inv.id}`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/purchase/invoices/${inv.id}/edit`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF"
                                  onClick={() => window.open(`/api/purchase/invoices/${inv.id}/pdf`, "_blank")}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {inv.status === "Draft" && (
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600" title="Mark as Paid"
                                    disabled={updatingId === inv.id}
                                    onClick={() => handleMarkPaid(inv)}>
                                    {updatingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Duplicate"
                                  onClick={() => handleDuplicate(inv)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Delete"
                                  onClick={() => setDeletingId(inv.id)}>
                                  <Trash2 className="h-4 w-4" />
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
            </div>
          </CardContent>
        </Card>

        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Invoice</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this purchase invoice?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await fetch(`/api/purchase/invoices/${deletingId}`, { method: "DELETE" });
                  fetchInvoices();
                  setDeletingId(null);
                }}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
