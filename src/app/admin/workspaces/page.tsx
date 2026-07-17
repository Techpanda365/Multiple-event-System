"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, X } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { members: number; projects: number; invoices: number };
  plans: { id: string; name: string }[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", memberIds: [] as string[] });
  const [addMemberIds, setAddMemberIds] = useState<string[]>([]);

  const fetchWorkspaces = () => {
    fetch("/api/admin/workspaces")
      .then(async (r) => {
        const text = await r.text();
        console.log("Workspaces API response:", r.status, text.slice(0, 200));
        if (!text) throw new Error("Empty response from server");
        return JSON.parse(text);
      })
      .then((data) => setWorkspaces(data.workspaces || []))
      .catch((err) => console.error("fetchWorkspaces error:", err))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {});
  };

  useEffect(() => { fetchWorkspaces(); }, []);

  useEffect(() => {
    if (showCreate || showAddMember) fetchUsers();
  }, [showCreate, showAddMember]);

  const filtered = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    ws.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    setError("");
    if (!form.name) { setError("Workspace name is required"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description || undefined, memberIds: form.memberIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces((prev) => [data.workspace, ...prev]);
        setShowCreate(false);
        setForm({ name: "", description: "", memberIds: [] });
      } else {
        setError(data.error || "Failed to create workspace");
      }
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleAddMembers = async (workspaceId: string) => {
    if (addMemberIds.length === 0) return;
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addMemberIds }),
      });
      if (res.ok) {
        fetchWorkspaces();
        setShowAddMember(null);
        setAddMemberIds([]);
      }
    } catch {
      // silent
    }
  };

  const toggleMember = (id: string) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) ? prev.memberIds.filter((x) => x !== id) : [...prev.memberIds, id],
    }));
  };

  const toggleAddMember = (id: string) => {
    setAddMemberIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Workspaces</h2>
            <p className="text-muted-foreground">Manage all workspaces in the system</p>
          </div>
          <Button onClick={() => { setError(""); setShowCreate(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Create Workspace
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search workspaces..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">All Workspaces ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Slug</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Users</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plans</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ws) => (
                      <tr key={ws.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{ws.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">{ws.slug}</td>
                        <td className="py-3 px-2">
                          <button onClick={() => { setAddMemberIds([]); setShowAddMember(ws.id); }} className="hover:text-primary transition-colors">
                            {ws._count?.members ?? 0} <span className="text-xs text-muted-foreground">+ add</span>
                          </button>
                        </td>
                        <td className="py-3 px-2">{ws.plans?.length ?? 0}</td>
                        <td className="py-3 px-2">
                          <Badge variant={ws.isActive ? "success" : "secondary"}>{ws.isActive ? "Active" : "Inactive"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!showAddMember} onClose={() => { setShowAddMember(null); setAddMemberIds([]); }} title="Add Members">
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {users.length === 0 && <p className="text-sm text-muted-foreground p-3">No users found</p>}
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer">
                <input type="checkbox" checked={addMemberIds.includes(u.id)} onChange={() => toggleAddMember(u.id)} className="rounded" />
                <span className="text-sm">{u.name || u.email}</span>
                <span className="text-xs text-muted-foreground ml-auto">{u.email}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowAddMember(null); setAddMemberIds([]); }}>Cancel</Button>
            <Button className="flex-1" onClick={() => showAddMember && handleAddMembers(showAddMember)} disabled={addMemberIds.length === 0}>Add Selected</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Workspace">
        <div className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Company" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Members</label>
            <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {users.length === 0 && <p className="text-sm text-muted-foreground p-3">No users found</p>}
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer">
                  <input type="checkbox" checked={form.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} className="rounded" />
                  <span className="text-sm">{u.name || u.email}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{u.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
