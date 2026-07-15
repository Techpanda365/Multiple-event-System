"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Ticket, ChevronLeft, ChevronRight, MessageSquare,
  ArrowUpDown, Filter, X, Plus, Bold, Italic, Underline,
  List, ListOrdered, Link, Heading1, Heading2, Loader2,
  Edit, Trash2
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TicketData {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { name: string };
  categoryId?: string;
  creator: { name: string };
  replies: any[];
  created_at: string;
}

const priorityColors: Record<string, string> = {
  low: "text-blue-600 bg-blue-50 border-blue-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  urgent: "text-red-600 bg-red-50 border-red-200",
};

const statusColors: Record<string, string> = {
  open: "text-blue-600 bg-blue-50 border-blue-200",
  in_progress: "text-yellow-600 bg-yellow-50 border-yellow-200",
  resolved: "text-green-600 bg-green-50 border-green-200",
  closed: "text-gray-600 bg-gray-50 border-gray-200",
};

const PER_PAGE = 7;

function normalizeStatus(s: string): string {
  return s === "IN_PROGRESS" ? "in_progress" : s.toLowerCase();
}

function normalizePriority(s: string): string {
  return s.toLowerCase();
}

export default function AllTicketsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "medium",
  });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/helpdesk/tickets").then((r) => r.json()),
      fetch("/api/admin/helpdesk/categories").then((r) => r.json()),
    ]).then(([sessionData, ticketsData, catData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      const cats: Category[] = catData.categories || [];
      setCategories(cats);

      const catMap = new Map(cats.map((c: Category) => [c.id, c]));
      const mapped: TicketData[] = (ticketsData.tickets || []).map((t: any) => {
        const cat = catMap.get(t.categoryId);
        return {
          id: t.id,
          ticket_id: t.ticketId,
          title: t.title,
          description: t.description || "",
          status: normalizeStatus(t.status),
          priority: normalizePriority(t.priority),
          category: { name: cat?.name || "Uncategorized" },
          categoryId: t.categoryId,
          creator: { name: t.creatorName },
          replies: Array.isArray(t.replies) ? t.replies : [],
          created_at: t.createdAt,
        };
      });
      setTickets(mapped);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...tickets];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.ticket_id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.creator.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
    if (categoryFilter !== "all") result = result.filter((t) => t.category.name === categoryFilter);

    if (sortField) {
      result.sort((a: any, b: any) => {
        const aVal = sortField === "ticket_id" ? a.ticket_id : sortField === "title" ? a.title : sortField === "status" ? a.status : sortField === "priority" ? a.priority : a.created_at;
        const bVal = sortField === "ticket_id" ? b.ticket_id : sortField === "title" ? b.title : sortField === "status" ? b.status : sortField === "priority" ? b.priority : b.created_at;
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return result;
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, sortField, sortDir, tickets]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const stats = useMemo(() => ({
    total: tickets.length,
    urgent: tickets.filter((t) => t.priority === "urgent").length,
    high: tickets.filter((t) => t.priority === "high").length,
    medium: tickets.filter((t) => t.priority === "medium").length,
    low: tickets.filter((t) => t.priority === "low").length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
  }), [tickets]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  const hasFilters = statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || searchQuery !== "";

  const handleCreate = async () => {
    if (!formData.title) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority.toUpperCase(),
          categoryId: formData.categoryId || undefined,
          creatorName: userData?.name || "Super Admin",
        }),
      });
      const data = await res.json();
      if (data.ticket) {
        const cat = categories.find((c) => c.id === data.ticket.categoryId);
        const newTicket: TicketData = {
          id: data.ticket.id,
          ticket_id: data.ticket.ticketId,
          title: data.ticket.title,
          description: data.ticket.description || "",
          status: normalizeStatus(data.ticket.status),
          priority: normalizePriority(data.ticket.priority),
          category: { name: cat?.name || "Uncategorized" },
          categoryId: data.ticket.categoryId,
          creator: { name: data.ticket.creatorName },
          replies: [],
          created_at: data.ticket.createdAt,
        };
        setTickets((prev) => [newTicket, ...prev]);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (ticket: TicketData) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description || "",
      categoryId: ticket.categoryId || "",
      priority: ticket.priority,
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!formData.title || !editingTicket) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${editingTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority.toUpperCase(),
          categoryId: formData.categoryId || undefined,
        }),
      });
      const data = await res.json();
      if (data.ticket) {
        const cat = categories.find((c) => c.id === data.ticket.categoryId);
        const updatedTicket: TicketData = {
          id: data.ticket.id,
          ticket_id: data.ticket.ticketId,
          title: data.ticket.title,
          description: data.ticket.description || "",
          status: normalizeStatus(data.ticket.status),
          priority: normalizePriority(data.ticket.priority),
          category: { name: cat?.name || "Uncategorized" },
          categoryId: data.ticket.categoryId,
          creator: { name: data.ticket.creatorName },
          replies: [],
          created_at: data.ticket.createdAt,
        };
        setTickets((prev) => prev.map((t) => t.id === updatedTicket.id ? updatedTicket : t));
      }
      setShowForm(false);
      setEditingTicket(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update ticket", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete ticket", err);
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", categoryId: "", priority: "medium" });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTicket(null);
    resetForm();
  };

  if (loading) {
    return (
      <DashboardLayout title="All Tickets" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="All Tickets" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">All Tickets</h2>
            <p className="text-muted-foreground text-sm">Manage and track all support tickets</p>
          </div>
          <Button size="icon" className="h-9 w-9" onClick={() => setShowForm(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-gray-700" },
            { label: "Urgent", value: stats.urgent, color: "text-red-600" },
            { label: "High", value: stats.high, color: "text-orange-600" },
            { label: "Medium", value: stats.medium, color: "text-yellow-600" },
            { label: "Low", value: stats.low, color: "text-blue-600" },
            { label: "Open", value: stats.open, color: "text-blue-600" },
            { label: "In Progress", value: stats.in_progress, color: "text-yellow-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-lg p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title or company..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select
            className="h-9 px-3 rounded-lg border bg-background text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            className="h-9 px-3 rounded-lg border bg-background text-sm"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            className="h-9 px-3 rounded-lg border bg-background text-sm"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <Th sortable onClick={() => handleSort("ticket_id")} active={sortField === "ticket_id"} dir={sortDir}>Ticket ID</Th>
                <Th sortable onClick={() => handleSort("title")} active={sortField === "title"} dir={sortDir}>Title</Th>
                <Th>Category</Th>
                <Th sortable onClick={() => handleSort("priority")} active={sortField === "priority"} dir={sortDir}>Priority</Th>
                <Th sortable onClick={() => handleSort("status")} active={sortField === "status"} dir={sortDir}>Status</Th>
                <Th>Created By</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Ticket className="h-8 w-8" />
                      <p className="text-sm">No tickets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{ticket.ticket_id}</td>
                    <td className="px-4 py-3 font-medium max-w-[220px] truncate" title={ticket.title}>{ticket.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border text-blue-600 bg-blue-50 border-blue-200`}>
                        {ticket.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${priorityColors[ticket.priority] || priorityColors.medium}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[ticket.status] || statusColors.open}`}>
                        {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ticket.creator.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => router.push(`/admin/helpdesk/tickets/${ticket.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(ticket)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(ticket.id)}
                          disabled={deleting === ticket.id}
                        >
                          {deleting === ticket.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8" onClick={handleFormClose}>
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {editingTicket ? 'Update the ticket details' : 'Fill in the details to create a support ticket'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted" onClick={handleFormClose}>✕</Button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title <span className="text-destructive">*</span></label>
                  <Input 
                    placeholder="e.g. Cannot access billing dashboard" 
                    className="h-10" 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <select 
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    value={formData.categoryId} 
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Priority</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["low", "medium", "high", "urgent"].map((p) => (
                      <label key={p} className={`flex items-center justify-center h-10 rounded-xl border-2 cursor-pointer text-sm font-medium capitalize transition-all ${formData.priority === p ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"}`}>
                        <input 
                          type="radio" 
                          name="priority" 
                          value={p} 
                          checked={formData.priority === p} 
                          onChange={() => setFormData({ ...formData, priority: p })} 
                          className="sr-only" 
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <RichEditor
                    value={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Category: <span className="font-medium text-foreground">{categories.find((c) => c.id === formData.categoryId)?.name || "None"}</span></span>
                  <span className="text-muted-foreground/30">|</span>
                  <span className="text-muted-foreground">Priority: <span className="font-medium text-foreground capitalize">{formData.priority}</span></span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
              <Button variant="outline" onClick={handleFormClose}>Cancel</Button>
              <Button 
                className="gap-1.5" 
                disabled={creating || !formData.title} 
                onClick={editingTicket ? handleUpdate : handleCreate}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                {editingTicket ? 'Update Ticket' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const exec = (cmd: string, val?: string) => {
    if (selRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selRef.current);
      }
    }
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      selRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") { e.preventDefault(); exec("insertHTML", "&nbsp;&nbsp;"); }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const tool = (cmd: string, val?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    exec(cmd, val);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 p-1.5 bg-muted/30 border-b flex-wrap">
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Bold" onMouseDown={tool("bold")}><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Italic" onMouseDown={tool("italic")}><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Underline" onMouseDown={tool("underline")}><Underline className="h-3.5 w-3.5" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Heading 3" onMouseDown={tool("formatBlock", "<h3>")}><Heading1 className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Heading 4" onMouseDown={tool("formatBlock", "<h4>")}><Heading2 className="h-3.5 w-3.5" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Bullet List" onMouseDown={tool("insertUnorderedList")}><List className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Numbered List" onMouseDown={tool("insertOrderedList")}><ListOrdered className="h-3.5 w-3.5" /></button>
        <span className="w-px h-5 bg-border mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Insert Link" onMouseDown={(e) => { e.preventDefault(); insertLink(); }}><Link className="h-3.5 w-3.5" /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[120px] p-3 text-sm focus:outline-none bg-background"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
        onKeyUp={handleMouseUp}
      />
    </div>
  );
}

function Th({ children, sortable, onClick, active, dir, className }: any) {
  return (
    <th className={`text-left px-4 py-3 font-medium ${className || ""}`}>
      {sortable ? (
        <button className="flex items-center gap-1 hover:text-foreground" onClick={onClick}>
          {children}
          <ArrowUpDown className={`h-3 w-3 ${active ? "text-primary" : "text-muted-foreground"}`} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}