"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, ArrowUpDown, Download, Loader2 } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  ip: string;
  date: string;
  status: string;
}

type SortDir = "asc" | "desc" | null;

function ipToNum(ip: string) {
  return ip.split(".").reduce((acc, oct) => acc * 256 + parseInt(oct), 0);
}

export default function NewsletterSubscribersPage() {
  const [userData, setUserData] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const fetchSubscribers = async () => {
    try {
      const [sessionData, subData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/cms/newsletter").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setSubscribers(subData.subscribers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const toggleSort = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let sorted = [...filtered];
  if (sortDir === "asc") {
    sorted.sort((a, b) => ipToNum(a.ip) - ipToNum(b.ip));
  } else if (sortDir === "desc") {
    sorted.sort((a, b) => ipToNum(b.ip) - ipToNum(a.ip));
  }

  if (loading) {
    return (
      <DashboardLayout title="Newsletter Subscribers" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Newsletter Subscribers" user={userData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
            <p className="text-muted-foreground text-sm">Manage your newsletter email subscribers</p>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={() => { const csv = "Email,IP,Date,Status\n" + subscribers.map(s => `${s.email},${s.ip},${new Date(s.date).toLocaleDateString()},${s.status}`).join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "subscribers.csv"; a.click(); }}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium cursor-pointer select-none" onClick={toggleSort}>
                  <span className="flex items-center gap-1">
                    IP Address <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No subscribers found</td>
                </tr>
              ) : (
                sorted.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">{sub.email}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{sub.ip}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(sub.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${sub.status === "Active" ? "text-green-600 bg-green-50 border-green-200" : "text-gray-500 bg-gray-50 border-gray-200"}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600">Delete</Button>
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
