"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Save, Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<BlogPost>({
    id: "", title: "", slug: "", excerpt: "", content: "", author: "", published: false, createdAt: ""
  });

  useEffect(() => {
    fetch("/api/admin/cms/blogs")
      .then(r => r.json())
      .then(res => { if (Array.isArray(res.blogs)) setBlogs(res.blogs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const res = await fetch("/api/admin/cms/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    if (res.ok) {
      const data = await res.json();
      setBlogs([data.blog, ...blogs]);
      setShowForm(false);
      setEdit({ id: "", title: "", slug: "", excerpt: "", content: "", author: "", published: false, createdAt: "" });
    }
  };

  const removeBlog = (id: string) => {
    setBlogs(blogs.filter(b => b.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Blogs</h2>
            <p className="text-muted-foreground">Manage blog posts</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />New Post
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>New Blog Post</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} />
              <Input placeholder="Slug" value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} />
              <Input placeholder="Author" value={edit.author} onChange={e => setEdit({ ...edit, author: e.target.value })} />
              <Textarea placeholder="Excerpt" rows={2} value={edit.excerpt} onChange={e => setEdit({ ...edit, excerpt: e.target.value })} />
              <Textarea placeholder="Content (HTML)" rows={8} value={edit.content} onChange={e => setEdit({ ...edit, content: e.target.value })} />
              <div className="flex gap-2">
                <Button onClick={save}><Save className="h-4 w-4 mr-1" />Publish</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : blogs.length === 0 ? (
          <Card><CardContent className="text-center py-12"><p className="text-muted-foreground">No blog posts yet</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog) => (
              <Card key={blog.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{blog.title || "Untitled"}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">{blog.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{blog.author || "Anonymous"}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={blog.published ? "default" : "secondary"}>{blog.published ? "Published" : "Draft"}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeBlog(blog.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
