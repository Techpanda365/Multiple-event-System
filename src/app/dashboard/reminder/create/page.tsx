"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Bell } from "lucide-react";

const PRIORITIES = ["low", "medium", "high"];

export default function CreateReminderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", dueDate: "", priority: "medium", assignedTo: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) { setError("Reminder title is required"); return; }
    if (!form.dueDate) { setError("Due date is required"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          dueDate: form.dueDate,
          priority: form.priority,
          assignedTo: form.assignedTo.trim() || null,
          status: "pending",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create reminder"); return; }
      router.push("/dashboard/reminder/create");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Reminder">
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Reminder</h1><p className="text-sm text-muted-foreground">Set a new reminder</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Bell className="h-4 w-4" />Reminder Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Follow up with client" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
                placeholder="Additional details..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Due Date <span className="text-destructive">*</span></label>
                <Input type="datetime-local" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Priority</label>
                <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assigned To</label>
              <Input placeholder="Team member name" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Create Reminder"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
