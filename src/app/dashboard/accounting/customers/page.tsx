"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Users, Pencil, Trash2, Eye,
  Loader2, AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight,
} from "lucide-react";

type Customer = {
  id: string;
  customerCode?: string;
  userId?: string | null;
  userName?: string | null;      // populated from API
  companyName?: string;
  name?: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  paymentTerms?: string | null;
  billingName?: string | null;
  billingAddress?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCountry?: string | null;
  billingZip?: string | null;
  shippingSameAsBilling?: boolean;
  notes?: string | null;
  creditLimit?: number | null;
  createdAt?: string;
};

const COUNTRIES = ["India","United States","United Kingdom","Canada","Australia","Germany","France","UAE","Singapore","Other"];
const PAYMENT_TERMS = ["Net 7","Net 15","Net 30","Net 45","Net 60","Due on Receipt","Custom"];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // View modal
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Edit modal
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    fetch("/api/sales/customers")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  // Filter
  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (c.companyName || c.name || "").toLowerCase();
    return (
      name.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.contactPerson?.toLowerCase().includes(q) ||
      c.customerCode?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/sales/customers/${deleteId}`, { method: "DELETE" });
      setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      showToast("Customer deleted successfully");
    } catch { showToast("Delete failed"); }
    finally { setDeleting(false); }
  };

  // Edit
  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setEditError("");
    setEditForm({
      companyName: c.companyName || c.name || "",
      contactPerson: c.contactPerson || "",
      email: c.email || "",
      phone: c.phone || "",
      taxNumber: c.taxNumber || "",
      paymentTerms: c.paymentTerms || "",
      billingName: c.billingName || "",
      billingAddress: c.billingAddress || "",
      billingCity: c.billingCity || "",
      billingState: c.billingState || "",
      billingCountry: c.billingCountry || "",
      billingZip: c.billingZip || "",
      notes: c.notes || "",
      creditLimit: c.creditLimit,
    });
  };

  const handleEditSave = async () => {
    if (!editCustomer) return;
    if (!editForm.companyName?.trim()) { setEditError("Company name is required"); return; }
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/sales/customers/${editCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, name: editForm.companyName }),
      });
      if (res.ok) {
        setCustomers((prev) => prev.map((c) =>
          c.id === editCustomer.id ? { ...c, ...editForm, name: editForm.companyName } : c
        ));
        setEditCustomer(null);
        showToast("Customer updated successfully");
      } else {
        const d = await res.json();
        setEditError(d.error || "Failed to update");
      }
    } catch { setEditError("Network error"); }
    finally { setEditSaving(false); }
  };

  const getName = (c: Customer) => c.companyName || c.name || "—";

  return (
    <DashboardLayout title="Customers">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Customers</h1>
            <p className="text-sm text-muted-foreground">{customers.length} total customers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCustomers}>Refresh</Button>
            <Button onClick={() => router.push("/dashboard/accounting/customers/create")}>
              <Plus className="h-4 w-4 mr-2" />Add Customer
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, code..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} results</span>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No customers found</p>
                <Button size="sm" className="mt-4" onClick={() => router.push("/dashboard/accounting/customers/create")}>
                  <Plus className="h-4 w-4 mr-1" />Add First Customer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Customer Code</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Company Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Contact Person</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tax Number</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginated.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">

                        {/* User */}
                        <td className="py-3 px-4">
                          {c.userName ? (
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0">
                                {c.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium">{c.userName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No User</span>
                          )}
                        </td>

                        {/* Customer Code */}
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                          {c.customerCode || "—"}
                        </td>

                        {/* Company Name */}
                        <td className="py-3 px-4 font-medium">{getName(c)}</td>

                        {/* Contact Person */}
                        <td className="py-3 px-4 text-muted-foreground">{c.contactPerson || "—"}</td>

                        {/* Email */}
                        <td className="py-3 px-4 text-muted-foreground">{c.email || "—"}</td>

                        {/* Tax Number */}
                        <td className="py-3 px-4">
                          {c.taxNumber ? (
                            <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{c.taxNumber}</span>
                          ) : "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* View */}
                            <Button
                              variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View"
                              onClick={() => setViewCustomer(c)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* Edit */}
                            <Button
                              variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              title="Edit"
                              onClick={() => openEdit(c)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {/* Delete */}
                            <Button
                              variant="ghost" size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete"
                              onClick={() => { setDeleteId(c.id); setDeleteName(getName(c)); }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 py-1">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ VIEW MODAL ═══ */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-background">
              <h3 className="font-semibold">Customer Details</h3>
              <button onClick={() => setViewCustomer(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">

              {/* Basic */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Customer Code</p><p className="font-mono font-medium">{viewCustomer.customerCode || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Company Name</p><p className="font-medium">{getName(viewCustomer)}</p></div>
                {viewCustomer.userName && (
                  <div><p className="text-xs text-muted-foreground">Linked User</p><p className="font-medium">{viewCustomer.userName}</p></div>
                )}
                <div><p className="text-xs text-muted-foreground">Contact Person</p><p>{viewCustomer.contactPerson || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p>{viewCustomer.email || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewCustomer.phone || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Tax Number</p><p className="font-mono">{viewCustomer.taxNumber || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment Terms</p><p>{viewCustomer.paymentTerms || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Credit Limit</p><p>{viewCustomer.creditLimit ? `$${viewCustomer.creditLimit}` : "Unlimited"}</p></div>
              </div>

              {/* Billing */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Billing Address</p>
                <div className="text-sm space-y-0.5">
                  <p className="font-medium">{viewCustomer.billingName || "—"}</p>
                  {viewCustomer.billingAddress && <p>{viewCustomer.billingAddress}</p>}
                  {(viewCustomer.billingCity || viewCustomer.billingState) && (
                    <p>{[viewCustomer.billingCity, viewCustomer.billingState].filter(Boolean).join(", ")}</p>
                  )}
                  {(viewCustomer.billingCountry || viewCustomer.billingZip) && (
                    <p>{[viewCustomer.billingCountry, viewCustomer.billingZip].filter(Boolean).join(" - ")}</p>
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</p>
                {viewCustomer.shippingSameAsBilling ? (
                  <p className="text-sm text-muted-foreground">Same as billing address</p>
                ) : (
                  <p className="text-sm">Custom shipping address</p>
                )}
              </div>

              {viewCustomer.notes && (
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm">{viewCustomer.notes}</p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setViewCustomer(null)}>Close</Button>
              <Button className="flex-1" onClick={() => { setViewCustomer(null); openEdit(viewCustomer); }}>
                <Pencil className="h-4 w-4 mr-2" />Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-background">
              <h3 className="font-semibold">Edit Customer</h3>
              <button onClick={() => setEditCustomer(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              {editError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{editError}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Company Name <span className="text-destructive">*</span></label>
                  <Input value={editForm.companyName || ""} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contact Person</label>
                  <Input value={editForm.contactPerson || ""} onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={editForm.phone || ""} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tax Number</label>
                  <Input value={editForm.taxNumber || ""} onChange={(e) => setEditForm({ ...editForm, taxNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Payment Terms</label>
                  <select value={editForm.paymentTerms || ""} onChange={(e) => setEditForm({ ...editForm, paymentTerms: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select</option>
                    {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Billing */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Billing Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Billing Name</label>
                    <Input value={editForm.billingName || ""} onChange={(e) => setEditForm({ ...editForm, billingName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input value={editForm.billingAddress || ""} onChange={(e) => setEditForm({ ...editForm, billingAddress: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">City</label>
                    <Input value={editForm.billingCity || ""} onChange={(e) => setEditForm({ ...editForm, billingCity: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">State</label>
                    <Input value={editForm.billingState || ""} onChange={(e) => setEditForm({ ...editForm, billingState: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Country</label>
                    <select value={editForm.billingCountry || ""} onChange={(e) => setEditForm({ ...editForm, billingCountry: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Zip Code</label>
                    <Input value={editForm.billingZip || ""} onChange={(e) => setEditForm({ ...editForm, billingZip: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Notes & Credit */}
              <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Credit Limit ($)</label>
                  <Input type="number" min={0} placeholder="0 = unlimited"
                    value={editForm.creditLimit ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditCustomer(null)} disabled={editSaving}>Cancel</Button>
              <Button className="flex-1" onClick={handleEditSave} disabled={editSaving}>
                {editSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE CONFIRM ═══ */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Customer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to delete <strong>{deleteName}</strong>?
                <br />Existing invoices won't be affected.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
