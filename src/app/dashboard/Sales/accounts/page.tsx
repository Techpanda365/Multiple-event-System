"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
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
  Building2,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

type Account = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  accountType: string | null;
  industry: string | null;
  assignedTo: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  billingState: string | null;
  country: string | null;
  billingPostalCode: string | null;
  shippingSameAsBilling: boolean;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingCountry: string | null;
  shippingPostalCode: string | null;
  description: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
};

const defaultCreateForm = {
  name: "", email: "", phone: "", website: "",
  accountType: "", industry: "", assignedTo: "", document: "",
  address: "", city: "", billingState: "", country: "", billingPostalCode: "",
  shippingSameAsBilling: false,
  shippingAddress: "", shippingCity: "", shippingState: "", shippingCountry: "", shippingPostalCode: "",
  description: "", notes: "", status: "Active",
};

const SimpleSelect = ({ value, onValueChange, children, placeholder }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; placeholder?: string }) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || 'max-4xl'} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

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

export default function SalesAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<{ id: string; name: string }[]>([]);
  const [industries, setIndustries] = useState<{ id: string; name: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState(defaultCreateForm);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/sales/accounts");
      if (res.ok) setAccounts(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchAccounts(), // eslint-disable-line react-hooks/set-state-in-effect
      fetch("/api/sales/setup?type=accountType").then((r) => r.ok ? r.json() : []),
      fetch("/api/sales/setup?type=accountIndustry").then((r) => r.ok ? r.json() : []),
      fetch("/api/sales/setup?type=documentType").then((r) => r.ok ? r.json() : []),
      fetch("/api/users").then((r) => r.ok ? r.json() : []),
    ]).then(([, types, inds, docs, usrs]) => {
      setAccountTypes(types);
      setIndustries(inds);
      setDocumentTypes(docs);
      setUsers(usrs);
    });
  }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => {
    let filtered = accounts;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.phone && a.phone.includes(q))
      );
    }
    return filtered;
  }, [accounts, search]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleFilterChange = () => setCurrentPage(1);

  const handleView = (account: Account) => { setSelectedAccount(account); setIsViewModalOpen(true); };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setEditForm({
      name: account.name, email: account.email || "", phone: account.phone || "",
      website: account.website || "", accountType: account.accountType || "",
      industry: account.industry || "", assignedTo: account.assignedTo || "",
      document: account.document || "",
      address: account.address || "", city: account.city || "",
      billingState: account.billingState || "", country: account.country || "",
      billingPostalCode: account.billingPostalCode || "",
      shippingSameAsBilling: account.shippingSameAsBilling,
      shippingAddress: account.shippingAddress || "",
      shippingCity: account.shippingCity || "", shippingState: account.shippingState || "",
      shippingCountry: account.shippingCountry || "", shippingPostalCode: account.shippingPostalCode || "",
      description: account.description || "", notes: account.notes || "",
      status: account.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedAccount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sales/accounts/${selectedAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) return;
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      fetchAccounts();
    } finally { setSaving(false); }
  };

  const updateEdit = (patch: Partial<typeof defaultCreateForm>) => setEditForm((prev) => ({ ...prev, ...patch }));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Manage Accounts</h1></div>
          <Link href="/dashboard/Sales/accounts/create">
            <Button><Plus className="h-4 w-4 mr-2" />Create Account</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Industry</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : paginatedAccounts.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No accounts found</td></tr>
                    ) : (
                      paginatedAccounts.map((account, index) => (
                        <tr key={account.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-sm">{account.name}</span></div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{account.email || "—"}</span></div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{account.phone || "—"}</span></div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{account.accountType || "—"}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{account.industry || "—"}</span></td>
                          <td className="p-3 md:p-4"><span className="text-sm">{account.assignedTo || "—"}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge variant={account.status === "Active" ? "default" : "secondary"} className="text-xs">{account.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(account)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(account)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeletingId(account.id)}><Trash2 className="h-4 w-4" /></Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length} results
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Account Details" maxWidth="max-3xl">
        {selectedAccount && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
                <div><p className="font-medium text-lg">{selectedAccount.name}</p><p className="text-sm text-muted-foreground">{selectedAccount.email}</p></div>
              </div>
              <Badge variant={selectedAccount.status === "Active" ? "default" : "secondary"}>{selectedAccount.status}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="Phone" value={selectedAccount.phone} />
              <InfoItem label="Website" value={selectedAccount.website} />
              <InfoItem label="Account Type" value={selectedAccount.accountType} />
              <InfoItem label="Industry" value={selectedAccount.industry} />
              <InfoItem label="Assigned To" value={selectedAccount.assignedTo} />
              <InfoItem label="Document" value={selectedAccount.document} />
            </div>
            <div className="border-t pt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Billing Address</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoItem label="Address" value={selectedAccount.address} />
                <InfoItem label="City" value={selectedAccount.city} />
                <InfoItem label="State" value={selectedAccount.billingState} />
                <InfoItem label="Country" value={selectedAccount.country} />
                <InfoItem label="Postal Code" value={selectedAccount.billingPostalCode} />
              </div>
            </div>
            {!selectedAccount.shippingSameAsBilling && (selectedAccount.shippingAddress || selectedAccount.shippingCity) && (
              <div className="border-t pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shipping Address</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoItem label="Address" value={selectedAccount.shippingAddress} />
                  <InfoItem label="City" value={selectedAccount.shippingCity} />
                  <InfoItem label="State" value={selectedAccount.shippingState} />
                  <InfoItem label="Country" value={selectedAccount.shippingCountry} />
                  <InfoItem label="Postal Code" value={selectedAccount.shippingPostalCode} />
                </div>
              </div>
            )}
            {selectedAccount.description && <InfoItem label="Description" value={selectedAccount.description} wide />}
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account" maxWidth="max-4xl">
        <AccountForm
          form={editForm}
          onChange={updateEdit}
          accountTypes={accountTypes}
          industries={industries}
          documentTypes={documentTypes}
          users={users}
          saving={saving}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          saveLabel="Save Changes"
        />
      </Modal>

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingId(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Delete Account</h2>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this account?</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={async () => {
                await fetch(`/api/sales/accounts/${deletingId}`, { method: "DELETE" });
                fetchAccounts();
                setDeletingId(null);
              }}>Delete</Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

function InfoItem({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  if (!value) return null;
  return (
    <div className={wide ? "col-span-full" : ""}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function AccountForm({
  form, onChange, accountTypes, industries, documentTypes, users, saving, error, onCancel, onSave, saveLabel,
}: {
  form: typeof defaultCreateForm;
  onChange: (patch: Partial<typeof defaultCreateForm>) => void;
  accountTypes: { id: string; name: string }[];
  industries: { id: string; name: string }[];
  documentTypes: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string }[];
  saving: boolean;
  error?: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-5">
      {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <FormSection title="Account Information">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Account Name" required>
            <Input placeholder="Enter account name" value={form.name} onChange={(e) => onChange({ name: e.target.value })} />
          </FormField>
          <FormField label="Email" required>
            <Input placeholder="Enter email address" value={form.email} onChange={(e) => onChange({ email: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone" required>
            <Input placeholder="+1234567890" value={form.phone} onChange={(e) => onChange({ phone: e.target.value })} />
            <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
          </FormField>
          <FormField label="Website">
            <Input placeholder="Enter website URL" value={form.website} onChange={(e) => onChange({ website: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Account Type">
            <SimpleSelect value={form.accountType} onValueChange={(v: string) => onChange({ accountType: v })} placeholder="Select type">
              {accountTypes.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}
            </SimpleSelect>
          </FormField>
          <FormField label="Industry">
            <SimpleSelect value={form.industry} onValueChange={(v: string) => onChange({ industry: v })} placeholder="Select industry">
              {industries.map((ind) => (<option key={ind.id} value={ind.name}>{ind.name}</option>))}
            </SimpleSelect>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Assigned User">
            <SimpleSelect value={form.assignedTo} onValueChange={(v: string) => onChange({ assignedTo: v })} placeholder="Select user">
              {users.map((u) => (<option key={u.id} value={u.name || u.email}>{u.name || u.email}</option>))}
            </SimpleSelect>
          </FormField>
          <FormField label="Document">
            <SimpleSelect value={form.document} onValueChange={(v: string) => onChange({ document: v })} placeholder="Select document">
              {documentTypes.map((d) => (<option key={d.id} value={d.name}>{d.name}</option>))}
            </SimpleSelect>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Billing Address">
        <FormField label="Billing Address" required>
          <Input placeholder="Enter billing address" value={form.address} onChange={(e) => onChange({ address: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" required>
            <Input placeholder="Enter city" value={form.city} onChange={(e) => onChange({ city: e.target.value })} />
          </FormField>
          <FormField label="State" required>
            <Input placeholder="Enter state" value={form.billingState} onChange={(e) => onChange({ billingState: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Country" required>
            <Input placeholder="Enter country" value={form.country} onChange={(e) => onChange({ country: e.target.value })} />
          </FormField>
          <FormField label="Postal Code" required>
            <Input placeholder="Enter postal code" value={form.billingPostalCode} onChange={(e) => onChange({ billingPostalCode: e.target.value })} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Shipping Address">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.shippingSameAsBilling}
            onChange={(e) => onChange({ shippingSameAsBilling: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Shipping address same as billing</span>
        </label>
        {!form.shippingSameAsBilling && (
          <div className="space-y-3 mt-2">
            <FormField label="Shipping Address" required>
              <Input placeholder="Enter shipping address" value={form.shippingAddress} onChange={(e) => onChange({ shippingAddress: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" required>
                <Input placeholder="Enter city" value={form.shippingCity} onChange={(e) => onChange({ shippingCity: e.target.value })} />
              </FormField>
              <FormField label="State" required>
                <Input placeholder="Enter state" value={form.shippingState} onChange={(e) => onChange({ shippingState: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Country" required>
                <Input placeholder="Enter country" value={form.shippingCountry} onChange={(e) => onChange({ shippingCountry: e.target.value })} />
              </FormField>
              <FormField label="Postal Code" required>
                <Input placeholder="Enter postal code" value={form.shippingPostalCode} onChange={(e) => onChange({ shippingPostalCode: e.target.value })} />
              </FormField>
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="Additional">
        <FormField label="Description">
          <textarea placeholder="Enter description" value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        </FormField>
        <FormField label="Status">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.status === "Active"}
                onChange={(e) => onChange({ status: e.target.checked ? "Active" : "Inactive" })}
              />
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
