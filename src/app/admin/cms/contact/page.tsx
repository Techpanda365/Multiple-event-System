"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

export default function ContactPage() {
  const [content, setContent] = useState({ email: "", phone: "", address: "", mapEmbed: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms/contact")
      .then(r => r.json())
      .then(res => { if (res.content) setContent(res.content); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/cms/contact", {
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
            <h2 className="text-2xl font-bold">Contact Page</h2>
            <p className="text-muted-foreground">Edit contact information</p>
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
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={content.email} onChange={e => setContent({ ...content, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={content.phone} onChange={e => setContent({ ...content, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea rows={3} value={content.address} onChange={e => setContent({ ...content, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Google Maps Embed URL</label>
                <Input value={content.mapEmbed} onChange={e => setContent({ ...content, mapEmbed: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
