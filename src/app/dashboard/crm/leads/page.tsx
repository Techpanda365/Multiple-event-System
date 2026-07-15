"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Edit2, Trash2, MoreHorizontal, Filter, X, Check, Tags, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Lead = {
  id: string;
  name: string;
  subject: string;
  users: { name: string; initials: string }[];
  usersMore: number;
  tasksDone: number;
  tasksTotal: number;
  followUp: string;
  stage: string;
  pipeline: string;
};



const stageColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  New: "default", Contacted: "secondary", Qualified: "warning", "In Review": "default", Approved: "success", Rejected: "destructive", Unqualified: "destructive",
};

interface LabelItem {
  key: string;
  color: string;
}

const copyToOptions = ["Products", "Sources", "Files", "Discussion", "Notes", "Calls", "Emails"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [labelsList, setLabelsList] = useState<LabelItem[]>([]);

  useEffect(() => {
    fetch('/api/crm/leads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped: Lead[] = data.map((item: any, idx: number) => ({
            id: item.id || String(idx + 1),
            name: item.title || item.company || item.name || 'Unknown',
            subject: item.notes || item.subject || '',
            users: [],
            usersMore: 0,
            tasksDone: 0,
            tasksTotal: 0,
            followUp: item.followUp || '',
            stage: item.status || item.stage || 'New',
            pipeline: item.pipeline || item.source || 'Lead Qualification',
          }));
          setLeads(mapped);
        }
      })
      .catch(() => setLeads([]));

    fetch('/api/crm/lead-labels')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLabelsList(data);
      })
      .catch(() => setLabelsList([]));
  }, []);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [pipelineFilter, setPipelineFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [stageFilter, setStageFilter] = useState("");

  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({ name: "", subject: "", stage: "", followUp: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertForm, setConvertForm] = useState({ dealName: "", price: "", clientType: "existing", clientName: "", clientEmail: "", clientPassword: "", copyTo: [] as string[] });

  const [labelsLead, setLabelsLead] = useState<Lead | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const filtered = useMemo(() => {
    let data = leads;
    const q = search.toLowerCase();
    if (q) data = data.filter((l) => l.name.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q));
    if (pipelineFilter !== "All") data = data.filter((l) => l.pipeline === pipelineFilter);
    if (stageFilter) data = data.filter((l) => l.stage === stageFilter);
    return data;
  }, [leads, search, pipelineFilter, stageFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function openEdit(lead: Lead) {
    setEditLead(lead);
    setEditForm({ name: lead.name, subject: lead.subject, stage: lead.stage, followUp: lead.followUp });
  }

  function saveEdit() {
    if (!editLead) return;
    setLeads((prev) => prev.map((l) => l.id === editLead.id ? { ...l, name: editForm.name, subject: editForm.subject, stage: editForm.stage, followUp: editForm.followUp } : l));
    showToast("Lead updated");
    setEditLead(null);
  }

  function openConvert(lead: Lead) {
    setConvertLead(lead);
    setConvertForm({ dealName: lead.subject, price: "", clientType: "existing", clientName: lead.name, clientEmail: "", clientPassword: "", copyTo: [] });
  }

  function toggleCopyTo(opt: string) {
    setConvertForm((f) => ({ ...f, copyTo: f.copyTo.includes(opt) ? f.copyTo.filter((x) => x !== opt) : [...f.copyTo, opt] }));
  }

  function toggleLabel(label: string) {
    setSelectedLabels((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  }

  return (
    <DashboardLayout title="Leads">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-sm text-white bg-green-600">{toast}</div>}
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Leads</h1>
            <p className="text-sm text-muted-foreground">Lead Qualification</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={pipelineFilter} onChange={(e) => { setPipelineFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Pipelines</option>
              <option value="Sales">Sales</option>
              <option value="Lead Qualification">Lead Qualification</option>
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
            <Link href="/dashboard/crm/leads/create" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" /> Create Lead
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search Name and Subject..." className="pl-9"
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
              {["New", "Contacted", "Qualified", "In Review", "Approved", "Rejected", "Unqualified"].map((s) => (
                <option key={s} value={s}>{s}</option>
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
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Subject</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Users</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Tasks</th>
                      <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Follow Up Date</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Stage</th>
                      <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No leads found</td></tr>
                    ) : (
                      paginated.map((lead, idx) => (
                        <tr key={lead.id} className={`border-b border-border last:border-0 hover:bg-muted/5 ${idx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 font-medium">{lead.name}</td>
                          <td className="p-3 text-muted-foreground">{lead.subject}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {lead.users.slice(0, 3).map((u) => (
                                <span key={u.name} title={u.name}
                                  className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-medium">{u.initials}</span>
                              ))}
                              {lead.usersMore > 0 && <span className="text-xs text-muted-foreground ml-1">+{lead.usersMore}</span>}
                            </div>
                          </td>
                          <td className="p-3 text-center"><span className="text-muted-foreground">{lead.tasksDone}/{lead.tasksTotal}</span></td>
                          <td className="p-3">{lead.followUp}</td>
                          <td className="p-3 text-center">
                            <Badge variant={stageColors[lead.stage] || "outline"}>{lead.stage}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[170px]">
                                <DropdownMenuItem onClick={() => setViewLead(lead)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(lead)}><Edit2 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setLabelsLead(lead); setSelectedLabels([]); }}>
                                  <Tags className="h-4 w-4 mr-2" /> Labels
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openConvert(lead)}>
                                  <ArrowRight className="h-4 w-4 mr-2" /> Convert to Deal
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(lead.id)}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["New", "Contacted", "Qualified", "In Review", "Approved", "Rejected", "Unqualified"].map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              return (
                <div key={stage} className="bg-muted/20 rounded-lg border border-border">
                  <div className="p-3 border-b border-border">
                    <h3 className="text-sm font-semibold">{stage}</h3>
                    <p className="text-xs text-muted-foreground">{stageLeads.length} leads</p>
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {stageLeads.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No leads</p>
                    ) : (
                      stageLeads.map((lead) => (
                        <div key={lead.id} className="bg-background rounded-lg border border-border p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium leading-tight">{lead.name}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[130px]">
                                <DropdownMenuItem onClick={() => setViewLead(lead)}><Eye className="h-3 w-3 mr-2" /> View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(lead)}><Edit2 className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
<DropdownMenuItem onClick={() => { setLabelsLead(lead); setSelectedLabels([]); }}>
                                          <Tags className="h-3 w-3 mr-2" /> Labels
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openConvert(lead)}>
                                          <ArrowRight className="h-3 w-3 mr-2" /> Convert to Deal
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(lead.id)}>
                                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-muted-foreground">{lead.subject}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Tasks: {lead.tasksDone}/{lead.tasksTotal}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {lead.users.slice(0, 2).map((u) => (
                              <span key={u.name} title={u.name}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[8px] font-medium">{u.initials}</span>
                            ))}
                            {lead.usersMore > 0 && <span className="text-[10px] text-muted-foreground">+{lead.usersMore}</span>}
                          </div>
                          {/* Stage advance */}
                          {stage !== "Unqualified" && (
                            <button
                              onClick={() => {
                                const stages = ["New", "Contacted", "Qualified", "In Review", "Approved", "Rejected", "Unqualified"];
                                const idx = stages.indexOf(lead.stage);
                                if (idx < stages.length - 1) {
                                  setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, stage: stages[idx + 1] } : l));
                                  showToast(`Moved to ${stages[idx + 1]}`);
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
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewLead(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Lead Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewLead(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Name</span><p className="font-medium">{viewLead.name}</p></div>
                <div><span className="text-muted-foreground">Subject</span><p>{viewLead.subject}</p></div>
                <div><span className="text-muted-foreground">Stage</span><p><Badge variant={stageColors[viewLead.stage] || "outline"}>{viewLead.stage}</Badge></p></div>
                <div><span className="text-muted-foreground">Follow Up</span><p>{viewLead.followUp}</p></div>
                <div><span className="text-muted-foreground">Tasks</span><p>{viewLead.tasksDone}/{viewLead.tasksTotal}</p></div>
                <div><span className="text-muted-foreground">Users</span><p>{viewLead.users.map((u) => u.name).join(", ")}{viewLead.usersMore > 0 && ` +${viewLead.usersMore} more`}</p></div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <Button variant="outline" onClick={() => setViewLead(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditLead(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Lead</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditLead(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input value={editForm.subject} onChange={(e) => setEditForm((f) => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Follow Up Date</label>
                  <Input type="date" value={editForm.followUp} onChange={(e) => setEditForm((f) => ({ ...f, followUp: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Stage</label>
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.stage} onChange={(e) => setEditForm((f) => ({ ...f, stage: e.target.value }))}>
                    {["New", "Contacted", "Qualified", "In Review", "Approved", "Rejected", "Unqualified"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setEditLead(null)}>Cancel</Button>
              <Button onClick={saveEdit}><Check className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Deal Modal */}
      {convertLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConvertLead(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Convert Lead to Deal</h2>
              <Button variant="ghost" size="icon" onClick={() => setConvertLead(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Deal Name <span className="text-destructive">*</span></label>
                  <Input value={convertForm.dealName} onChange={(e) => setConvertForm((f) => ({ ...f, dealName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" step="0.01" min="0" className="pl-7" placeholder="0"
                      value={convertForm.price} onChange={(e) => setConvertForm((f) => ({ ...f, price: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Client Type</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="clientType" checked={convertForm.clientType === "new"}
                      onChange={() => setConvertForm((f) => ({ ...f, clientType: "new" }))} />
                    New Client
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="clientType" checked={convertForm.clientType === "existing"}
                      onChange={() => setConvertForm((f) => ({ ...f, clientType: "existing" }))} />
                    Existing Client
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client Name <span className="text-destructive">*</span></label>
                  <Input placeholder="Enter Client Name" value={convertForm.clientName} onChange={(e) => setConvertForm((f) => ({ ...f, clientName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Email <span className="text-destructive">*</span></label>
                  <Input type="email" placeholder="Enter Client Email" value={convertForm.clientEmail} onChange={(e) => setConvertForm((f) => ({ ...f, clientEmail: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Password <span className="text-destructive">*</span></label>
                  <Input type="password" placeholder="Enter Client Password" value={convertForm.clientPassword} onChange={(e) => setConvertForm((f) => ({ ...f, clientPassword: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Copy To</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {copyToOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={convertForm.copyTo.includes(opt)}
                        onChange={() => toggleCopyTo(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setConvertLead(null)}>Cancel</Button>
              <Button onClick={() => { showToast(`Lead converted to deal: ${convertForm.dealName}`); setConvertLead(null); }}>
                <ArrowRight className="h-4 w-4 mr-1" /> Convert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Labels Modal */}
      {labelsLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setLabelsLead(null)}>
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Lead Labels</h2>
              <Button variant="ghost" size="icon" onClick={() => setLabelsLead(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium mb-1">{labelsLead.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{selectedLabels.length} selected</p>
              <div className="space-y-2">
                {labelsList.map((lbl) => {
                  const checked = selectedLabels.includes(lbl.key);
                  return (
                    <label key={lbl.key} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleLabel(lbl.key)}
                        className="rounded border-gray-300" />
                      <div className={`w-3 h-3 rounded-full ${lbl.color}`} />
                      <span className="text-sm">{lbl.key}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setLabelsLead(null)}>Cancel</Button>
              <Button onClick={() => { showToast("Labels saved"); setLabelsLead(null); }}><Check className="h-4 w-4 mr-1" /> Save</Button>
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
              <p className="text-sm text-muted-foreground mt-1">Are you sure you want to delete this lead?</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setLeads((prev) => prev.filter((l) => l.id !== deleteId)); setDeleteId(null); showToast("Lead deleted"); }}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
