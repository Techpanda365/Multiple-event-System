"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type AcknowledgmentType = {
  id: string;
  documentTitle: string;
  assignedBy?: string;
  assignedDate: string;
  acknowledgedDate?: string;
  status: string;
  note?: string;
  employee?: { id: string; firstName: string; lastName: string; employeeId: string };
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Acknowledged: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Acknowledging: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

export default function AcknowledgmentsPage() {
  const [acknowledgments, setAcknowledgments] = useState<AcknowledgmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAck, setSelectedAck] = useState<AcknowledgmentType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchAcknowledgments = async () => {
    try {
      const res = await fetch("/api/hrm/acknowledgments");
      const data = await res.json();
      setAcknowledgments(Array.isArray(data) ? data : []);
    } catch {
      setAcknowledgments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAcknowledgments(); }, []);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(acknowledgments.map((a) => a.status));
    return Array.from(statuses);
  }, [acknowledgments]);

  const filteredAcknowledgments = useMemo(() => {
    let filtered = acknowledgments;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a) =>
        a.documentTitle.toLowerCase().includes(q) ||
        (a.assignedBy || "").toLowerCase().includes(q) ||
        `${a.employee?.firstName || ""} ${a.employee?.lastName || ""}`.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    return filtered;
  }, [acknowledgments, search, statusFilter]);

  const totalPages = Math.ceil(filteredAcknowledgments.length / itemsPerPage);
  const paginatedAcknowledgments = filteredAcknowledgments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (a: AcknowledgmentType) => { setSelectedAck(a); setIsViewModalOpen(true); };
  const handleDelete = (a: AcknowledgmentType) => { setSelectedAck(a); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedAck) return;
    await fetch(`/api/hrm/acknowledgments/${selectedAck.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false); setSelectedAck(null); fetchAcknowledgments();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Acknowledgments</h1>
          </div>
          <Link href="/dashboard/hrm/acknowledgments/new" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />Create Acknowledgment
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search acknowledgments..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="all">All Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Document</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned By</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedAcknowledgments.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No acknowledgments found</td></tr>
                    ) : (
                      paginatedAcknowledgments.map((ack, index) => (
                        <tr key={ack.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <span className="text-sm font-medium">{ack.employee ? `${ack.employee.firstName} ${ack.employee.lastName}` : "-"}</span>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{ack.documentTitle}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{ack.assignedBy || "-"}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[ack.status]}>{ack.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(ack)}><Eye className="h-4 w-4" /></Button>
                              <Link href={`/dashboard/hrm/acknowledgments/edit/${ack.id}`} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(ack)}>
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

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAcknowledgments.length)} of {filteredAcknowledgments.length} entries
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

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Acknowledgment Details">
        {selectedAck && (
          <div className="space-y-4">
            <div>
              <p className="font-medium text-lg">{selectedAck.documentTitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Employee</p><p className="text-sm font-medium">{selectedAck.employee ? `${selectedAck.employee.firstName} ${selectedAck.employee.lastName}` : "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned By</p><p className="text-sm font-medium">{selectedAck.assignedBy || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned Date</p><p className="text-sm font-medium">{new Date(selectedAck.assignedDate).toLocaleDateString("en-IN")}</p></div>
              {selectedAck.acknowledgedDate && <div><p className="text-xs text-muted-foreground">Acknowledged Date</p><p className="text-sm font-medium">{new Date(selectedAck.acknowledgedDate).toLocaleDateString("en-IN")}</p></div>}
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedAck.status]}>{selectedAck.status}</Badge></div>
              {selectedAck.note && <div className="col-span-2"><p className="text-xs text-muted-foreground">Note</p><p className="text-sm">{selectedAck.note}</p></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Acknowledgment">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedAck?.documentTitle}</span>? This action cannot be undone.
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
