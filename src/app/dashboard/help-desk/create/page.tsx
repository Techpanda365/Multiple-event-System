"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Headphones } from "lucide-react";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function CreateTicketPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", priority: "MEDIUM", creatorName: "", creatorEmail: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.creatorName.trim()) { setError("Your name is required"); return; }

    setSaving(true);
    try {
      const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const res = await fetch("/api/helpdesk/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          creatorName: form.creatorName.trim(),
          creatorEmail: form.creatorEmail.trim() || null,
          status: "OPEN",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit ticket"); return; }
      router.push("/dashboard/help-desk");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Support Ticket">
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/help-desk")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Support Ticket</h1><p className="text-sm text-muted-foreground">Submit a new support request</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Headphones className="h-4 w-4" />Ticket Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Your Name <span className="text-destructive">*</span></label>
                <Input placeholder="John Doe" value={form.creatorName} onChange={(e) => set("creatorName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Your Email</label>
                <Input type="email" placeholder="you@example.com" value={form.creatorEmail} onChange={(e) => set("creatorEmail", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <Input placeholder="Brief description of the issue" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5}
                placeholder="Explain the issue in detail..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/help-desk")} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
