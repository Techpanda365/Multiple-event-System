"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit3, Trash2, Loader2, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#3B82F6", isActive: true });

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/helpdesk/categories").then((r) => r.json()),
    ]).then(([sessionData, catData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      setCategories(catData.categories || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", color: "#3B82F6", isActive: true });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "", color: cat.color, isActive: cat.isActive });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const url = editingId ? `/api/admin/helpdesk/categories/${editingId}` : "/api/admin/helpdesk/categories";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      if (editingId) {
        setCategories((prev) => prev.map((c) => (c.id === editingId ? data.category : c)));
      } else {
        setCategories((prev) => [...prev, data.category]);
      }
      setShowForm(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/helpdesk/categories/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/helpdesk/categories/${id}`, { method: "DELETE" });
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout title="Helpdesk Categories" user={userData}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-muted-foreground text-sm">Manage helpdesk ticket categories</p>
          </div>
          <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Add Category</Button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Color</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No categories found</td></tr>
              ) : filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate">{cat.description}</td>
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 rounded border inline-block align-middle mr-1" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-mono">{cat.color}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className={`relative inline-flex h-5 w-9 items-center rounded-full ${cat.isActive ? "bg-green-500" : "bg-gray-300"}`} onClick={() => toggleActive(cat.id, cat.isActive)}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${cat.isActive ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Edit Category" : "Create Category"}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name <span className="text-destructive">*</span></label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <textarea className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-16 rounded border cursor-pointer" />
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="font-mono" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.name}>{editingId ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
