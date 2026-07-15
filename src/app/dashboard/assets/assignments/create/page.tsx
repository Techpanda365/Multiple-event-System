"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: Date) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState<{ id: string; name: string; serialNumber: string | null }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [form, setForm] = useState({
    assetId: "", assetName: "", assetDisplay: "",
    userId: "", assignedTo: "", userDisplay: "",
    assignedDate: new Date().toISOString().split("T")[0],
    expectedReturn: "", condition: "Excellent", notes: "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/assets").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setAssets(d.map((a: { id: string; name: string; serialNumber?: string }) => ({ id: a.id, name: a.name, serialNumber: a.serialNumber || null })));
    }).catch(() => {});
    fetch("/api/users").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setUsers(d.map((u: { id: string; name: string; email: string }) => ({ id: u.id, name: u.name, email: u.email })));
    }).catch(() => {});
  }, []);

  function handleAssetChange(value: string) {
    const asset = assets.find((a) => a.id === value);
    set("assetId", value);
    set("assetName", asset?.name || "");
    set("assetDisplay", asset ? `${asset.name} (${asset.serialNumber || "N/A"})` : "");
  }

  function handleUserChange(value: string) {
    const user = users.find((u) => u.id === value);
    set("userId", value);
    set("assignedTo", user?.name || "");
    set("userDisplay", user ? `${user.name} (${user.email})` : "");
  }

  const handleSubmit = async () => {
    setError("");
    if (!form.assetName) { setError("Please select an asset"); return; }
    if (!form.assignedTo) { setError("Please select a user"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/assets/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: form.assetId || null,
          assetName: form.assetName,
          assignedTo: form.assignedTo,
          assignedDate: form.assignedDate,
          expectedReturn: form.expectedReturn || null,
          condition: form.condition,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create"); return; }
      router.push("/dashboard/assets/assignments");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Assignment">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/assets/assignments")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Assignment</h1><p className="text-sm text-muted-foreground">Assign an asset to a user</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Assignment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Asset <span className="text-destructive">*</span></label>
              <select value={form.assetId} onChange={(e) => handleAssetChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.serialNumber || "N/A"})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assign To <span className="text-destructive">*</span></label>
              <select value={form.userId} onChange={(e) => handleUserChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assigned Date <span className="text-destructive">*</span></label>
              <div className="h-9 flex items-center px-3 rounded-md border border-input bg-background text-sm">
                {formatDate(new Date(form.assignedDate))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expected Return Date</label>
              <input type="date" value={form.expectedReturn} onChange={(e) => set("expectedReturn", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Condition on Assignment <span className="text-destructive">*</span></label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assignment Notes</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Enter any notes about this assignment"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/assets/assignments")} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Create"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
