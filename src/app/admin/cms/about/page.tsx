"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

export default function AboutPage() {
  const [content, setContent] = useState({ title: "", content: "", mission: "", vision: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms/about")
      .then(r => r.json())
      .then(res => { if (res.content) setContent(res.content); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/cms/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">About Page</h2>
            <p className="text-muted-foreground">Edit the About page content</p>
          </div>
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="text-sm font-medium">Page Title</label>
                <Input value={content.title} onChange={e => setContent({ ...content, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">About Content</label>
                <Textarea rows={6} value={content.content} onChange={e => setContent({ ...content, content: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Mission</label>
                <Textarea rows={4} value={content.mission} onChange={e => setContent({ ...content, mission: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Vision</label>
                <Textarea rows={4} value={content.vision} onChange={e => setContent({ ...content, vision: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
