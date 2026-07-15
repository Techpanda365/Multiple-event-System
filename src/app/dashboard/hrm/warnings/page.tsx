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
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type WarningType = {
  id: string;
  employeeId: string;
  warningBy?: string;
  warningType: string;
  subject: string;
  severity: string;
  warningDate: string;
  status: string;
  description?: string;
  document?: string;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
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

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const severityColors: Record<string, string> = {
  Minor: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Major: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Critical: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  Active: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Resolved: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Expired: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<WarningType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWarning, setSelectedWarning] = useState<WarningType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchWarnings = async () => {
    try {
      const res = await fetch("/api/hrm/warnings");
      const data = await res.json();
      setWarnings(Array.isArray(data) ? data : []);
    } catch {
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarnings(); }, []);

  const uniqueSeverities = useMemo(() => {
    const severities = new Set(warnings.map((w) => w.severity));
    return Array.from(severities);
  }, [warnings]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(warnings.map((w) => w.status));
    return Array.from(statuses);
  }, [warnings]);

  const filteredWarnings = useMemo(() => {
    let filtered = warnings;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((w) =>
        `${w.employee.firstName} ${w.employee.lastName}`.toLowerCase().includes(q) ||
        w.warningType.toLowerCase().includes(q) ||
        w.subject.toLowerCase().includes(q)
      );
    }
    if (severityFilter !== "all") {
      filtered = filtered.filter((w) => w.severity === severityFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }
    return filtered;
  }, [warnings, search, severityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredWarnings.length / itemsPerPage);
  const paginatedWarnings = filteredWarnings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (warning: WarningType) => { setSelectedWarning(warning); setIsViewModalOpen(true); };
  const handleDelete = (warning: WarningType) => { setSelectedWarning(warning); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedWarning) return;
    await fetch(`/api/hrm/warnings/${selectedWarning.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false); setSelectedWarning(null); fetchWarnings();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Warnings</h1>
          </div>
          <Link href="/dashboard/hrm/warnings/new" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />Create Warning
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search warnings..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="all">All Severity</option>
              {uniqueSeverities.map((severity) => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Employee Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Warning Type</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Subject</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Warning Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Severity</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedWarnings.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No warnings found</td></tr>
                    ) : (
                      paginatedWarnings.map((warning, index) => {
                        const name = `${warning.employee.firstName} ${warning.employee.lastName}`;
                        return (
                          <tr key={warning.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{name}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4"><span className="text-sm">{warning.warningType}</span></td>
                            <td className="p-3 md:p-4"><span className="text-sm">{warning.subject}</span></td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{new Date(warning.warningDate).toLocaleDateString("en-IN")}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <Badge className={severityColors[warning.severity]}>{warning.severity}</Badge>
                            </td>
                            <td className="p-3 md:p-4">
                              <Badge className={statusColors[warning.status]}>{warning.status}</Badge>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(warning)}><Eye className="h-4 w-4" /></Button>
                                <Link href={`/dashboard/hrm/warnings/edit/${warning.id}`} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(warning)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWarnings.length)} of {filteredWarnings.length} entries
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Warning Details">
        {selectedWarning && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(`${selectedWarning.employee.firstName} ${selectedWarning.employee.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedWarning.employee.firstName} {selectedWarning.employee.lastName}</p>
                <p className="text-sm text-muted-foreground">{selectedWarning.warningType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Warning By</p><p className="text-sm font-medium">{selectedWarning.warningBy || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Warning Type</p><p className="text-sm font-medium">{selectedWarning.warningType}</p></div>
              <div><p className="text-xs text-muted-foreground">Subject</p><p className="text-sm font-medium">{selectedWarning.subject}</p></div>
              <div><p className="text-xs text-muted-foreground">Warning Date</p><p className="text-sm font-medium">{new Date(selectedWarning.warningDate).toLocaleDateString("en-IN")}</p></div>
              <div><p className="text-xs text-muted-foreground">Severity</p><Badge className={severityColors[selectedWarning.severity]}>{selectedWarning.severity}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedWarning.status]}>{selectedWarning.status}</Badge></div>
              {selectedWarning.description && <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedWarning.description}</p></div>}
              {selectedWarning.document && <div className="col-span-2"><p className="text-xs text-muted-foreground">Document</p><a href={selectedWarning.document} target="_blank" className="text-sm text-blue-600 underline">View Document</a></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Warning">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete warning for <span className="font-medium text-foreground">{selectedWarning?.employee.firstName} {selectedWarning?.employee.lastName}</span>? This action cannot be undone.
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
