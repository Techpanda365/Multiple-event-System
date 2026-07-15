"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, Download, XCircle, CheckCircle, Clock, Eye, Loader2 } from "lucide-react";

interface FileShare {
  id: string;
  company: string;
  fileName: string;
  appliedDate: string;
  actionDate: string | null;
  status: string;
}

const statusStyles: Record<string, string> = {
  verified: "text-green-600 bg-green-50 border-green-200",
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  expired: "text-gray-500 bg-gray-50 border-gray-200",
  revoked: "text-red-600 bg-red-50 border-red-200",
};

const statusIcons: Record<string, any> = {
  verified: CheckCircle,
  pending: Clock,
  expired: Shield,
  revoked: XCircle,
};

export default function FileShareVerificationPage() {
  const [userData, setUserData] = useState<any>(null);
  const [shares, setShares] = useState<FileShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const fetchShares = async () => {
    try {
      const [sessionData, sharesData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/file-share").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setShares((sharesData.shares || []).map((s: any) => ({
        ...s,
        status: s.status?.toLowerCase() || "pending",
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/file-share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, actionDate: new Date().toISOString() }),
      });
      if (res.ok) {
        setShares((prev) => prev.map((s) => s.id === id ? { ...s, status, actionDate: new Date().toISOString() } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = shares.filter((s) => {
    const matchesSearch = s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DashboardLayout title="File Share Verification" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="File Share Verification" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">File Share Verification</h2>
          <p className="text-muted-foreground text-sm">Verify and manage file share requests from companies</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company or file..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="h-9 px-3 rounded-lg border bg-background text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Shield className="h-10 w-10" />
              <p className="text-sm">No file share requests found</p>
            </div>
          ) : (
            filtered.map((share) => {
              const StatusIcon = statusIcons[share.status] || Shield;
              return (
                <div key={share.id} className="bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{share.fileName}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyles[share.status] || statusStyles.pending}`}>
                          <StatusIcon className="h-3 w-3" />
                          {share.status.charAt(0).toUpperCase() + share.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{share.company}</span>
                        <span className="mx-1.5 text-muted-foreground/40">•</span>
                        Applied: {new Date(share.appliedDate).toLocaleString()}
                        {share.actionDate && (
                          <>
                            <span className="mx-1.5 text-muted-foreground/40">•</span>
                            Action: {new Date(share.actionDate).toLocaleString()}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {share.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(share.id, "verified")}>
                            <CheckCircle className="h-3.5 w-3.5" /> Verify
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(share.id, "revoked")}>
                            <XCircle className="h-3.5 w-3.5" /> Revoke
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs rounded-lg">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
