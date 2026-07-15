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
  Award,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type AwardType = {
  id: string;
  employeeId: string;
  awardType: string;
  awardDate: string;
  description?: string;
  certificate?: string;
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

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedAward, setSelectedAward] = useState<AwardType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchAwards = async () => {
    try {
      const res = await fetch("/api/hrm/awards");
      const data = await res.json();
      setAwards(Array.isArray(data) ? data : []);
    } catch {
      setAwards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAwards(); }, []);

  const filteredAwards = useMemo(() => {
    let filtered = awards;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a) =>
        `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(q) ||
        a.awardType.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [awards, search]);

  const totalPages = Math.ceil(filteredAwards.length / itemsPerPage);
  const paginatedAwards = filteredAwards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (award: AwardType) => { setSelectedAward(award); setIsViewModalOpen(true); };
  const handleDelete = (award: AwardType) => { setSelectedAward(award); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedAward) return;
    await fetch(`/api/hrm/awards/${selectedAward.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false); setSelectedAward(null); fetchAwards();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Awards</h1>
          </div>
          <Link href="/dashboard/hrm/awards/create" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />Create Award
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search Awards..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex items-center gap-3">
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Award Type</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Award Date</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedAwards.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No awards found</td></tr>
                    ) : (
                      paginatedAwards.map((award, index) => {
                        const name = `${award.employee.firstName} ${award.employee.lastName}`;
                        return (
                          <tr key={award.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{name}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{award.awardType}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{new Date(award.awardDate).toLocaleDateString("en-IN")}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(award)}><Eye className="h-4 w-4" /></Button>
                                <Link href={`/dashboard/hrm/awards/edit/${award.id}`} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(award)}>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAwards.length)} of {filteredAwards.length} entries
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Award Details">
        {selectedAward && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(`${selectedAward.employee.firstName} ${selectedAward.employee.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedAward.employee.firstName} {selectedAward.employee.lastName}</p>
                <p className="text-sm text-muted-foreground">{selectedAward.awardType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Award Date</p><p className="text-sm font-medium">{new Date(selectedAward.awardDate).toLocaleDateString("en-IN")}</p></div>
              <div><p className="text-xs text-muted-foreground">Award Type</p><Badge variant="secondary">{selectedAward.awardType}</Badge></div>
              {selectedAward.description && <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedAward.description}</p></div>}
              {selectedAward.certificate && <div className="col-span-2"><p className="text-xs text-muted-foreground">Certificate</p><a href={selectedAward.certificate} target="_blank" className="text-sm text-blue-600 underline">View Certificate</a></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Award">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete award for <span className="font-medium text-foreground">{selectedAward?.employee.firstName} {selectedAward?.employee.lastName}</span>? This action cannot be undone.
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
