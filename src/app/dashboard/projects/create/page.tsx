"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Users, Calendar, DollarSign, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CreateProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "PLANNING",
    users: [] as string[],
  });

  const set = (k: string, v: string | string[]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) { 
      setError("Project name is required"); 
      return; 
    }

    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          budget: form.budget ? Number(form.budget) : 0,
          status: form.status,
          users: form.users,
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.error || "Failed to create project"); 
        return; 
      }
      router.push("/dashboard/projects");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  // Handle user selection
  const handleAddUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (userId && !form.users.includes(userId)) {
      set("users", [...form.users, userId]);
    }
    e.target.value = ""; // Reset select
  };

  const handleRemoveUser = (userId: string) => {
    set("users", form.users.filter((u) => u !== userId));
  };

  return (
    <DashboardLayout title="Create Project">
      <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/dashboard/projects")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Project</h1>
            <p className="text-sm text-muted-foreground">Add a new project to your workspace</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="h-11"
              />
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Users - Using native select with multi-select capability */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Users</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <div className="border rounded-md p-2 pl-9 min-h-[44px] bg-background">
                  {/* Selected Users */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.users.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Select users</span>
                    ) : (
                      form.users.map((user) => (
                        <Badge key={user} variant="secondary" className="text-sm">
                          {user}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive focus:outline-none"
                            onClick={() => handleRemoveUser(user)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  {/* User Select Dropdown */}
                  <select
                    className="w-full bg-transparent border-0 outline-none text-sm"
                    onChange={handleAddUser}
                    value=""
                  >
                    <option value="">Add user...</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Sarah Williams">Sarah Williams</option>
                    <option value="David Brown">David Brown</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-semibold">Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  placeholder="Enter project description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Hidden Status Field */}
            <input type="hidden" value={form.status} />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/projects")} 
            disabled={saving}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
            className="h-11 px-6"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}