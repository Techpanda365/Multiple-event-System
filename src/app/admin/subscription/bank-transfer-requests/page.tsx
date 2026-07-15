"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, CheckCircle, XCircle, Banknote, Loader2 } from "lucide-react";

interface TransferRequest {
  id: string;
  company: string;
  plan: string;
  amount: string;
  orderNumber: string;
  date: string;
  file: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Approved: "text-green-600 bg-green-50 border-green-200",
  Rejected: "text-red-600 bg-red-50 border-red-200",
};

export default function BankTransferRequestsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async () => {
    try {
      const [sessionData, subsData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/subscriptions").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      const allSubs = subsData.subscriptions || [];
      const bankTransfers = allSubs.filter((s: any) => s.paymentMethod === "bank_transfer" || s.paymentMethod === "Bank Transfer");
      setRequests(bankTransfers.map((s: any) => ({
        id: s.id,
        company: s.companyName || s.company || "N/A",
        plan: s.planName || s.plan || "N/A",
        amount: s.amount ? `$${s.amount}` : "N/A",
        orderNumber: s.orderNumber || s.order_id || "N/A",
        date: s.createdAt || s.date || new Date().toISOString(),
        file: s.attachment || s.receipt || "",
        status: s.status === "active" ? "Approved" : s.status === "pending" ? "Pending" : s.status || "Pending",
      })));
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus === "Approved" ? "active" : newStatus === "Rejected" ? "cancelled" : "pending" }),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = requests.filter((r) =>
    r.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Bank Transfer Requests" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bank Transfer Requests" user={userData}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Bank Transfer Requests</h2>
          <p className="text-muted-foreground text-sm">Review and manage subscription payments via bank transfer</p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, plan or order..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Banknote className="h-10 w-10" />
            <p className="text-sm">No bank transfer requests found</p>
          </div>
        ) : (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Company</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Order #</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{req.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{req.plan}</td>
                    <td className="px-4 py-3">{req.amount}</td>
                    <td className="px-4 py-3 font-mono text-xs">{req.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[req.status] || statusColors.Pending}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "Pending" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600 gap-1" onClick={() => updateStatus(req.id, "Approved")}>
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 gap-1" onClick={() => updateStatus(req.id, "Rejected")}>
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      )}
                      {req.file && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                          <Eye className="h-3 w-3" /> View Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
