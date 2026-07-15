"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, Pencil, Trash2, X, Check, XCircle, Loader2 } from "lucide-react";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  lastUpdated: string;
  status: boolean | string;
}

export default function CustomPagesPage() {
  const [userData, setUserData] = useState<any>(null);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewPage, setViewPage] = useState<CustomPage | null>(null);
  const [form, setForm] = useState({
    active: true,
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    content: "",
  });

  const fetchPages = async () => {
    try {
      const [sessionData, pagesData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/cms/custom-pages").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setPages(pagesData.pages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editId ? prev.slug : slugify(value),
    }));
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ active: true, title: "", slug: "", metaTitle: "", metaDescription: "", content: "" });
    setShowForm(true);
  };

  const openEdit = (page: CustomPage) => {
    setEditId(page.id);
    setForm({
      active: page.status === true || page.status === "active",
      title: page.title,
      slug: page.slug,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      content: page.content || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        content: form.content,
        status: form.active ? "active" : "inactive",
      };

      if (editId) {
        await fetch("/api/admin/cms/custom-pages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        await fetch("/api/admin/cms/custom-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await fetchPages();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    try {
      await fetch("/api/admin/cms/custom-pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, _deleted: true }),
      });
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Custom Pages" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Custom Pages" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Custom Pages</h2>
            <p className="text-muted-foreground text-sm">Manage your custom CMS pages</p>
          </div>
          <Button size="icon" className="h-9 w-9" onClick={openCreate}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Last Updated</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No pages found</td>
                </tr>
              ) : (
                filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{page.title}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">/{page.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(page.lastUpdated).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${page.status === true || page.status === "active" ? "text-green-600 bg-green-50 border-green-200" : "text-gray-500 bg-gray-50 border-gray-200"}`}>
                        {page.status === true || page.status === "active" ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {page.status === true || page.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setViewPage(page)}><Eye className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(page)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" onClick={() => deletePage(page.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8" onClick={() => setShowForm(false)}>
            <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">{editId ? "Edit Page" : "Create Page"}</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Title *</label>
                    <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Page title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Slug *</label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="page-slug" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Meta Title</label>
                  <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO title" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Meta Description</label>
                  <textarea className="flex min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO description" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Content</label>
                  <textarea className="flex min-h-[200px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="HTML content..." />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pageActive" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary" />
                  <label htmlFor="pageActive" className="text-sm">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button disabled={saving || !form.title || !form.slug} onClick={handleSave}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {editId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewPage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewPage(null)}>
            <div className="bg-card border rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card">
                <h3 className="font-semibold">{viewPage.title}</h3>
                <Button variant="ghost" size="sm" onClick={() => setViewPage(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="p-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: viewPage.content }} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
