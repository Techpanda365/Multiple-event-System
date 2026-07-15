"use client";

import { useMemo, useState } from "react";
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type Lead = {
  id: string;
  title: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  value: number | null;
  status: string;
  source: string | null;
  assignedTo: string | null;
  createdAt: string;
};

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  NEW: "default",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  PROPOSAL: "default",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "destructive",
};

const emptyForm = {
  title: "",
  company: "",
  email: "",
  phone: "",
  value: "",
  source: "",
  status: "NEW",
  assignedTo: "",
};

function formatCurrency(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

interface Props {
  initialLeads: Lead[];
  user?: { name?: string | null; image?: string | null; email?: string };
}

export function LeadsClient({ initialLeads, user }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        lead.title.toLowerCase().includes(q) ||
        (lead.company?.toLowerCase().includes(q) ?? false) ||
        (lead.email?.toLowerCase().includes(q) ?? false);
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (lead: Lead) => {
    setForm({
      title: lead.title,
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      value: lead.value != null ? String(lead.value) : "",
      source: lead.source || "",
      status: lead.status,
      assignedTo: lead.assignedTo || "",
    });
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        value: form.value ? Number(form.value) : null,
      };
      const res = await fetch(editingId ? `/api/crm/leads/${editingId}` : "/api/crm/leads", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save lead");

      if (editingId) {
        setLeads((prev) => prev.map((l) => (l.id === editingId ? { ...l, ...data } : l)));
      } else {
        setLeads((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save lead");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const res = await fetch(`/api/crm/leads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete lead");
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <DashboardLayout user={user} title="Leads">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Leads</h2>
            <p className="text-muted-foreground">Track and manage potential customers</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{editingId ? "Edit Lead" : "New Lead"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input placeholder="Lead title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input placeholder="Value (USD)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                <Input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                <Input placeholder="Assigned to" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
                <select
                  className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
                <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
                  <Button type="submit" disabled={loading}>{loading ? "Saving..." : editingId ? "Update Lead" : "Create Lead"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leads..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select
            className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">All Leads ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Lead</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Value</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Source</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Assigned</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">No leads found. Add your first lead.</td>
                    </tr>
                  ) : (
                    filtered.map((lead) => (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{lead.title}</td>
                        <td className="py-3 px-2 text-muted-foreground">{lead.company || "—"}</td>
                        <td className="py-3 px-2">
                          <div>{lead.email || "—"}</div>
                          <div className="text-xs text-muted-foreground">{lead.phone || ""}</div>
                        </td>
                        <td className="py-3 px-2">{formatCurrency(lead.value)}</td>
                        <td className="py-3 px-2">{lead.source || "—"}</td>
                        <td className="py-3 px-2">
                          <Badge variant={statusColors[lead.status] || "default"}>{lead.status.replace("_", " ")}</Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{lead.assignedTo || "—"}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(lead)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
