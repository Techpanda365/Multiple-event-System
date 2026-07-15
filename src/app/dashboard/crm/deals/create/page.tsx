"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateDealPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", price: "", phone: "", clients: "", priority: "medium",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const priorityMap: Record<string, number> = { low: 25, medium: 50, high: 75 };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) { setError("Deal name is required"); return; }
    if (!form.clients.trim()) { setError("Client is required"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.clients.trim(),
          phone: form.phone.trim() || null,
          value: form.price ? Number(form.price) : 0,
          stage: "lead",
          probability: priorityMap[form.priority] || 50,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create deal"); return; }
      router.push("/dashboard/crm/deals");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Create Deal">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/crm/deals")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Create Deal</h1><p className="text-sm text-muted-foreground">Add a new deal to the pipeline</p></div>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Deal Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Deal Name <span className="text-destructive">*</span></label>
              <Input placeholder="Enter Deal Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price <span className="text-destructive">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input type="number" min={0} placeholder="0" className="pl-7" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone No</label>
              <Input placeholder="+1234567890" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Clients <span className="text-destructive">*</span></label>
              <Input placeholder="Enter client name" value={form.clients} onChange={(e) => set("clients", e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deal Priority</label>
              <div className="flex gap-4">
                {[
                  { value: "low", label: "Low Priority", color: "bg-green-500" },
                  { value: "medium", label: "Medium Priority", color: "bg-yellow-500" },
                  { value: "high", label: "High Priority", color: "bg-red-500" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="priority" checked={form.priority === opt.value}
                      onChange={() => set("priority", opt.value)} className="accent-primary" />
                    <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard/crm/deals")} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Save Deal"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
