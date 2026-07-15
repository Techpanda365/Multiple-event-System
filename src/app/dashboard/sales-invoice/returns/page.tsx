// app/dashboard/sales-invoice/returns/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Warehouse,
  User,
  Calendar,
  Package,
  XCircle
} from "lucide-react";

interface SalesReturn {
  id: string;
  returnNumber: string;
  customerName: string;
  warehouseName?: string;
  returnDate: string;
  status: string;
  totalAmount?: number;
  items?: any[];
}

const statusColors: Record<string, string> = {
  draft: "text-gray-700 bg-gray-50 border-gray-200",
  pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  approved: "text-blue-700 bg-blue-50 border-blue-200",
  rejected: "text-red-700 bg-red-50 border-red-200",
  completed: "text-green-700 bg-green-50 border-green-200"
};

const statusIcons: Record<string, any> = {
  draft: Clock,
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle
};

export default function SalesReturnsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<SalesReturn[]>([]);

  // Fetch returns from API
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/sales/returns");
        if (response.ok) {
          const data = await response.json();
          setReturns(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch returns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const pending = returns.filter(r => r.status === "pending");
    const approved = returns.filter(r => r.status === "approved");
    const rejected = returns.filter(r => r.status === "rejected");
    const completed = returns.filter(r => r.status === "completed");

    return {
      total: returns.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      completed: completed.length,
      totalAmount: returns.reduce((sum, r) => sum + r.totalAmount, 0)
    };
  }, [returns]);

  // Filter and Search
  const filtered = useMemo(() => {
    let result = [...returns];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.returnNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.warehouseName || '').toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [search, returns]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this return?")) return;
    try {
      const response = await fetch(`/api/sales/returns/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setReturns(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete return:", error);
    }
  };

  return (
    <DashboardLayout title="Manage Sales Returns">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Sales Returns</h1>
            <p className="text-sm text-muted-foreground">Manage and track all sales returns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-2" onClick={() => router.push("/dashboard/sales-invoice/returns/create")}>
              <Plus className="h-4 w-4" /> Create Return
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <RotateCcw className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by return number, customer..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <select
            className="h-9 px-3 rounded-lg border bg-background text-sm"
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Return Number</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Customer</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Warehouse</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Return Date</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total Amount</th>
                    <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Items</th>
                    <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Status</th>
                    <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading returns...</p>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <RotateCcw className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No returns found</p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => router.push("/dashboard/sales-invoice/returns/create")}
                        >
                          Create your first return
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((returnItem) => {
                      const statusKey = returnItem.status?.toLowerCase() || 'draft';
                      const StatusIcon = statusIcons[statusKey] || Clock;
                      return (
                        <tr key={returnItem.id} className="border-b border-border hover:bg-muted/5">
                          <td className="p-3 font-mono text-xs font-medium">{returnItem.returnNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{returnItem.customerName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Warehouse className="h-3.5 w-3.5" />
                              {returnItem.warehouseName || '-'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-muted-foreground">{new Date(returnItem.returnDate).toLocaleDateString()}</span>
                          </td>
                          <td className="p-3 text-right font-semibold">
                            ${(returnItem.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-center">{returnItem.items?.length || 0}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[statusKey] || 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => router.push(`/dashboard/sales-invoice/returns/${returnItem.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 text-xs"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-sm text-muted-foreground">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 text-xs"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}