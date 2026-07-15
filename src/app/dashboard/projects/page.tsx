"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, Eye, Pencil, Trash2, Calendar,
  DollarSign, Users, Clock, CheckCircle, AlertCircle,
  XCircle, Loader2, X, FolderKanban,
} from "lucide-react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  budget?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  _count?: { tasks: number; members: number };
};

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  PLANNING:    { label: "Planning",     color: "bg-yellow-500/10 text-yellow-700",  icon: Clock },
  IN_PROGRESS: { label: "In Progress",  color: "bg-blue-500/10 text-blue-700",      icon: Clock },
  ON_HOLD:     { label: "On Hold",      color: "bg-orange-500/10 text-orange-700",  icon: AlertCircle },
  COMPLETED:   { label: "Completed",    color: "bg-green-500/10 text-green-700",    icon: CheckCircle },
  CANCELLED:   { label: "Cancelled",    color: "bg-red-500/10 text-red-700",        icon: XCircle },
};

function formatCurrency(amount?: number | null) {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Delete modal
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [statusFilter]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async () => {
    if (!deleteProject) return;
    setDeleting(true);
    try {
      await fetch(`/api/projects/${deleteProject.id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== deleteProject.id));
      setDeleteProject(null);
    } catch {
      setError("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (project: Project) => {
    setEditProject(project);
    setEditForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
      budget: project.budget,
      endDate: project.endDate?.slice(0, 10) || "",
    });
    setError("");
  };

  const handleSave = async () => {
    if (!editProject) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${editProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setProjects((prev) => prev.map((p) =>
          p.id === editProject.id ? { ...p, ...editForm } : p
        ));
        setEditProject(null);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Projects">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-muted-foreground">{projects.length} total projects</p>
          </div>
          <Link href="/dashboard/projects/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add Project</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All Status</option>
            {Object.entries(statusMap).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={fetchProjects}>Refresh</Button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No projects found</p>
            <Link href="/dashboard/projects/create">
              <Button className="mt-4" size="sm"><Plus className="h-4 w-4 mr-1" />Create First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((project) => {
              const s = statusMap[project.status] || statusMap.PLANNING;
              const Icon = s.icon;
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow border-border/60">
                  <CardContent className="p-5 space-y-3">
                    {/* Status + Actions */}
                    <div className="flex items-start justify-between">
                      <Badge className={`text-xs ${s.color} flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />{s.label}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(project)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteProject(project)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50">
                      <div className="text-center">
                        <DollarSign className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                        <p className="text-xs font-medium truncate">{formatCurrency(project.budget)}</p>
                        <p className="text-[10px] text-muted-foreground">Budget</p>
                      </div>
                      <div className="text-center">
                        <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                        <p className="text-xs font-medium">{project._count?.members ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground">Members</p>
                      </div>
                      <div className="text-center">
                        <CheckCircle className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                        <p className="text-xs font-medium">{project._count?.tasks ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground">Tasks</p>
                      </div>
                    </div>

                    {/* End date */}
                    {project.endDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Due: {new Date(project.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-semibold">Edit Project</h3>
              <button onClick={() => setEditProject(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <select value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Budget</label>
                  <Input type="number" value={editForm.budget || ""} onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={editForm.endDate as string || ""} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 border-t px-5 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditProject(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Delete Project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to delete <strong>{deleteProject.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteProject(null)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
