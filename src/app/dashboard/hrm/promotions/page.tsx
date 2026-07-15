"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Trash2,
  Plus,
  X,
  Building2,
  Briefcase,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type Promotion = {
  id: string;
  employeeId: string;
  previousBranch: string | null;
  previousDepartment: string | null;
  previousDesignation: string | null;
  currentBranch: string | null;
  currentDepartment: string | null;
  currentDesignation: string | null;
  effectiveDate: string;
  status: string;
  reason: string | null;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
};

const FilterSelect = ({ value, onValueChange, children }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">{children}</select>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || "max-w-2xl"} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-700",
  Approved: "bg-blue-500/10 text-blue-700",
  Rejected: "bg-red-500/10 text-red-700",
  Completed: "bg-green-500/10 text-green-700",
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/hrm/promotions");
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const uniqueStatuses = useMemo(() => [...new Set(promotions.map(p => p.status))], [promotions]);

  const filteredPromotions = useMemo(() => {
    let filtered = promotions;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(q) ||
        (p.currentDesignation || "").toLowerCase().includes(q) ||
        (p.currentBranch || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter(p => p.status === statusFilter);
    return filtered;
  }, [promotions, search, statusFilter]);

  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (p: Promotion) => { setSelectedPromotion(p); setIsViewModalOpen(true); };
  const handleDelete = (p: Promotion) => { setSelectedPromotion(p); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedPromotion) return;
    await fetch(`/api/hrm/promotions/${selectedPromotion.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false); setSelectedPromotion(null); fetchPromotions();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Manage Promotions</h1></div>
          <Link href="/dashboard/hrm/promotions/create" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />Create Promotion
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search promotions..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <FilterSelect value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <option value="all">All Status</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Employee</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Current Branch</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Current Designation</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Effective Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedPromotions.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No promotions found</td></tr>
                    ) : (
                      paginatedPromotions.map((p, index) => {
                        const name = `${p.employee.firstName} ${p.employee.lastName}`;
                        return (
                          <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{name}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4"><div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{p.currentBranch || "—"}</span></div></td>
                            <td className="p-3 md:p-4"><div className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{p.currentDesignation || "—"}</span></div></td>
                            <td className="p-3 md:p-4"><div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{new Date(p.effectiveDate).toLocaleDateString("en-IN")}</span></div></td>
                            <td className="p-3 md:p-4"><Badge className={statusColors[p.status] || ""}>{p.status}</Badge></td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(p)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
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

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPromotions.length)} of {filteredPromotions.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Promotion Details">
        {selectedPromotion && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">{getInitials(`${selectedPromotion.employee.firstName} ${selectedPromotion.employee.lastName}`)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedPromotion.employee.firstName} {selectedPromotion.employee.lastName}</p>
                <p className="text-sm text-muted-foreground">{selectedPromotion.currentDesignation || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Previous Branch</p><p className="text-sm font-medium">{selectedPromotion.previousBranch || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Current Branch</p><p className="text-sm font-medium">{selectedPromotion.currentBranch || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Previous Department</p><p className="text-sm font-medium">{selectedPromotion.previousDepartment || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Current Department</p><p className="text-sm font-medium">{selectedPromotion.currentDepartment || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Previous Designation</p><p className="text-sm font-medium">{selectedPromotion.previousDesignation || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Current Designation</p><p className="text-sm font-medium">{selectedPromotion.currentDesignation || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Effective Date</p><p className="text-sm font-medium">{new Date(selectedPromotion.effectiveDate).toLocaleDateString("en-IN")}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedPromotion.status]}>{selectedPromotion.status}</Badge></div>
              {selectedPromotion.reason && <div className="col-span-2"><p className="text-xs text-muted-foreground">Reason</p><p className="text-sm">{selectedPromotion.reason}</p></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Promotion">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete promotion for <span className="font-medium text-foreground">{selectedPromotion?.employee.firstName} {selectedPromotion?.employee.lastName}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
