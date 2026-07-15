"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronLeft, ChevronRight, Plus, Eye, Edit2, Trash2,
  Filter, Send, Download, Copy, MoreHorizontal, X, Check, Loader2,
} from "lucide-react";
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

interface Retainer {
  id: string;
  retainerNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  cycleType: string;
  startDate: string;
  nextBillingDate: string;
  description: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Draft: "secondary",
  Sent: "default",
  Active: "success",
  Completed: "success",
  Cancelled: "destructive",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function RetainersListPage() {
  const [retainers, setRetainers] = useState<Retainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [viewRetainer, setViewRetainer] = useState<Retainer | null>(null);
  const [editRetainer, setEditRetainer] = useState<Retainer | null>(null);
  const [editForm, setEditForm] = useState({ clientName: "", startDate: "", nextBillingDate: "", status: "", amount: "", cycleType: "" });
  const [deleteRetainerId, setDeleteRetainerId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = useCallback((message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const fetchRetainers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.set("status", selectedStatus);
      const res = await fetch(`/api/retainers?${params}`);
      const data = await res.json();
      setRetainers(Array.isArray(data) ? data : []);
    } catch {
      setRetainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRetainers(); }, [selectedStatus]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return retainers.filter((r) =>
      r.retainerNumber.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q)
    );
  }, [retainers, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/retainers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setRetainers((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
      showToast(`Retainer marked as ${status}`);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const duplicateRetainer = async (r: Retainer) => {
    try {
      const res = await fetch("/api/retainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: r.clientName,
          clientEmail: r.clientEmail,
          amount: r.amount,
          cycleType: r.cycleType,
          startDate: r.startDate,
          description: r.description,
        }),
      });
      if (res.ok) {
        await fetchRetainers();
        showToast("Retainer duplicated");
      }
    } catch {
      showToast("Failed to duplicate", "error");
    }
  };

  function openEdit(retainer: Retainer) {
    setEditRetainer(retainer);
    setEditForm({
      clientName: retainer.clientName,
      startDate: retainer.startDate?.slice(0, 10) || "",
      nextBillingDate: retainer.nextBillingDate?.slice(0, 10) || "",
      status: retainer.status,
      amount: String(retainer.amount),
      cycleType: retainer.cycleType,
    });
  }

  async function saveEdit() {
    if (!editRetainer) return;
    try {
      await fetch(`/api/retainers/${editRetainer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: editForm.clientName,
          startDate: editForm.startDate,
          nextBillingDate: editForm.nextBillingDate,
          status: editForm.status,
          amount: Number(editForm.amount),
          cycleType: editForm.cycleType,
        }),
      });
      await fetchRetainers();
      showToast("Retainer updated");
      setEditRetainer(null);
    } catch {
      showToast("Failed to update", "error");
    }
  }

  async function confirmDelete() {
    if (!deleteRetainerId) return;
    try {
      await fetch(`/api/retainers/${deleteRetainerId}`, { method: "DELETE" });
      await fetchRetainers();
      showToast("Retainer deleted");
      setDeleteRetainerId(null);
    } catch {
      showToast("Failed to delete", "error");
    }
  }

  return (
    <DashboardLayout title="Retainer">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-sm text-white ${
          toast.type === "success" ? "bg-green-600" : "bg-destructive"
        }`}>
          {toast.message}
        </div>
      )}
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Retainers</h1>
            <p className="text-sm text-muted-foreground">View and manage retainer agreements</p>
          </div>
          <Link href="/dashboard/retainers/create" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-2" />Create Retainer
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by retainer number or client..." className="pl-9"
              value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" /> Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 border rounded-lg bg-muted/10">
            <div>
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}>
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Retainer Number</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Client</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Cycle</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Amount</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Start Date</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Next Billing</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Status</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No retainers found</td></tr>
                  ) : (
                    paginated.map((r, idx) => (
                      <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                        <td className="p-3 font-medium">{r.retainerNumber}</td>
                        <td className="p-3">
                          <div>{r.clientName}</div>
                          <div className="text-xs text-muted-foreground">{r.clientEmail}</div>
                        </td>
                        <td className="p-3">{r.cycleType}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(r.amount)}</td>
                        <td className="p-3 text-muted-foreground">{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'}</td>
                        <td className="p-3 text-muted-foreground">{r.nextBillingDate ? new Date(r.nextBillingDate).toLocaleDateString() : '-'}</td>
                        <td className="p-3 text-center">
                          <Badge variant={statusColors[r.status] || "outline"}>{r.status}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[160px]">
                              <DropdownMenuItem onClick={() => setViewRetainer(r)}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(r)}>
                                <Edit2 className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {r.status === "Draft" && (
                                <DropdownMenuItem onClick={() => updateStatus(r.id, "Sent")}>
                                  <Send className="h-4 w-4 mr-2" /> Send
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => duplicateRetainer(r)}>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteRetainerId(r.id)}>
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
            <span className="text-sm text-muted-foreground order-2 sm:order-1 ml-2">
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
      {viewRetainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewRetainer(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Retainer Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewRetainer(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Retainer Number</span><p className="font-medium">{viewRetainer.retainerNumber}</p></div>
                <div><span className="text-muted-foreground">Client</span><p className="font-medium">{viewRetainer.clientName}</p></div>
                <div><span className="text-muted-foreground">Email</span><p>{viewRetainer.clientEmail}</p></div>
                <div><span className="text-muted-foreground">Amount</span><p className="font-bold">{formatCurrency(viewRetainer.amount)}</p></div>
                <div><span className="text-muted-foreground">Cycle</span><p>{viewRetainer.cycleType}</p></div>
                <div><span className="text-muted-foreground">Start Date</span><p>{viewRetainer.startDate ? new Date(viewRetainer.startDate).toLocaleDateString() : '-'}</p></div>
                <div><span className="text-muted-foreground">Next Billing</span><p>{viewRetainer.nextBillingDate ? new Date(viewRetainer.nextBillingDate).toLocaleDateString() : '-'}</p></div>
                <div><span className="text-muted-foreground">Status</span><p><Badge variant={statusColors[viewRetainer.status] || "outline"}>{viewRetainer.status}</Badge></p></div>
              </div>
              {viewRetainer.description && (
                <div><span className="text-muted-foreground">Description</span><p className="mt-1">{viewRetainer.description}</p></div>
              )}
            </div>
            <div className="flex justify-end p-4 border-t">
              <Button variant="outline" onClick={() => setViewRetainer(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRetainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditRetainer(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Retainer</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditRetainer(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3">
              <div><label className="text-xs text-muted-foreground">Retainer Number</label><p className="font-medium text-sm">{editRetainer.retainerNumber}</p></div>
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <Input value={editForm.clientName} onChange={(e) => setEditForm((f) => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={editForm.startDate} onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Next Billing Date</label>
                  <Input type="date" value={editForm.nextBillingDate} onChange={(e) => setEditForm((f) => ({ ...f, nextBillingDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Amount ($)</label>
                  <Input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Cycle</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.cycleType} onChange={(e) => setEditForm((f) => ({ ...f, cycleType: e.target.value }))}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setEditRetainer(null)}>Cancel</Button>
              <Button onClick={saveEdit}><Check className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteRetainerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteRetainerId(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <p className="text-sm text-muted-foreground mt-1">Are you sure you want to delete this retainer? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setDeleteRetainerId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
