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
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

type Vendor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  paymentTerms: string | null;
  taxId: string | null;
  isActive: boolean;
};

export function VendorsClient() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "",
    paymentTerms: "", taxId: "", isActive: true,
  });

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch("/api/purchase/vendors");
      if (res.ok) setVendors(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const filtered = useMemo(() => {
    let f = vendors;
    const q = search.toLowerCase();
    if (q) f = f.filter((v) => v.name.toLowerCase().includes(q) || (v.email && v.email.toLowerCase().includes(q)));
    return f;
  }, [vendors, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetForm = () => setFormData({ name: "", email: "", phone: "", address: "", city: "", country: "", paymentTerms: "", taxId: "", isActive: true });

  const openCreate = () => { resetForm(); setEditingVendor(null); setShowForm(true); setError(""); };

  const openEdit = (v: Vendor) => {
    setFormData({
      name: v.name, email: v.email || "", phone: v.phone || "", address: v.address || "",
      city: v.city || "", country: v.country || "", paymentTerms: v.paymentTerms || "",
      taxId: v.taxId || "", isActive: v.isActive,
    });
    setEditingVendor(v);
    setShowForm(true);
    setError("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError("Vendor name is required"); return; }
    setSaving(true); setError("");

    try {
      const url = editingVendor
        ? `/api/purchase/vendors/${editingVendor.id}`
        : "/api/purchase/vendors";
      const method = editingVendor ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save vendor"); return; }

      setShowForm(false);
      setEditingVendor(null);
      fetchVendors();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Vendors">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Vendors</h1>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Vendor
          </Button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search vendors..." className="pl-9" value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">City</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Payment Terms</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No vendors found</td></tr>
                    ) : (
                      paginated.map((v, index) => (
                        <tr key={v.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4"><span className="font-medium text-sm">{v.name}</span></td>
                          <td className="p-3 md:p-4 text-sm">{v.email || "—"}</td>
                          <td className="p-3 md:p-4 text-sm">{v.phone || "—"}</td>
                          <td className="p-3 md:p-4 text-sm">{v.city || "—"}</td>
                          <td className="p-3 md:p-4 text-sm">{v.paymentTerms || "—"}</td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(v)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(v.id)}>
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

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{editingVendor ? "Edit Vendor" : "Create Vendor"}</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Vendor name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone</label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 890" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Address</label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">City</label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Country</label>
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="Country" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Payment Terms</label>
                    <Input value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} placeholder="e.g. Net 30" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Tax ID</label>
                    <Input value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} placeholder="Tax ID" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border" />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingVendor ? "Update Vendor" : "Create Vendor"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Vendor</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this vendor?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await fetch(`/api/purchase/vendors/${deletingId}`, { method: "DELETE" });
                  fetchVendors();
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
