// app/dashboard/hrm/leave/types/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type LeaveType = {
  id: string;
  name: string;
  daysAllowed: number;
  isPaid: boolean;
  color?: string;
};

const FilterSelect = ({ value, onValueChange, children }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isPaidFilter, setIsPaidFilter] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/hrm/leave-types");
      const data = await res.json();
      setLeaveTypes(Array.isArray(data) ? data : []);
    } catch {
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const filteredLeaveTypes = useMemo(() => {
    let filtered = leaveTypes;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((type) => type.name.toLowerCase().includes(q));
    }
    if (isPaidFilter !== "all") {
      filtered = filtered.filter((type) => type.isPaid === (isPaidFilter === "paid"));
    }
    return filtered;
  }, [leaveTypes, search, isPaidFilter]);

  const totalPages = Math.ceil(filteredLeaveTypes.length / itemsPerPage);
  const paginatedTypes = filteredLeaveTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = () => setCurrentPage(1);

  const handleView = (type: LeaveType) => {
    setSelectedType(type);
    setIsViewModalOpen(true);
  };

  const handleDelete = (type: LeaveType) => {
    setSelectedType(type);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedType) return;
    await fetch(`/api/hrm/leave-types/${selectedType.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    setSelectedType(null);
    fetchTypes();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Leave Types</h1>
          </div>
          <Link href="/dashboard/hrm/leave/types/create" className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-2" />Create Leave Type
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search" className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <FilterSelect value={isPaidFilter} onValueChange={(value) => { setIsPaidFilter(value); handleFilterChange(); }}>
              <option value="all">All Types</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Max Days Per Year</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Is Paid</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedTypes.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No leave types found</td></tr>
                    ) : (
                      paginatedTypes.map((type, index) => (
                        <tr key={type.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              {type.color && <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: type.color }} />}
                              <span className="font-medium text-sm">{type.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{type.daysAllowed}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={type.isPaid ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>
                              {type.isPaid ? "Paid" : "Unpaid"}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(type)}><Eye className="h-4 w-4" /></Button>
                              <Link href={`/dashboard/hrm/leave/types/edit/${type.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(type)}>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLeaveTypes.length)} of {filteredLeaveTypes.length} results
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Leave Type Details">
        {selectedType && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedType.color && <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedType.color }} />}
                  <p className="text-sm font-medium">{selectedType.name}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Days Per Year</p>
                <p className="text-sm font-medium">{selectedType.daysAllowed}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Is Paid</p>
                <Badge className={selectedType.isPaid ? "bg-green-500/10 text-green-700 mt-1" : "bg-gray-500/10 text-gray-700 mt-1"}>
                  {selectedType.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Leave Type">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedType?.name}</span>? This action cannot be undone.
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
