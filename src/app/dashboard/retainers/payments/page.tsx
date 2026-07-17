"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Payment {
  id: string;
  number: string;
  retainer: string;
  customer: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Completed: "success",
  Pending: "warning",
  Failed: "destructive",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function RetainerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetch('/api/retainers/payments')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch payments');
        }
        return res.json();
      })
      .then(data => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setPayments(data);
        } else {
          console.error('API did not return an array:', data);
          setPayments([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching payments:', error);
        setPayments([]);
      });
  }, []);
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    // Ensure payments is an array before filtering
    if (!Array.isArray(payments)) {
      return [];
    }
    
    const q = search.toLowerCase();
    return payments.filter((p) =>
      p.number.toLowerCase().includes(q) ||
      p.retainer.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q)
    );
  }, [payments, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout title="Retainer Payments">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Retainer Payments</h1>
            <p className="text-sm text-muted-foreground">Track payments received against retainer agreements</p>
          </div>
          <Link href="/dashboard/retainers/payments/create" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-2" />Create Retainer Payment
          </Link>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search payments..." className="pl-9"
            value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Payment #</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Retainer</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Customer</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Amount</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Date</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Method</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Status</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No payments found</td></tr>
                  ) : (
                    paginated.map((p, idx) => (
                      <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                        <td className="p-3 font-medium">{p.number}</td>
                        <td className="p-3 text-muted-foreground">{p.retainer}</td>
                        <td className="p-3">{p.customer}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                        <td className="p-3">{p.date}</td>
                        <td className="p-3">{p.method}</td>
                        <td className="p-3 text-center">
                          <Badge variant={statusColors[p.status] || "outline"}>{p.status}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[140px]">
                              <DropdownMenuItem onClick={() => setViewPayment(p)}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(p.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{itemsPerPage} per page</span>
            <select className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
              value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-muted-foreground ml-2">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewPayment(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewPayment(null)}><Edit2 className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Payment #</span><p className="font-medium">{viewPayment.number}</p></div>
                <div><span className="text-muted-foreground">Retainer</span><p>{viewPayment.retainer}</p></div>
                <div><span className="text-muted-foreground">Customer</span><p>{viewPayment.customer}</p></div>
                <div><span className="text-muted-foreground">Amount</span><p className="font-bold">{formatCurrency(viewPayment.amount)}</p></div>
                <div><span className="text-muted-foreground">Date</span><p>{viewPayment.date}</p></div>
                <div><span className="text-muted-foreground">Method</span><p>{viewPayment.method}</p></div>
                <div><span className="text-muted-foreground">Status</span><p><Badge variant={statusColors[viewPayment.status] || "outline"}>{viewPayment.status}</Badge></p></div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <Button variant="outline" onClick={() => setViewPayment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <p className="text-sm text-muted-foreground mt-1">Are you sure you want to delete this payment?</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { try { await fetch(`/api/retainers/payments/${deleteId}`, { method: 'DELETE' }); setPayments((prev) => prev.filter((p) => p.id !== deleteId)); } catch {} setDeleteId(null); }}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}