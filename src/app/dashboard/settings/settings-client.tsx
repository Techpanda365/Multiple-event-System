"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WorkspaceSettings = {
  name: string;
  slug: string;
  description: string | null;
};

interface Props {
  workspace: WorkspaceSettings;
}

export function SettingsClient({ workspace: initial }: Props) {
  const [workspace, setWorkspace] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setWorkspace(data.workspace);
      setMessage("Settings saved successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your workspace settings and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Workspace Name</label>
              <Input
                value={workspace.name}
                onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Workspace Slug</label>
              <Input
                value={workspace.slug}
                onChange={(e) => setWorkspace({ ...workspace, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Input
                value={workspace.description || ""}
                onChange={(e) => setWorkspace({ ...workspace, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Default Currency</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
                <option>INR - Indian Rupee</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Timezone</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>UTC (Coordinated Universal Time)</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Asia/Kolkata</option>
              </select>
            </div>
            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-destructive"}`}>
                {message}
              </p>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Theme</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Light
                </Button>
                <Button variant="outline" className="flex-1">
                  Dark
                </Button>
                <Button variant="outline" className="flex-1">
                  System
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Primary Color</label>
              <div className="flex gap-2">
                {["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded-full border-2 border-transparent hover:border-foreground"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
