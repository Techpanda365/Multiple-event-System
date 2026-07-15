"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Building2,
  Target,
  Loader2,
} from "lucide-react";

type Opportunity = {
  id: string;
  name: string;
  accountId: string | null;
  contactId: string | null;
  value: number | null;
  stage: string;
  probability: number;
  closeDate: string | null;
  assignedTo: string | null;
  source: string | null;
  nextFollowupDate: string | null;
  nextStep: string | null;
  lostReason: string | null;
  description: string | null;
  status: string;
  account: { id: string; name: string } | null;
  createdAt: string;
};

const defaultForm = {
  name: "", accountId: "", contactId: "", stage: "Prospecting", amount: "",
  leadSource: "", closeDate: "", probability: 50, assignedTo: "",
  nextFollowupDate: "", nextStep: "", lostReason: "", description: "", status: "Active",
};

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || "max-4xl"} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const stageColors: Record<string, string> = {
  Prospecting: "bg-blue-500/10 text-blue-700",
  Negotiation: "bg-yellow-500/10 text-yellow-700",
  Proposal: "bg-purple-500/10 text-purple-700",
  "Closed Won": "bg-green-500/10 text-green-700",
  "Closed Lost": "bg-red-500/10 text-red-700",
};

const statusColors: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700",
  "Closed Won": "bg-blue-500/10 text-blue-700",
  "Closed Lost": "bg-gray-500/10 text-gray-700",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);

const stageOptions = ["Prospecting", "Negotiation", "Proposal", "Closed Won", "Closed Lost"];
const statusOptions = ["Active", "Closed Won", "Closed Lost"];

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState(defaultForm);
  const [editForm, setEditForm] = useState(defaultForm);

  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await fetch("/api/crm/opportunities");
      if (res.ok) setOpportunities(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchOpportunities(),
      fetch("/api/crm/accounts").then((r) => r.ok ? r.json() : []),
      fetch("/api/users").then((r) => r.ok ? r.json() : []),
      fetch("/api/crm/contacts").then((r) => r.ok ? r.json() : []),
    ]).then(([_, accs, usrs, cnts]) => {
      setAccounts(accs);
      setUsers(usrs);
      setContacts(cnts);
    });
  }, [fetchOpportunities]);

  const uniqueStages = useMemo(() => {
    const s = new Set(opportunities.map((o) => o.stage));
    return Array.from(s);
  }, [opportunities]);

  const uniqueStatuses = useMemo(() => {
    const s = new Set(opportunities.map((o) => o.status));
    return Array.from(s);
  }, [opportunities]);

  const filtered = useMemo(() => {
    let f = opportunities;
    if (search) {
      const q = search.toLowerCase();
      f = f.filter((o) =>
        o.name.toLowerCase().includes(q) ||
        (o.account?.name || "").toLowerCase().includes(q)
      );
    }
    if (stageFilter !== "all") f = f.filter((o) => o.stage === stageFilter);
    if (statusFilter !== "all") f = f.filter((o) => o.status === statusFilter);
    return f;
  }, [opportunities, search, stageFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleFilterChange = () => setCurrentPage(1);

  const handleView = (o: Opportunity) => { setSelectedOpp(o); setIsViewModalOpen(true); };

  const handleEdit = (o: Opportunity) => {
    setSelectedOpp(o);
    setEditForm({
      name: o.name, accountId: o.accountId || "", contactId: o.contactId || "",
      stage: o.stage, amount: o.value != null ? String(o.value) : "",
      probability: o.probability, closeDate: o.closeDate ? o.closeDate.split("T")[0] : "",
      assignedTo: o.assignedTo || "", leadSource: o.source || "",
      nextFollowupDate: o.nextFollowupDate ? o.nextFollowupDate.split("T")[0] : "",
      nextStep: o.nextStep || "", lostReason: o.lostReason || "",
      description: o.description || "", status: o.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedOpp) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/opportunities/${selectedOpp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name, accountId: editForm.accountId, contactId: editForm.contactId,
          stage: editForm.stage, value: parseFloat(editForm.amount) || 0,
          probability: editForm.probability, closeDate: editForm.closeDate || null,
          assignedTo: editForm.assignedTo, source: editForm.leadSource,
          nextFollowupDate: editForm.nextFollowupDate || null,
          nextStep: editForm.nextStep, lostReason: editForm.lostReason,
          description: editForm.description, status: editForm.status,
        }),
      });
      if (!res.ok) return;
      setIsEditModalOpen(false);
      setSelectedOpp(null);
      fetchOpportunities();
    } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOpp) return;
    await fetch(`/api/crm/opportunities/${selectedOpp.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    setSelectedOpp(null);
    fetchOpportunities();
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/crm/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name, accountId: createForm.accountId, contactId: createForm.contactId,
          stage: createForm.stage, value: parseFloat(createForm.amount) || 0,
          probability: createForm.probability, closeDate: createForm.closeDate || null,
          assignedTo: createForm.assignedTo, source: createForm.leadSource,
          nextFollowupDate: createForm.nextFollowupDate || null,
          nextStep: createForm.nextStep, lostReason: createForm.lostReason,
          description: createForm.description, status: createForm.status,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setIsCreateModalOpen(false);
      setCreateForm(defaultForm);
      fetchOpportunities();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const formatDate = (d: string | null) => d ? d.split("T")[0] : "—";

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Manage Opportunities</h1></div>
          <Button onClick={() => { setCreateForm(defaultForm); setError(""); setIsCreateModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Create Opportunity
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search opportunities..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Filters</span></div>
            <SimpleSelect value={stageFilter} onValueChange={(v: string) => { setStageFilter(v); handleFilterChange(); }}>
              <option value="all">All Stages</option>
              {uniqueStages.map((s) => (<option key={s} value={s}>{s}</option>))}
            </SimpleSelect>
            <SimpleSelect value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); handleFilterChange(); }}>
              <option value="all">All Status</option>
              {uniqueStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
            </SimpleSelect>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Account</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Stage</th>
                      <th className="text-right p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Probability</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Close Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={9} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : paginated.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No opportunities found</td></tr>
                    ) : (
                      paginated.map((opp, index) => (
                        <tr key={opp.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-sm">{opp.name}</span></div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{opp.account?.name || "—"}</span></div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={stageColors[opp.stage] || "bg-gray-500/10 text-gray-700"}>{opp.stage}</Badge>
                          </td>
                          <td className="p-3 md:p-4 text-right"><span className="text-sm font-medium">{opp.value != null ? formatCurrency(opp.value) : "—"}</span></td>
                          <td className="p-3 md:p-4 text-center"><Badge variant="secondary">{opp.probability}%</Badge></td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{formatDate(opp.closeDate)}</span></div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{opp.assignedTo || "—"}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[opp.status] || "bg-gray-500/10 text-gray-700"}>{opp.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(opp)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(opp)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => { setSelectedOpp(opp); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} results
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Opportunity Details" maxWidth="max-w-2xl">
        {selectedOpp && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Target className="h-6 w-6 text-primary" /></div>
              <div><p className="font-medium text-lg">{selectedOpp.name}</p><p className="text-sm text-muted-foreground">{selectedOpp.account?.name}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Stage</p><p className="text-sm font-medium">{selectedOpp.stage}</p></div>
              <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-medium">{selectedOpp.value != null ? formatCurrency(selectedOpp.value) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Probability</p><p className="text-sm font-medium">{selectedOpp.probability}%</p></div>
              <div><p className="text-xs text-muted-foreground">Close Date</p><p className="text-sm font-medium">{formatDate(selectedOpp.closeDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned User</p><p className="text-sm font-medium">{selectedOpp.assignedTo || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedOpp.status]}>{selectedOpp.status}</Badge></div>
              {selectedOpp.description && <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedOpp.description}</p></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Opportunity" maxWidth="max-4xl">
        <OpportunityForm
          form={editForm} onChange={setEditForm}
          accounts={accounts} users={users} contacts={contacts}
          saving={saving} onCancel={() => setIsEditModalOpen(false)}
          onSave={handleEditSave} saveLabel="Save Changes"
        />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Opportunity">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedOpp?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Opportunity" maxWidth="max-4xl">
        <OpportunityForm
          form={createForm} onChange={setCreateForm}
          accounts={accounts} users={users} contacts={contacts}
          saving={saving} error={error} onCancel={() => setIsCreateModalOpen(false)}
          onSave={handleCreate} saveLabel="Create"
        />
      </Modal>
    </DashboardLayout>
  );
}

function OpportunityForm({
  form, onChange, accounts, users, contacts, saving, error, onCancel, onSave, saveLabel,
}: {
  form: typeof defaultForm;
  onChange: (f: typeof defaultForm) => void;
  accounts: any[];
  users: any[];
  contacts: any[];
  saving: boolean;
  error?: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  const upd = (patch: Partial<typeof defaultForm>) => onChange({ ...form, ...patch });

  const computedExpected = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format((parseFloat(form.amount) || 0) * (form.probability / 100));

  const getContactName = (c: any) => `${c.firstName} ${c.lastName}`.replace(/ \.$/, "");

  return (
    <div className="space-y-5">
      {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <FormSection title="Opportunity Information">
        <FormField label="Name" required>
          <Input placeholder="Enter opportunity name" value={form.name} onChange={(e) => upd({ name: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Account">
            <SimpleSelect value={form.accountId} onValueChange={(v: string) => upd({ accountId: v })} placeholder="Select Account">
              {accounts.map((a: any) => (<option key={a.id} value={a.id}>{a.name}</option>))}
            </SimpleSelect>
          </FormField>
          <FormField label="Contact">
            <SimpleSelect value={form.contactId} onValueChange={(v: string) => upd({ contactId: v })} placeholder="Select Contact">
              {contacts.map((c: any) => (<option key={c.id} value={c.id}>{getContactName(c)}</option>))}
            </SimpleSelect>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Stage">
            <SimpleSelect value={form.stage} onValueChange={(v: string) => upd({ stage: v })}>
              {stageOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </SimpleSelect>
          </FormField>
          <FormField label="Amount" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input type="number" placeholder="0" className="pl-7" value={form.amount} onChange={(e) => upd({ amount: e.target.value })} />
            </div>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Expected Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input type="text" className="pl-7 bg-muted" value={computedExpected} readOnly />
            </div>
            <p className="text-xs text-muted-foreground">Auto-calculated: Amount &times; Probability</p>
          </FormField>
          <FormField label="Lead Source">
            <Input placeholder="Enter lead source" value={form.leadSource} onChange={(e) => upd({ leadSource: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Close Date">
            <Input type="date" value={form.closeDate} onChange={(e) => upd({ closeDate: e.target.value })} />
          </FormField>
          <FormField label={`Probability (${form.probability}%)`} required>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="100" value={form.probability}
                onChange={(e) => upd({ probability: parseInt(e.target.value) })}
                className="flex-1 accent-primary" />
              <span className="text-sm font-medium w-12 text-right">{form.probability}%</span>
            </div>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Assignment">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Assigned User">
            <SimpleSelect value={form.assignedTo} onValueChange={(v: string) => upd({ assignedTo: v })} placeholder="Select User">
              {users.map((u: any) => (<option key={u.id} value={u.name || u.email}>{u.name || u.email}</option>))}
            </SimpleSelect>
          </FormField>
          <FormField label="Next Followup Date">
            <Input type="date" value={form.nextFollowupDate} onChange={(e) => upd({ nextFollowupDate: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Next Step">
            <Input placeholder="Enter next step" value={form.nextStep} onChange={(e) => upd({ nextStep: e.target.value })} />
          </FormField>
          <FormField label="Lost Reason">
            <Input placeholder="Enter lost reason" value={form.lostReason} onChange={(e) => upd({ lostReason: e.target.value })} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Additional">
        <FormField label="Description">
          <textarea placeholder="Enter description" value={form.description}
            onChange={(e) => upd({ description: e.target.value })}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        </FormField>
        <FormField label="Status">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={form.status === "Active"}
                onChange={(e) => upd({ status: e.target.checked ? "Active" : "Inactive" })} />
              <div className={`block w-10 h-6 rounded-full transition ${form.status === "Active" ? "bg-green-500" : "bg-gray-300"}`} />
              <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${form.status === "Active" ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-sm font-medium">{form.status}</span>
          </label>
        </FormField>
      </FormSection>

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button className="flex-1" onClick={onSave} disabled={saving}>{saving ? "Saving..." : saveLabel}</Button>
      </div>
    </div>
  );
}
