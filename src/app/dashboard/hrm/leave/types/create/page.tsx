// src/app/dashboard/hrm/leave/types/create/page.tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateLeaveTypePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    daysAllowed: "",
    color: "#3b82f6",
    isPaid: false,
  });
  const [colorInput, setColorInput] = useState("#3b82f6");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.daysAllowed) {
      setError("Name and max days are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/leave-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, daysAllowed: parseInt(formData.daysAllowed) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create leave type");
      }
      router.push("/dashboard/hrm/leave/types");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hrm/leave/types">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Leave Type</h1>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Enter Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Days Per Year <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={formData.daysAllowed}
                  onChange={(e) => setFormData({ ...formData, daysAllowed: e.target.value })} className="w-full" min="0" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color <span className="text-red-500">*</span></label>
                <div className="flex gap-3 items-center">
                  <input type="color" value={colorInput}
                    onChange={(e) => { setColorInput(e.target.value); setFormData({ ...formData, color: e.target.value }); }}
                    className="w-12 h-10 rounded-md border border-input cursor-pointer p-0.5 bg-transparent" />
                  <Input type="text" placeholder="Enter color hex code (e.g., #3b82f6)" value={colorInput}
                    onChange={(e) => { setColorInput(e.target.value); setFormData({ ...formData, color: e.target.value }); }} className="flex-1" />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">Preview:</span>
                  <div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: colorInput }} />
                  <span className="text-xs font-mono text-muted-foreground">{colorInput}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Is Paid</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPaid ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPaid ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm font-medium">{formData.isPaid ? "Paid Leave" : "Unpaid Leave"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/dashboard/hrm/leave/types")}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
