"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Edit2, Trash2, MoreHorizontal, Filter, Tags, X, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Deal = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  value: number | null;
  stage: string;
  probability: number;
  source: string | null;
  assignedTo: string | null;
  notes: string | null;
  closedAt: string | null;
  createdAt: string;
};

const stageColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  lead: "secondary",
  qualified: "default",
  proposal: "default",
  negotiation: "warning",
  closed_won: "success",
  closed_lost: "destructive",
};

function formatCurrency(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
}

function formatStage(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [viewDeal, setViewDeal] = useState<Deal | null>(null);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [editForm, setEditForm] = useState({ name: "", stage: "", status: "" });
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [labelsDeal, setLabelsDeal] = useState<Deal | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  useEffect(() => {
    fetch('/api/crm/deals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDeals(data);
      })
      .catch(() => setDeals([]));
  }, []);

  const filtered = useMemo(() => {
    let data = deals;
    const q = search.toLowerCase();
    if (q) data = data.filter((d) => d.name.toLowerCase().includes(q));
    if (pipelineFilter !== "All") data = data.filter((d) => d.source === pipelineFilter);
    if (stageFilter) data = data.filter((d) => d.stage === stageFilter);
    return data;
  }, [deals, search, pipelineFilter, stageFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function openEdit(deal: Deal) {
    setEditDeal(deal);
    setEditForm({ name: deal.name, stage: deal.stage, status: deal.probability >= 100 ? "Won" : deal.stage === "closed_lost" ? "Loss" : "Active" });
  }

  async function saveEdit() {
    if (!editDeal) return;
    const status = editForm.status;
    const stage = status === "Won" ? "closed_won" : status === "Loss" ? "closed_lost" : editForm.stage;
    const probability = status === "Won" ? 100 : status === "Loss" ? 0 : (editDeal.probability || 50);
    try {
      const res = await fetch(`/api/crm/deals/${editDeal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, stage, probability }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setDeals((prev) => prev.map((d) => d.id === editDeal.id ? { ...d, ...updated } : d));
      showToast("Deal updated");
      setEditDeal(null);
    } catch {
      showToast("Failed to update deal");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/crm/deals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeals((prev) => prev.filter((d) => d.id !== id));
      setDeleteId(null);
      showToast("Deal deleted");
    } catch {
      showToast("Failed to delete deal");
    }
  }

  return (
    <DashboardLayout title="Deals">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-sm text-white bg-green-600">{toast}</div>}
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Deals</h1>
            <p className="text-sm text-muted-foreground">Track your sales pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={pipelineFilter} onChange={(e) => { setPipelineFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Sources</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
            </select>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                Table
              </button>
              <button onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                Kanban
              </button>
            </div>
            <Link href="/dashboard/crm/deals/create" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" /> Create Deal
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search Deals..." className="pl-9"
              value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 border rounded-lg bg-muted/10">
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Stages</option>
              {["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"].map((s) => (
                <option key={s} value={s}>{formatStage(s)}</option>
              ))}
            </select>
          </div>
        )}

        {viewMode === "table" ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Name</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Company</th>
                      <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Value</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Stage</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Probability</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No deals found</td></tr>
                    ) : (
                      paginated.map((deal, idx) => (
                        <tr key={deal.id} className={`border-b border-border last:border-0 hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 font-medium">{deal.name}</td>
                          <td className="p-3 text-muted-foreground">{deal.company || "—"}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(deal.value)}</td>
                          <td className="p-3">
                            <Badge variant={stageColors[deal.stage] || "outline"}>{formatStage(deal.stage)}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-sm font-medium ${deal.probability >= 100 ? "text-green-600" : deal.probability <= 0 ? "text-red-600" : ""}`}>
                              {deal.probability}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[140px]">
                                <DropdownMenuItem onClick={() => setViewDeal(deal)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(deal)}><Edit2 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setLabelsDeal(deal); setSelectedLabels([]); }}>
                                  <Tags className="h-4 w-4 mr-2" /> Labels
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(deal.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"].map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage);
              return (
                <div key={stage} className="bg-muted/20 rounded-lg border border-border">
                  <div className="p-3 border-b border-border">
                    <h3 className="text-sm font-semibold">{formatStage(stage)}</h3>
                    <p className="text-xs text-muted-foreground">{stageDeals.length} deals</p>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {stageDeals.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No deals</p>
                    ) : (
                      stageDeals.map((deal) => (
                        <div key={deal.id} className="bg-background rounded-lg border border-border p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium leading-tight">{deal.name}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[130px]">
                                <DropdownMenuItem onClick={() => setViewDeal(deal)}><Eye className="h-3 w-3 mr-2" /> View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(deal)}><Edit2 className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setLabelsDeal(deal); setSelectedLabels([]); }}>
                                  <Tags className="h-3 w-3 mr-2" /> Labels
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(deal.id)}>
                                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-base font-bold">{formatCurrency(deal.value)}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Probability: {deal.probability}%</span>
                            <Badge variant={stageColors[deal.stage] || "default"} className="text-[10px] px-1.5 py-0">{formatStage(deal.stage)}</Badge>
                          </div>
                          {deal.company && <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">{deal.company}</span>}
                          {stage !== "closed_won" && stage !== "closed_lost" && (
                            <button
                              onClick={async () => {
                                const stages = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
                                const idx = stages.indexOf(deal.stage);
                                if (idx < stages.length - 1) {
                                  const nextStage = stages[idx + 1];
                                  try {
                                    const res = await fetch(`/api/crm/deals/${deal.id}`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ stage: nextStage }),
                                    });
                                    if (!res.ok) throw new Error();
                                    const updated = await res.json();
                                    setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, ...updated } : d));
                                    showToast(`Moved to ${formatStage(nextStage)}`);
                                  } catch {
                                    showToast("Failed to move stage");
                                  }
                                }
                              }}
                              className="w-full text-xs text-primary hover:text-primary/80 py-1 border-t border-border mt-1 pt-1 text-center"
                            >
                              Move to Next Stage →
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "table" && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{itemsPerPage} per page</span>
              <select className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
                value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
              <span className="text-sm text-muted-foreground ml-2">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewDeal(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Deal Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewDeal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Name</span><p className="font-medium">{viewDeal.name}</p></div>
                <div><span className="text-muted-foreground">Company</span><p className="font-medium">{viewDeal.company || "—"}</p></div>
                <div><span className="text-muted-foreground">Value</span><p className="font-medium">{formatCurrency(viewDeal.value)}</p></div>
                <div><span className="text-muted-foreground">Stage</span><p>{formatStage(viewDeal.stage)}</p></div>
                <div><span className="text-muted-foreground">Probability</span><p>{viewDeal.probability}%</p></div>
                <div><span className="text-muted-foreground">Assigned To</span><p>{viewDeal.assignedTo || "Unassigned"}</p></div>
                {viewDeal.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes</span><p>{viewDeal.notes}</p></div>}
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <Button variant="outline" onClick={() => setViewDeal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditDeal(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Deal</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditDeal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3">
              <div><label className="text-sm font-medium">Name</label><Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Stage</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.stage} onChange={(e) => setEditForm((f) => ({ ...f, stage: e.target.value }))}>
                    {["lead", "qualified", "proposal", "negotiation"].map((s) => (
                      <option key={s} value={s}>{formatStage(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Won">Won</option>
                    <option value="Loss">Loss</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setEditDeal(null)}>Cancel</Button>
              <Button onClick={saveEdit}><Check className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Labels Modal */}
      {labelsDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setLabelsDeal(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Deal Labels</h2>
              <Button variant="ghost" size="icon" onClick={() => setLabelsDeal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium mb-1">{labelsDeal.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{selectedLabels.length} selected</p>
              <div className="space-y-2">
                {[
                  { key: "High Priority", color: "bg-red-500" },
                  { key: "Medium Priority", color: "bg-yellow-500" },
                  { key: "Low Priority", color: "bg-green-500" },
                  { key: "Follow Up", color: "bg-blue-500" },
                  { key: "Not Interested", color: "bg-gray-500" },
                ].map((lbl) => {
                  const checked = selectedLabels.includes(lbl.key);
                  return (
                    <label key={lbl.key} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => setSelectedLabels((prev) => prev.includes(lbl.key) ? prev.filter((l) => l !== lbl.key) : [...prev, lbl.key])} className="rounded border-gray-300" />
                      <div className={`w-3 h-3 rounded-full ${lbl.color}`} />
                      <span className="text-sm">{lbl.key}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setLabelsDeal(null)}>Cancel</Button>
              <Button onClick={() => { showToast("Labels saved"); setLabelsDeal(null); }}><Check className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <p className="text-sm text-muted-foreground mt-1">Are you sure you want to delete this deal?</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteId)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
