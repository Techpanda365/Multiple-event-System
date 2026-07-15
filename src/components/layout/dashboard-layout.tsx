// components/layout/dashboard-layout.tsx
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useDashboardSession } from "@/contexts/dashboard-session";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  user?: { id?: string; name?: string | null; email?: string; role?: string; phone?: string | null; image?: string | null } | null;
}

function DashboardLayout({ children, title = "Dashboard", user: userProp }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sessionUser = useDashboardSession();
  const user = userProp ?? sessionUser;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <div className="flex flex-1 flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} user={user} />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export { DashboardLayout };
export default DashboardLayout;