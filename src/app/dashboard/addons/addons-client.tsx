"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Lock, Unlock } from "lucide-react";

type Addon = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  installed: boolean;
  premium: boolean;
};

interface Props {
  addons: Addon[];
}

export function AddonsClient({ addons: initialAddons }: Props) {
  const [addons, setAddons] = useState(initialAddons);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleInstall = async (addon: Addon) => {
    if (addon.installed) return;
    setLoadingId(addon.id);
    try {
      const res = await fetch(`/api/addons/${addon.id}`, { method: "POST" });
      if (!res.ok) return;
      setAddons((prev) =>
        prev.map((a) => (a.id === addon.id ? { ...a, installed: true } : a))
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <DashboardLayout title="Add-ons">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Add-ons Marketplace</h2>
          <p className="text-muted-foreground">Extend your platform with powerful add-ons</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {addons.map((addon) => (
            <Card key={addon.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Puzzle className="h-5 w-5 text-primary" />
                  </div>
                  {addon.premium && <Lock className="h-4 w-4 text-muted-foreground" />}
                  {addon.installed && <Unlock className="h-4 w-4 text-success" />}
                </div>
                <CardTitle className="text-sm mt-3">{addon.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{addon.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">${addon.price}/mo</span>
                  <Button
                    size="sm"
                    variant={addon.installed ? "secondary" : "default"}
                    disabled={addon.installed || loadingId === addon.id}
                    onClick={() => toggleInstall(addon)}
                  >
                    {addon.installed ? "Installed" : loadingId === addon.id ? "Installing..." : "Install"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
