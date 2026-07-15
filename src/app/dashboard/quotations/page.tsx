"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Loader2, Clock, CheckCircle, XCircle, FileText, Download, Send, Copy, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Quotation {
  id: string;
  number: string;
  customerName: string;
  proposalDate: string;
  dueDate: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

const statusColors: Record<string, string> = {
  draft: "text-gray-700 bg-gray-100 border-gray-200",
  sent: "text-blue-700 bg-blue-100 border-blue-200",
  accepted: "text-green-700 bg-green-100 border-green-200",
  rejected: "text-red-700 bg-red-100 border-red-200",
  expired: "text-yellow-700 bg-yellow-100 border-yellow-200",
};

const statusIcons: Record<string, any> = {
  draft: FileText,
  sent: Clock,
  accepted: CheckCircle,
  rejected: XCircle,
  expired: Clock,
};

export default function QuotationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setQuotations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? quotations.filter(
        (q) =>
          q.number.toLowerCase().includes(search.toLowerCase()) ||
          q.customerName.toLowerCase().includes(search.toLowerCase())
      )
    : quotations;

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      if (res.ok) setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleMarkSent = async (id: string) => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Sent" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setQuotations((prev) => prev.map((q) => (q.id === id ? updated : q)));
      }
    } catch (e) {
      console.error("Failed to mark sent", e);
    }
  };

  const handleDuplicate = async (q: Quotation) => {
    try {
      const res = await fetch(`/api/quotations/${q.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const dupRes = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          warehouse: data.warehouse,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          items: data.items || [],
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          total: data.total,
          status: "Draft",
        }),
      });
      if (dupRes.ok) {
        const dup = await dupRes.json();
        setQuotations((prev) => [dup, ...prev]);
      }
    } catch (e) {
      console.error("Duplicate failed", e);
    }
  };

  const handleDownloadPdf = (id: string) => {
    window.open(`/dashboard/quotations/${id}?print=1`, "_blank");
  };

  return (
    <DashboardLayout title="Quotations">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
            <p className="text-sm text-muted-foreground">Create and manage customer quotations</p>
          </div>
          <Link href="/dashboard/quotations/create" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-2" /> Create Quotation
          </Link>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Quotation Number</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Customer</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Quotation Date</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Due Date</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Subtotal</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Tax</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total Amount</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Status</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No quotations found</p>
                        <p className="text-xs mt-1">Click Create Quotation to add your first quotation</p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((q) => {
                      const sk = (q.status || "draft").toLowerCase();
                      const Icon = statusIcons[sk] || FileText;
                      return (
                        <tr key={q.id} className="border-b border-border hover:bg-muted/5">
                          <td className="p-3 font-mono text-xs font-medium">{q.number}</td>
                          <td className="p-3">{q.customerName}</td>
                          <td className="p-3">{q.proposalDate ? new Date(q.proposalDate).toLocaleDateString() : "-"}</td>
                          <td className="p-3">{q.dueDate ? new Date(q.dueDate).toLocaleDateString() : "-"}</td>
                          <td className="p-3 text-right">${(q.subtotal || 0).toLocaleString()}</td>
                          <td className="p-3 text-right">${(q.tax || 0).toLocaleString()}</td>
                          <td className="p-3 text-right font-semibold">${(q.total || 0).toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                                statusColors[sk] || "text-gray-700 bg-gray-100 border-gray-200"
                              }`}
                            >
                              <Icon className="h-3 w-3" />
                              {sk.charAt(0).toUpperCase() + sk.slice(1)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download PDF"
                                onClick={() => handleDownloadPdf(q.id)}>
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              {sk === "draft" && (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" title="Mark as Sent"
                                  onClick={() => handleMarkSent(q.id)}>
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Duplicate"
                                onClick={() => handleDuplicate(q)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View"
                                onClick={() => router.push(`/dashboard/quotations/${q.id}`)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" title="Edit"
                                onClick={() => router.push(`/dashboard/quotations/${q.id}/edit`)}>
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" title="Delete"
                                onClick={() => handleDelete(q.id)}>
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

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
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
                let pn = i + 1;
                if (totalPages > 5 && currentPage > 3) pn = currentPage - 2 + i;
                if (totalPages > 5 && currentPage > totalPages - 2) pn = totalPages - 4 + i;
                return (
                  <Button
                    key={pn}
                    variant={pn === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 text-xs"
                    onClick={() => setCurrentPage(pn)}
                  >
                    {pn}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
