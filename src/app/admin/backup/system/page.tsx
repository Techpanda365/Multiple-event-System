"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Trash2, Database, Loader2, RefreshCw } from "lucide-react";

interface Backup {
  id: string;
  name: string;
  type: string;
  size: string;
  directories: number;
  created_at: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Completed: "text-green-600 bg-green-50 border-green-200",
  Failed: "text-red-600 bg-red-50 border-red-200",
  InProgress: "text-yellow-600 bg-yellow-50 border-yellow-200",
};

export default function BackupSystemPage() {
  const [userData, setUserData] = useState<any>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    try {
      const [sessionData, backupData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/backup").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setBackups(backupData.backups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Manual Backup ${new Date().toLocaleString()}`,
          type: "Full Backup (Database + Files)",
          size: "0 MB",
          directories: 11,
        }),
      });
      const data = await res.json();
      if (data.backup) {
        setBackups((prev) => [data.backup, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filtered = backups.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="System Backup" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Backup" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">System Backup</h2>
            <p className="text-muted-foreground text-sm">Manage system backups and restores</p>
          </div>
          <Button className="gap-1.5" disabled={creating} onClick={createBackup}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Create Backup
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search backups..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1" onClick={fetchBackups}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No backups found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((backup) => (
                  <tr key={backup.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{backup.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{backup.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{backup.size}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(backup.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[backup.status] || statusColors.Completed}`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
