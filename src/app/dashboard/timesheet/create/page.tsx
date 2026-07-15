"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Clock } from "lucide-react";

export default function CreateTimesheetPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const [form, setForm] = useState({
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    notes: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.weekStart || !form.weekEnd) { setError("Week start and end dates are required"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: form.weekStart,
          weekEnd: form.weekEnd,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create timesheet"); return; }
      router.push("/dashboard/timesheet");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Timesheet">
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/timesheet")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Timesheet</h1><p className="text-sm text-muted-foreground">Start a new weekly timesheet</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" />Timesheet Period</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Week Start <span className="text-destructive">*</span></label>
                <Input type="date" value={form.weekStart} onChange={(e) => set("weekStart", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Week End <span className="text-destructive">*</span></label>
                <Input type="date" value={form.weekEnd} onChange={(e) => set("weekEnd", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
                placeholder="Any notes for this period..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-muted-foreground">
              After creating, you can add daily time entries with hours, project, and task.
            </p>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/timesheet")} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Creating..." : "Create Timesheet"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
