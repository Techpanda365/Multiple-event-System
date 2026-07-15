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
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  approvedBy?: string;
  status: string;
  location?: string;
  description?: string;
  color?: string;
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
  Approved: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Rejected: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  Completed: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/hrm/events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(events.map((e) => e.status));
    return Array.from(statuses);
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        (e.approvedBy || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }
    return filtered;
  }, [events, search, statusFilter]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (e: Event) => { setSelectedEvent(e); setIsViewModalOpen(true); };
  const handleDelete = (e: Event) => { setSelectedEvent(e); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;
    await fetch(`/api/hrm/events/${selectedEvent.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false); setSelectedEvent(null); fetchEvents();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN");

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Events</h1>
          </div>
          <Link href="/dashboard/hrm/events/new" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />Create Event
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search Events..." className="pl-9" value={search}
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Event Type</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">End Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Approved By</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedEvents.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No events found</td></tr>
                    ) : (
                      paginatedEvents.map((event, index) => (
                        <tr key={event.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{event.eventType}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{formatDate(event.startDate)}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{formatDate(event.endDate)}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{event.approvedBy || "-"}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[event.status]}>{event.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(event)}><Eye className="h-4 w-4" /></Button>
                              <Link href={`/dashboard/hrm/events/edit/${event.id}`} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(event)}>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} entries
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedEvent.color || "#3b82f6" }}>
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{selectedEvent.title}</p>
                <p className="text-sm text-muted-foreground">{selectedEvent.eventType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium">{formatDate(selectedEvent.startDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">End Date</p><p className="text-sm font-medium">{formatDate(selectedEvent.endDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Start Time</p><p className="text-sm font-medium">{selectedEvent.startTime}</p></div>
              <div><p className="text-xs text-muted-foreground">End Time</p><p className="text-sm font-medium">{selectedEvent.endTime}</p></div>
              <div><p className="text-xs text-muted-foreground">Approved By</p><p className="text-sm font-medium">{selectedEvent.approvedBy || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedEvent.status]}>{selectedEvent.status}</Badge></div>
              {selectedEvent.location && <div className="col-span-2"><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{selectedEvent.location}</p></div>}
              {selectedEvent.description && <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedEvent.description}</p></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Event">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedEvent?.title}</span>? This action cannot be undone.
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
