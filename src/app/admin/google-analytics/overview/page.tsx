"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Eye, Settings } from "lucide-react";

export default function OverviewPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/checksession")
      .then((r) => r.json())
      .then((data) => { if (data.user) setUserData(data.user); })
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout title="Overview" user={userData}>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">Google Analytics configuration is required. Please configure your Google Analytics settings.</p>
        <Button className="gap-2" onClick={() => router.push("/admin/settings")}><Settings className="h-4 w-4" /> Configure Google Analytics</Button>
      </div>
    </DashboardLayout>
  );
}
