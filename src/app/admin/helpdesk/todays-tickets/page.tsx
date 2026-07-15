"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, Play, Reply, Edit, Trash2, Loader2 } from "lucide-react";

interface TicketData {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { id: string; name: string; color: string };
  creator: { id: number; name: string; type: string; avatar?: string };
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

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + "d ago";
  return Math.floor(days / 30) + "mo ago";
}

function normalizeStatus(s: string): string {
  return s === "IN_PROGRESS" ? "in_progress" : s.toLowerCase();
}

function normalizePriority(s: string): string {
  return s.toLowerCase();
}

export default function TodaysTicketsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchTickets = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [sessionData, ticketsData, catData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/helpdesk/tickets").then((r) => r.json()),
        fetch("/api/admin/helpdesk/categories").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      const cats: any[] = catData.categories || [];
      setCategories(cats);
      const catMap = new Map(cats.map((c: any) => [c.id, c]));

      const mapped: TicketData[] = (ticketsData.tickets || [])
        .filter((t: any) => {
          const d = new Date(t.createdAt);
          return d.toDateString() === today.toDateString();
        })
        .map((t: any) => {
          const cat = catMap.get(t.categoryId);
          return {
            id: t.id,
            ticket_id: t.ticketId,
            title: t.title,
            description: t.description || "",
            status: normalizeStatus(t.status),
            priority: normalizePriority(t.priority),
            category: { id: t.categoryId || "", name: cat?.name || "Uncategorized", color: cat?.color || "#6B7280" },
            creator: { id: 0, name: t.creatorName, type: "company" },
            replies: Array.isArray(t.replies) ? t.replies : [],
            created_at: t.createdAt,
          };
        });
      setTickets(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus === "in_progress" ? "IN_PROGRESS" : newStatus.toUpperCase() }),
      });
      if (res.ok) {
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const deleteTicket = async (id: string, ticketId: string) => {
    if (!confirm("Delete ticket " + ticketId + "?")) return;
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete ticket", err);
    }
  };

  const saveEdit = async () => {
    if (!editingTicket) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/helpdesk/tickets/${editingTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority.toUpperCase(),
          status: editStatus === "in_progress" ? "IN_PROGRESS" : editStatus.toUpperCase(),
          categoryId: editCategory || undefined,
        }),
      });
      if (res.ok) {
        setTickets((prev) => prev.map((t) =>
          t.id === editingTicket.id ? {
            ...t,
            title: editTitle,
            description: editDescription,
            priority: editPriority,
            status: editStatus,
            category: { ...t.category, name: categories.find((c) => c.id === editCategory)?.name || t.category.name },
          } : t
        ));
      }
      setEditingTicket(null);
    } catch (err) {
      console.error("Failed to update ticket", err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = tickets.filter((t) =>
    t.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tickets.length,
    urgent: tickets.filter((t) => t.priority === "urgent").length,
    high: tickets.filter((t) => t.priority === "high").length,
    medium: tickets.filter((t) => t.priority === "medium").length,
    low: tickets.filter((t) => t.priority === "low").length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
  };

  if (loading) {
    return (
      <DashboardLayout title="Today's Tickets" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Today's Tickets" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Today's Tickets</h2>
          <p className="text-muted-foreground text-sm">Tickets created today — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-gray-700" },
            { label: "Urgent", value: stats.urgent, color: "text-red-600" },
            { label: "High", value: stats.high, color: "text-orange-600" },
            { label: "Medium", value: stats.medium, color: "text-yellow-600" },
            { label: "Low", value: stats.low, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-lg p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, title or company..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Clock className="h-10 w-10" />
            <p className="text-sm">No tickets created today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm truncate">{ticket.title}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{ticket.ticket_id}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium"
                        style={{
                          borderColor: ticket.category.color + "40",
                          backgroundColor: ticket.category.color + "15",
                          color: ticket.category.color,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                        {ticket.category.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">{ticket.creator.name}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>Super Admin: {timeAgo(ticket.created_at)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs rounded-lg" onClick={(e) => { e.stopPropagation(); router.push(`/admin/helpdesk/tickets/${ticket.id}`); }}>
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                    {ticket.status === "open" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg" onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id, "in_progress"); }}>
                        <Play className="h-3.5 w-3.5" /> Start
                      </Button>
                    )}
                    {ticket.status === "in_progress" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg text-green-600 border-green-200 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id, "resolved"); }}>
                        <Play className="h-3.5 w-3.5" /> Resolve
                      </Button>
                    )}
                    {ticket.status === "resolved" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg" onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id, "closed"); }}>
                        <Play className="h-3.5 w-3.5" /> Close
                      </Button>
                    )}
                    {ticket.status === "closed" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); changeStatus(ticket.id, "open"); }}>
                        <Play className="h-3.5 w-3.5" /> Re-open
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg" onClick={(e) => { e.stopPropagation(); setEditingTicket(ticket); setEditTitle(ticket.title); setEditCategory(ticket.category.id); setEditPriority(ticket.priority); setEditStatus(ticket.status); setEditDescription(ticket.description); }}>
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); deleteTicket(ticket.id, ticket.ticket_id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingTicket(null)}>
          <div className="bg-card border rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit Ticket — {editingTicket.ticket_id}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-background" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-background min-h-[80px]" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-background" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-background" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1 bg-background" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setEditingTicket(null)}>Cancel</Button>
              <Button size="sm" disabled={updating} onClick={saveEdit}>
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
