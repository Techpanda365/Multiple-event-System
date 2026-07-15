// "use client";

// import { useMemo, useState } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Plus, Search, Pencil, Trash2 } from "lucide-react";
// import { formatCurrency, formatDate } from "@/lib/format";

// type Invoice = {
//   id: string;
//   number: string;
//   customerName: string;
//   customerEmail: string | null;
//   total: number;
//   status: string;
//   createdAt: string;
// };

// const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"] as const;
// const statusColors: Record<string, "success" | "default" | "destructive" | "secondary" | "warning"> = {
//   PAID: "success", SENT: "default", OVERDUE: "destructive", DRAFT: "secondary", PARTIALLY_PAID: "warning", CANCELLED: "secondary",
// };

// const emptyForm = { number: "", customerName: "", customerEmail: "", total: "", status: "DRAFT" };

// interface Props {
//   initialInvoices: Invoice[];
//   user?: { name?: string | null; image?: string | null; email?: string };
// }

// export function InvoicesClient({ initialInvoices, user }: Props) {
//   const [invoices, setInvoices] = useState(initialInvoices);
//   const [search, setSearch] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyForm);
//   const [loading, setLoading] = useState(false);

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase();
//     return invoices.filter((inv) => !q || inv.number.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q));
//   }, [invoices, search]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const total = Number(form.total) || 0;
//     const payload = { ...form, subtotal: total, total };
//     try {
//       const res = await fetch(editingId ? `/api/invoices/${editingId}` : "/api/invoices", {
//         method: editingId ? "PATCH" : "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       const mapped = { ...data, createdAt: data.createdAt };
//       if (editingId) setInvoices((prev) => prev.map((i) => (i.id === editingId ? mapped : i)));
//       else setInvoices((prev) => [mapped, ...prev]);
//       setShowForm(false);
//       setEditingId(null);
//       setForm(emptyForm);
//     } catch (err: unknown) {
//       alert(err instanceof Error ? err.message : "Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DashboardLayout user={user} title="Sales Invoices">
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-bold">Sales Invoices</h2>
//             <p className="text-muted-foreground">Manage sales invoices and payments</p>
//           </div>
//           <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
//             <Plus className="h-4 w-4 mr-2" />New Invoice
//           </Button>
//         </div>

//         {showForm && (
//           <Card>
//             <CardContent className="pt-6">
//               <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 <Input placeholder="Invoice # *" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
//                 <Input placeholder="Customer *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
//                 <Input placeholder="Email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
//                 <Input placeholder="Total *" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} required />
//                 <select className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
//                   {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
//                 </select>
//                 <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
//                   <Button type="submit" disabled={loading}>Save</Button>
//                   <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         )}

//         <div className="relative max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search invoices..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
//         </div>

//         <Card>
//           <CardContent className="p-0">
//             <table className="w-full text-sm">
//               <thead className="bg-muted/50">
//                 <tr className="border-b">
//                   <th className="text-left p-3 font-medium">Invoice #</th>
//                   <th className="text-left p-3 font-medium">Customer</th>
//                   <th className="text-left p-3 font-medium">Amount</th>
//                   <th className="text-left p-3 font-medium">Date</th>
//                   <th className="text-left p-3 font-medium">Status</th>
//                   <th className="text-left p-3 font-medium">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((inv) => (
//                   <tr key={inv.id} className="border-b last:border-0">
//                     <td className="p-3 font-medium">{inv.number}</td>
//                     <td className="p-3">{inv.customerName}</td>
//                     <td className="p-3">{formatCurrency(inv.total)}</td>
//                     <td className="p-3 text-muted-foreground">{formatDate(inv.createdAt)}</td>
//                     <td className="p-3"><Badge variant={statusColors[inv.status] || "secondary"}>{inv.status.replace("_", " ")}</Badge></td>
//                     <td className="p-3">
//                       <div className="flex gap-1">
//                         <Button variant="ghost" size="icon" onClick={() => { setForm({ number: inv.number, customerName: inv.customerName, customerEmail: inv.customerEmail || "", total: String(inv.total), status: inv.status }); setEditingId(inv.id); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button>
//                         <Button variant="ghost" size="icon" onClick={async () => { if (confirm("Delete?")) { await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" }); setInvoices((p) => p.filter((x) => x.id !== inv.id)); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }
// app/dashboard/sales/invoices/invoices-client.tsx
"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";

type Invoice = {
  id: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  status: string;
  overdue?: boolean;
};

interface Props {
  invoices: Invoice[];
}

// Simple Select component
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
  Paid: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Draft: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  Posted: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Overdue: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export function InvoicesClient({ invoices: initialInvoices }: Props) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editForm, setEditForm] = useState<Partial<Invoice>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(q) ||
          invoice.customer.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    return filtered;
  }, [initialInvoices, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string, overdue?: boolean) => {
    if (overdue && status === "Posted") {
      return (
        <div className="flex flex-col gap-1">
          <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            Posted
          </Badge>
          <Badge className="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs">
            Overdue
          </Badge>
        </div>
      );
    }
    return (
      <Badge className={statusColors[status] || "bg-gray-500/10 text-gray-700"}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Sales Invoices">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Sales Invoices</h1>
          </div>
          <Link href="/dashboard/sales-invoice/invoices/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: string) => {
                setStatusFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Draft">Draft</option>
              <option value="Posted">Posted</option>
              <option value="Overdue">Overdue</option>
            </Select>
            <div className="text-sm text-muted-foreground">
              {itemsPerPage} per page
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Invoice Date
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Total
                      </th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-muted-foreground">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      paginatedInvoices.map((invoice, index) => (
                        <tr
                          key={invoice.id}
                          className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/5"
                          }`}
                        >
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{invoice.id}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <span className="text-sm">{invoice.customer}</span>
                          </td>
                          <td className="p-3 md:p-4">
                            <span className="text-sm">{invoice.invoiceDate}</span>
                          </td>
                          <td className="p-3 md:p-4">
                            <span className={`text-sm ${invoice.overdue ? 'text-red-600 font-medium' : ''}`}>
                              {invoice.dueDate}
                            </span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span className="text-sm">{formatCurrency(invoice.subtotal)}</span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span className="text-sm">{formatCurrency(invoice.tax)}</span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span className="text-sm font-medium">{formatCurrency(invoice.total)}</span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span className={`text-sm ${invoice.balance === 0 ? 'text-green-600' : ''}`}>
                              {formatCurrency(invoice.balance)}
                            </span>
                          </td>
                          <td className="p-3 md:p-4">
                            {getStatusBadge(invoice.status, invoice.overdue)}
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewingInvoice(invoice)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingInvoice(invoice); setEditForm({ ...invoice }); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(invoice.id)}>
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

        {/* View Modal */}
        {viewingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingInvoice(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Invoice Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setViewingInvoice(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground">Invoice Number</span><p className="font-medium">{viewingInvoice.id}</p></div>
                  <div><span className="text-xs text-muted-foreground">Customer</span><p className="font-medium">{viewingInvoice.customer}</p></div>
                  <div><span className="text-xs text-muted-foreground">Invoice Date</span><p>{viewingInvoice.invoiceDate}</p></div>
                  <div><span className="text-xs text-muted-foreground">Due Date</span><p>{viewingInvoice.dueDate}</p></div>
                  <div><span className="text-xs text-muted-foreground">Subtotal</span><p>{formatCurrency(viewingInvoice.subtotal)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Tax</span><p>{formatCurrency(viewingInvoice.tax)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Total</span><p className="font-medium">{formatCurrency(viewingInvoice.total)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Balance</span><p>{formatCurrency(viewingInvoice.balance)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p>{getStatusBadge(viewingInvoice.status, viewingInvoice.overdue)}</p></div>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t">
                <Button variant="outline" onClick={() => setViewingInvoice(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingInvoice(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Edit Invoice</h2>
                <Button variant="ghost" size="sm" onClick={() => setEditingInvoice(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Customer</label>
                    <Input value={editForm.customer || ""} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Invoice Date</label>
                    <Input type="date" value={editForm.invoiceDate || ""} onChange={(e) => setEditForm({ ...editForm, invoiceDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Due Date</label>
                    <Input type="date" value={editForm.dueDate || ""} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <select value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Draft">Draft</option>
                      <option value="Posted">Posted</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Subtotal</label>
                    <Input type="number" step="0.01" value={editForm.subtotal || 0} onChange={(e) => setEditForm({ ...editForm, subtotal: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Tax</label>
                    <Input type="number" step="0.01" value={editForm.tax || 0} onChange={(e) => setEditForm({ ...editForm, tax: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Total</label>
                    <Input type="number" step="0.01" value={editForm.total || 0} onChange={(e) => setEditForm({ ...editForm, total: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Balance</label>
                    <Input type="number" step="0.01" value={editForm.balance || 0} onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button variant="outline" onClick={() => setEditingInvoice(null)}>Cancel</Button>
                <Button onClick={() => {
                  setInvoices((prev) => prev.map((inv) => inv.id === editingInvoice.id ? { ...inv, ...editForm } as Invoice : inv));
                  setEditingInvoice(null);
                }}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Invoice</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this invoice? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  setInvoices((prev) => prev.filter((inv) => inv.id !== deletingId));
                  setDeletingId(null);
                }}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of{" "}
              {filteredInvoices.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
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