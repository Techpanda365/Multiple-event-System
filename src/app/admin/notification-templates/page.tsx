"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Megaphone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotifTemplate {
  subject: string;
  module: string;
}

export default function NotificationTemplatesPage() {
  const [userData, setUserData] = useState<any>(null);
  const [channels, setChannels] = useState<string[]>([]);
  const [templates, setTemplates] = useState<NotifTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    Promise.all([
      fetch("/api/checksession").then((r) => r.json()),
      fetch("/api/admin/notification-templates").then((r) => r.json()),
    ]).then(([sessionData, notifData]) => {
      if (sessionData.user) setUserData(sessionData.user);
      setChannels(notifData.channels || []);
      setTemplates(notifData.templates || []);
      if (notifData.channels?.length) setSelectedChannel(notifData.channels[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.module.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const saveTemplates = async (updated: NotifTemplate[]) => {
    const res = await fetch("/api/admin/notification-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates: updated, channels }),
    });
    if (res.ok) setTemplates(updated);
  };

  const deleteTemplate = async (index: number) => {
    const updated = templates.filter((_, i) => i !== index);
    await saveTemplates(updated);
  };

  return (
    <DashboardLayout title="Notification Templates" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Templates</h2>
          <p className="text-muted-foreground text-sm">Manage notification channel templates</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search templates..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)}
            className="flex h-9 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
            {channels.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Templates for {selectedChannel}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Module</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? (
                        <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No templates found</td></tr>
                      ) : (
                        paged.map((tpl, i) => (
                          <tr key={i} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-3 font-medium">{tpl.subject}</td>
                            <td className="py-3 px-3">
                              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{tpl.module}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <button className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"><Edit className="h-3.5 w-3.5" /></button>
                                <button onClick={() => deleteTemplate(i)} className="rounded p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
