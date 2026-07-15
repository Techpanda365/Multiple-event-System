"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Addon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isPremium: boolean;
  isActive: boolean;
  _count: { subscriptions: number };
}

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/addons")
      .then((r) => r.json())
      .then((data) => setAddons(data.addons || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleAddon = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/addons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setAddons((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !current } : a)));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Add-ons Management</h2>
          <p className="text-muted-foreground">Manage all system add-ons and their subscriptions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">All Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Add-on</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Price</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Active Workspaces</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addons.map((a) => (
                      <tr key={a.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <p className="font-medium">{a.name}</p>
                          {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                        </td>
                        <td className="py-3 px-2">${a.price}/mo</td>
                        <td className="py-3 px-2">{a._count?.subscriptions ?? 0}</td>
                        <td className="py-3 px-2">
                          <span className={a.isActive ? "text-green-600 font-medium" : "text-muted-foreground"}>
                            {a.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Button size="sm" variant="outline" onClick={() => toggleAddon(a.id, a.isActive)}>
                            {a.isActive ? "Disable" : "Enable"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
