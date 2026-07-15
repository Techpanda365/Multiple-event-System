"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

type Proposal = {
  id: string;
  number: string;
  customer: string;
  proposalDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  balance: number;
  status: string;
  overdue?: boolean;
};

const SAMPLE_PROPOSALS: Proposal[] = [
  { id: "1", number: "SP-2026-02-008", customer: "Global Solutions Ltd", proposalDate: "2026-02-10", dueDate: "2026-08-27", subtotal: 120338.90, tax: 4152.14, total: 52473.14, balance: 52473.14, status: "Accepted" },
  { id: "2", number: "SP-2026-02-007", customer: "ABC Corporation", proposalDate: "2026-02-10", dueDate: "2026-05-31", subtotal: 2149.70, tax: 459.29, total: 2441.52, balance: 2441.52, status: "Sent", overdue: true },
  { id: "3", number: "SP-2026-02-006", customer: "Jessica Harris", proposalDate: "2026-02-11", dueDate: "2027-03-10", subtotal: 1539.00, tax: 151.82, total: 1596.92, balance: 1596.92, status: "Draft" },
  { id: "4", number: "SP-2026-02-005", customer: "Jessica Harris", proposalDate: "2026-02-10", dueDate: "2027-07-30", subtotal: 18399.90, tax: 872.97, total: 10232.88, balance: 10232.88, status: "Accepted" },
  { id: "5", number: "SP-2026-02-004", customer: "Maria Rodriguez", proposalDate: "2026-02-10", dueDate: "2026-10-01", subtotal: 100600.00, tax: 8004.45, total: 102174.45, balance: 102174.45, status: "Rejected" },
  { id: "6", number: "SP-2026-02-003", customer: "Lisa Anderson", proposalDate: "2026-03-01", dueDate: "2026-09-30", subtotal: 20800.00, tax: 2914.20, total: 23434.20, balance: 23434.20, status: "Draft" },
  { id: "7", number: "SP-2026-02-002", customer: "Emily Davis", proposalDate: "2026-02-10", dueDate: "2026-12-31", subtotal: 22889.50, tax: 2910.82, total: 22386.37, balance: 22386.37, status: "Sent" },
  { id: "8", number: "SP-2026-02-001", customer: "Sarah Johnson", proposalDate: "2026-02-10", dueDate: "2026-11-01", subtotal: 7159.80, tax: 2147.94, total: 9307.74, balance: 9307.74, status: "Accepted" },
];

const statusColors: Record<string, string> = {
  Accepted: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Draft: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  Sent: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Rejected: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const Select = ({ value, onValueChange, children }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    {children}
  </select>
);

const statusOptions = ["All", "Draft", "Sent", "Accepted", "Rejected"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export function ProposalList() {
  const [proposals, setProposals] = useState(SAMPLE_PROPOSALS);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editForm, setEditForm] = useState<Partial<Proposal>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let f = proposals;
    const q = search.toLowerCase();
    if (q) f = f.filter((p) => p.number.toLowerCase().includes(q) || p.customer.toLowerCase().includes(q));
    if (statusFilter !== "All") f = f.filter((p) => p.status === statusFilter);
    return f;
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string, overdue?: boolean) => {
    if (overdue) {
      return (
        <div className="flex flex-col gap-1">
          <Badge className={statusColors[status] || ""}>{status}</Badge>
          <Badge className="bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs">Overdue</Badge>
        </div>
      );
    }
    return <Badge className={statusColors[status] || "bg-gray-500/10 text-gray-700"}>{status}</Badge>;
  };

  return (
    <DashboardLayout title="Proposal">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Proposal</h1>
          </div>
          <Link href="/dashboard/modules/proposal/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Create Proposal
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search proposals..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setCurrentPage(1); }}>
              {statusOptions.map((s) => (<option key={s} value={s}>{s === "All" ? "All Status" : s}</option>))}
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Proposal Number</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Proposal Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Due Date</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Subtotal</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tax</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total Amount</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Balance</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No proposals found</td></tr>
                    ) : (
                      paginated.map((p, i) => (
                        <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${i % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{p.number}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 text-sm">{p.customer}</td>
                          <td className="p-3 md:p-4 text-sm">{p.proposalDate}</td>
                          <td className="p-3 md:p-4">
                            <span className={`text-sm ${p.overdue ? "text-red-600 font-medium" : ""}`}>{p.dueDate}</span>
                          </td>
                          <td className="p-3 md:p-4 text-right text-sm">{formatCurrency(p.subtotal)}</td>
                          <td className="p-3 md:p-4 text-right text-sm">{formatCurrency(p.tax)}</td>
                          <td className="p-3 md:p-4 text-right text-sm font-medium">{formatCurrency(p.total)}</td>
                          <td className="p-3 md:p-4 text-right">
                            <span className={`text-sm ${p.balance === 0 ? "text-green-600" : ""}`}>{formatCurrency(p.balance)}</span>
                          </td>
                          <td className="p-3 md:p-4">{getStatusBadge(p.status, p.overdue)}</td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setViewingProposal(p)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingProposal(p); setEditForm({ ...p }); }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(p.id)}><Trash2 className="h-4 w-4" /></Button>
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
        {viewingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewingProposal(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Proposal Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setViewingProposal(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-muted-foreground">Proposal Number</span><p className="font-medium">{viewingProposal.number}</p></div>
                  <div><span className="text-xs text-muted-foreground">Customer</span><p className="font-medium">{viewingProposal.customer}</p></div>
                  <div><span className="text-xs text-muted-foreground">Proposal Date</span><p>{viewingProposal.proposalDate}</p></div>
                  <div><span className="text-xs text-muted-foreground">Due Date</span><p>{viewingProposal.dueDate}</p></div>
                  <div><span className="text-xs text-muted-foreground">Subtotal</span><p>{formatCurrency(viewingProposal.subtotal)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Tax</span><p>{formatCurrency(viewingProposal.tax)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Total</span><p className="font-medium">{formatCurrency(viewingProposal.total)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Balance</span><p>{formatCurrency(viewingProposal.balance)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p>{getStatusBadge(viewingProposal.status, viewingProposal.overdue)}</p></div>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t">
                <Button variant="outline" onClick={() => setViewingProposal(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingProposal(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Edit Proposal</h2>
                <Button variant="ghost" size="sm" onClick={() => setEditingProposal(null)}>✕</Button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Customer</label>
                    <Input value={editForm.customer || ""} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Proposal Date</label>
                    <Input type="date" value={editForm.proposalDate || ""} onChange={(e) => setEditForm({ ...editForm, proposalDate: e.target.value })} />
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
                      <option value="Sent">Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
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
                <Button variant="outline" onClick={() => setEditingProposal(null)}>Cancel</Button>
                <Button onClick={() => {
                  setProposals((prev) => prev.map((p) => p.id === editingProposal.id ? { ...p, ...editForm } as Proposal : p));
                  setEditingProposal(null);
                }}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Delete Proposal</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this proposal? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  setProposals((prev) => prev.filter((p) => p.id !== deletingId));
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
