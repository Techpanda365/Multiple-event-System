// src/app/dashboard/sales/returns/returns-client.tsx - NAYA FILE
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Building2,
  Calendar,
} from "lucide-react";

type ReturnItem = {
  name: string;
  quantity: number;
};

type Return = {
  id: string;
  customer: string;
  warehouse: string;
  returnDate: string;
  totalAmount: number;
  items: ReturnItem[];
  status: string;
};

interface Props {
  returns: Return[];
}

const Select = ({ value, onValueChange, children }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </select>
  );
};

const statusColors: Record<string, string> = {
  Completed: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Approved: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Pending: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Rejected: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export function ReturnsClient({ returns: initialReturns }: Props) {
  const [returns, setReturns] = useState(initialReturns);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingReturn, setViewingReturn] = useState<Return | null>(null);
  const [editingReturn, setEditingReturn] = useState<Return | null>(null);
  const [editForm, setEditForm] = useState<Partial<Return>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredReturns = useMemo(() => {
    let filtered = returns;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (ret) => ret.id.toLowerCase().includes(q) || ret.customer.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((ret) => ret.status === statusFilter);
    }
    return filtered;
  }, [initialReturns, search, statusFilter]);

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => setCurrentPage(1);

  return (
    <DashboardLayout title="Sales Returns">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Sales Returns</h1>
          </div>
          <Link href="/dashboard/sales/returns/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Return
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by return number..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => { setStatusFilter(value); handleFilterChange(); }}>
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </Select>
            <div className="text-sm text-muted-foreground">{itemsPerPage} per page</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Return Number</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Warehouse</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Return Date</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total Amount</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Items</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReturns.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No returns found</td></tr>
                    ) : (
                      paginatedReturns.map((ret, index) => (
                        <tr key={ret.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{ret.id}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm font-medium">{ret.customer}</span></td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{ret.warehouse}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{ret.returnDate}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 text-right"><span className="text-sm font-medium">{formatCurrency(ret.totalAmount)}</span></td>
                          <td className="p-3 md:p-4">
                            <div className="flex flex-col gap-0.5">
                              {ret.items.map((item, idx) => (
                                <span key={idx} className="text-sm whitespace-nowrap">
                                  {item.name} <span className="text-muted-foreground">×{item.quantity}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[ret.status] || "bg-gray-500/10 text-gray-700"}>{ret.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewingReturn(ret)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingReturn(ret); setEditForm({ ...ret }); }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(ret.id)}><Trash2 className="h-4 w-4" /></Button>
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

        {/* View Modal */}
        {viewingReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingReturn(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Return Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setViewingReturn(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground">Return Number</span><p className="font-medium">{viewingReturn.id}</p></div>
                  <div><span className="text-xs text-muted-foreground">Customer</span><p className="font-medium">{viewingReturn.customer}</p></div>
                  <div><span className="text-xs text-muted-foreground">Warehouse</span><p>{viewingReturn.warehouse}</p></div>
                  <div><span className="text-xs text-muted-foreground">Return Date</span><p>{viewingReturn.returnDate}</p></div>
                  <div><span className="text-xs text-muted-foreground">Total Amount</span><p className="font-medium">{formatCurrency(viewingReturn.totalAmount)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p>{viewingReturn.status}</p></div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Items</span>
                  <div className="mt-1 space-y-1">
                    {viewingReturn.items.map((item, idx) => (
                      <div key={idx} className="text-sm flex justify-between bg-muted/30 px-3 py-1.5 rounded">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t">
                <Button variant="outline" onClick={() => setViewingReturn(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingReturn(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Edit Return</h2>
                <Button variant="ghost" size="sm" onClick={() => setEditingReturn(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Customer</label>
                    <Input value={editForm.customer || ""} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Warehouse</label>
                    <Input value={editForm.warehouse || ""} onChange={(e) => setEditForm({ ...editForm, warehouse: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Return Date</label>
                    <Input type="date" value={editForm.returnDate || ""} onChange={(e) => setEditForm({ ...editForm, returnDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <select value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="outline" onClick={() => setEditingReturn(null)}>Cancel</Button>
                <Button onClick={() => {
                  setReturns((prev) => prev.map((r) => r.id === editingReturn.id ? { ...r, ...editForm } as Return : r));
                  setEditingReturn(null);
                }}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Return</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this return? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  setReturns((prev) => prev.filter((r) => r.id !== deletingId));
                  setDeletingId(null);
                }}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReturns.length)} of {filteredReturns.length} entries
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