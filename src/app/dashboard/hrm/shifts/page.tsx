// app/dashboard/hrm/attendance/shifts/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Clock,
  X,
  Loader2,
} from "lucide-react";

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  isNightShift: boolean;
};

const FilterSelect = ({ value, onValueChange, children }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    {children}
  </select>
);

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || 'max-w-2xl'} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "", startTime: "", endTime: "", breakStart: "", breakEnd: "", isNightShift: "No",
  });

  const [editForm, setEditForm] = useState({
    name: "", startTime: "", endTime: "", breakStart: "", breakEnd: "", isNightShift: "No",
  });

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/hrm/shifts");
      const data = await res.json();
      setShifts(Array.isArray(data) ? data : []);
    } catch {
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  const filteredShifts = useMemo(() => {
    let filtered = shifts;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [shifts, search]);

  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
  const paginatedShifts = filteredShifts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = () => setCurrentPage(1);

  const handleView = (shift: Shift) => {
    setSelectedShift(shift);
    setIsViewModalOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setEditForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakStart: shift.breakStart,
      breakEnd: shift.breakEnd,
      isNightShift: shift.isNightShift ? "Yes" : "No",
    });
    setIsEditModalOpen(true);
  };

  const handleCreateShift = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/hrm/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          startTime: createForm.startTime,
          endTime: createForm.endTime,
          breakStart: createForm.breakStart,
          breakEnd: createForm.breakEnd,
          isNightShift: createForm.isNightShift === "Yes",
        }),
      });
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", startTime: "", endTime: "", breakStart: "", breakEnd: "", isNightShift: "No" });
      fetchShifts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedShift) return;
    setSubmitting(true);
    try {
      await fetch(`/api/hrm/shifts/${selectedShift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          breakStart: editForm.breakStart,
          breakEnd: editForm.breakEnd,
          isNightShift: editForm.isNightShift === "Yes",
        }),
      });
      setIsEditModalOpen(false);
      fetchShifts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/hrm/shifts/${id}`, { method: "DELETE" });
    fetchShifts();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Shifts</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Create Shift
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search Shifts..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <FilterSelect value="all" onValueChange={() => {}}>
              <option value="all">All Shifts</option>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Shift Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start Time</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">End Time</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Break Start</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Break End</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Night Shift</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedShifts.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No shifts found</td></tr>
                    ) : (
                      paginatedShifts.map((shift, index) => (
                        <tr key={shift.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{shift.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm font-mono">{shift.startTime}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm font-mono">{shift.endTime}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm font-mono">{shift.breakStart || "—"}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm font-mono">{shift.breakEnd || "—"}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={shift.isNightShift ? "bg-blue-500/10 text-blue-700" : "bg-gray-500/10 text-gray-700"}>
                              {shift.isNightShift ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(shift)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(shift)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(shift.id)}><Trash2 className="h-4 w-4" /></Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredShifts.length)} of {filteredShifts.length} entries
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Shift Details">
        {selectedShift && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Shift Name</p><p className="text-sm font-medium">{selectedShift.name}</p></div>
              <div>
                <p className="text-xs text-muted-foreground">Night Shift</p>
                <Badge className={selectedShift.isNightShift ? "bg-blue-500/10 text-blue-700" : "bg-gray-500/10 text-gray-700"}>
                  {selectedShift.isNightShift ? "Yes" : "No"}
                </Badge>
              </div>
              <div><p className="text-xs text-muted-foreground">Start Time</p><p className="text-sm font-medium font-mono">{selectedShift.startTime}</p></div>
              <div><p className="text-xs text-muted-foreground">End Time</p><p className="text-sm font-medium font-mono">{selectedShift.endTime}</p></div>
              <div><p className="text-xs text-muted-foreground">Break Start</p><p className="text-sm font-medium font-mono">{selectedShift.breakStart || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Break End</p><p className="text-sm font-medium font-mono">{selectedShift.breakEnd || "—"}</p></div>
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Shift">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Shift Name</label>
            <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input type="time" value={editForm.startTime} onChange={e => setEditForm({ ...editForm, startTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input type="time" value={editForm.endTime} onChange={e => setEditForm({ ...editForm, endTime: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Break Start</label>
              <Input type="time" value={editForm.breakStart} onChange={e => setEditForm({ ...editForm, breakStart: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Break End</label>
              <Input type="time" value={editForm.breakEnd} onChange={e => setEditForm({ ...editForm, breakEnd: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Night Shift</label>
            <SimpleSelect value={editForm.isNightShift} onValueChange={(v: string) => setEditForm({ ...editForm, isNightShift: v })}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </SimpleSelect>
          </div>
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleEditSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Shift">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Shift Name <span className="text-red-500">*</span></label>
            <Input type="text" placeholder="Enter Shift Name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time <span className="text-red-500">*</span></label>
              <Input type="time" value={createForm.startTime} onChange={e => setCreateForm({ ...createForm, startTime: e.target.value })} className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time <span className="text-red-500">*</span></label>
              <Input type="time" value={createForm.endTime} onChange={e => setCreateForm({ ...createForm, endTime: e.target.value })} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Break Start</label>
              <Input type="time" value={createForm.breakStart} onChange={e => setCreateForm({ ...createForm, breakStart: e.target.value })} className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Break End</label>
              <Input type="time" value={createForm.breakEnd} onChange={e => setCreateForm({ ...createForm, breakEnd: e.target.value })} className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Night Shift</label>
            <SimpleSelect value={createForm.isNightShift} onValueChange={(v: string) => setCreateForm({ ...createForm, isNightShift: v })}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </SimpleSelect>
          </div>
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateShift} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Shift"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
