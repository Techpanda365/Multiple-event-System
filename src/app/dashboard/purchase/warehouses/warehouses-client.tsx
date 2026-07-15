"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
  Building2,
  Phone,
  Loader2,
} from "lucide-react";

type Warehouse = {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  status: string;
};

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
  Active: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Inactive: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export function WarehousesClient() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingWarehouse, setViewingWarehouse] = useState<Warehouse | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editForm, setEditForm] = useState<Partial<Warehouse>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await fetch("/api/purchase/warehouses");
      if (res.ok) {
        const data = await res.json();
        setWarehouses(Array.isArray(data) ? data.map((w: any) => ({ ...w, status: w.isActive === false ? "Inactive" : "Active" })) : []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const filtered = useMemo(() => {
    let f = warehouses;
    const q = search.toLowerCase();
    if (q) f = f.filter((w) => w.name.toLowerCase().includes(q) || w.city.toLowerCase().includes(q) || w.address.toLowerCase().includes(q));
    if (statusFilter !== "all") f = f.filter((w) => w.status === statusFilter);
    return f;
  }, [warehouses, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <DashboardLayout title="Warehouses">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Warehouses</h1>
          </div>
          <Link href="/dashboard/purchase/warehouses/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search warehouses..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => { setStatusFilter(value); setCurrentPage(1); }}>
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Address</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">City</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Zip Code</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No warehouses found</td></tr>
                    ) : (
                      paginated.map((w, index) => (
                        <tr key={w.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{w.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{w.address}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{w.city}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{w.zipCode}</span></td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{w.phone}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[w.status] || "bg-gray-500/10 text-gray-700"}>{w.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewingWarehouse(w)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingWarehouse(w); setEditForm({ ...w }); }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(w.id)}><Trash2 className="h-4 w-4" /></Button>
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
        {viewingWarehouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingWarehouse(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Warehouse Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setViewingWarehouse(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground">Name</span><p className="font-medium">{viewingWarehouse.name}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p>{viewingWarehouse.status}</p></div>
                  <div className="col-span-2"><span className="text-xs text-muted-foreground">Address</span><p>{viewingWarehouse.address}</p></div>
                  <div><span className="text-xs text-muted-foreground">City</span><p>{viewingWarehouse.city}</p></div>
                  <div><span className="text-xs text-muted-foreground">Zip Code</span><p>{viewingWarehouse.zipCode}</p></div>
                  <div><span className="text-xs text-muted-foreground">Phone</span><p>{viewingWarehouse.phone}</p></div>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t">
                <Button variant="outline" onClick={() => setViewingWarehouse(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingWarehouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingWarehouse(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Edit Warehouse</h2>
                <Button variant="ghost" size="sm" onClick={() => setEditingWarehouse(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <select value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Address</label>
                    <Input value={editForm.address || ""} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">City</label>
                    <Input value={editForm.city || ""} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Zip Code</label>
                    <Input value={editForm.zipCode || ""} onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Phone</label>
                    <Input value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="outline" onClick={() => setEditingWarehouse(null)}>Cancel</Button>
                <Button onClick={async () => {
                  await fetch(`/api/purchase/warehouses/${editingWarehouse.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm),
                  });
                  fetchWarehouses();
                  setEditingWarehouse(null);
                }}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Warehouse</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this warehouse? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await fetch(`/api/purchase/warehouses/${deletingId}`, { method: "DELETE" });
                  fetchWarehouses();
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
