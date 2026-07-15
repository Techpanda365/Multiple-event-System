"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
  X,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type Holiday = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  holidayType: string;
  description: string;
  isPaid: boolean;
};

const FilterSelect = ({ value, onValueChange, children }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    {children}
  </select>
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

const holidayTypeColors: Record<string, string> = {
  "Public Holiday": "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  "Festival": "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  "Company Event": "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  "Optional": "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
};

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/hrm/holidays");
      const data = await res.json();
      setHolidays(Array.isArray(data) ? data : []);
    } catch {
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const uniqueTypes = useMemo(() => [...new Set(holidays.map((h) => h.holidayType))], [holidays]);

  const filteredHolidays = useMemo(() => {
    let filtered = holidays;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((h) => h.name.toLowerCase().includes(q) || h.holidayType.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") filtered = filtered.filter((h) => h.holidayType === typeFilter);
    return filtered;
  }, [holidays, search, typeFilter]);

  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);
  const paginatedHolidays = filteredHolidays.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = () => setCurrentPage(1);

  const handleView = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsViewModalOpen(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHoliday) return;
    await fetch(`/api/hrm/holidays/${selectedHoliday.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    setSelectedHoliday(null);
    fetchHolidays();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Holidays</h1>
          </div>
          <Link href="/dashboard/hrm/holidays/create" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />Create Holiday
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search holidays..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <FilterSelect value={typeFilter} onValueChange={(value) => { setTypeFilter(value); handleFilterChange(); }}>
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">End Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Holiday Type</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Is Paid</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedHolidays.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No holidays found</td></tr>
                    ) : (
                      paginatedHolidays.map((holiday, index) => (
                        <tr key={holiday.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{holiday.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{new Date(holiday.startDate).toLocaleDateString("en-IN")}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{new Date(holiday.endDate).toLocaleDateString("en-IN")}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={holidayTypeColors[holiday.holidayType] || "bg-gray-500/10 text-gray-700"}>{holiday.holidayType}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={holiday.isPaid ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>
                              {holiday.isPaid ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(holiday)}><Eye className="h-4 w-4" /></Button>
                              <Link href={`/dashboard/hrm/holidays/edit/${holiday.id}`} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(holiday)}>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHolidays.length)} of {filteredHolidays.length} entries
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Holiday Details">
        {selectedHoliday && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{selectedHoliday.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Holiday Type</p><Badge className={holidayTypeColors[selectedHoliday.holidayType]}>{selectedHoliday.holidayType}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium">{new Date(selectedHoliday.startDate).toLocaleDateString("en-IN")}</p></div>
              <div><p className="text-xs text-muted-foreground">End Date</p><p className="text-sm font-medium">{new Date(selectedHoliday.endDate).toLocaleDateString("en-IN")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedHoliday.description || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Is Paid</p><Badge className={selectedHoliday.isPaid ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>{selectedHoliday.isPaid ? "Yes" : "No"}</Badge></div>
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Holiday">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedHoliday?.name}</span>? This action cannot be undone.
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
