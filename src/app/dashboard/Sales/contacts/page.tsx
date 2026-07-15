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
  User,
  Mail,
  Phone,
  Building2,
  Loader2,
} from "lucide-react";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  department: string | null;
  accountId: string | null;
  assignedTo: string | null;
  source: string | null;
  preferredContactMethod: string | null;
  tags: string[] | null;
  socialMediaUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  description: string | null;
  notes: string | null;
  status: string;
  account: { id: string; name: string } | null;
  createdAt: string;
};

const defaultForm = {
  name: "", jobTitle: "", email: "", phone: "", department: "",
  leadSource: "", preferredContactMethod: "", tags: [] as string[],
  socialMediaUrl: "", accountId: "", assignedTo: "", address: "",
  city: "", state: "", country: "", postalCode: "", description: "", status: true,
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

const statusColors: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Inactive: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

const tagOptions = ["VIP", "Decision Maker", "Influencer", "Technical", "Finance"];

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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState(defaultForm);
  const [editForm, setEditForm] = useState(defaultForm);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/crm/contacts");
      if (res.ok) setContacts(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchContacts(),
      fetch("/api/crm/accounts").then((r) => r.ok ? r.json() : []),
      fetch("/api/users").then((r) => r.ok ? r.json() : []),
    ]).then(([_, accs, usrs]) => {
      setAccounts(accs);
      setUsers(usrs);
    });
  }, [fetchContacts]);

  const uniqueAccounts = useMemo(() => {
    const s = new Set(contacts.map((c) => c.account?.name).filter(Boolean));
    return Array.from(s);
  }, [contacts]);

  const uniqueStatuses = useMemo(() => {
    const s = new Set(contacts.map((c) => c.status));
    return Array.from(s);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter((c) => c.status === statusFilter);
    if (accountFilter !== "all") {
      filtered = filtered.filter((c) => c.account?.name === accountFilter);
    }
    return filtered;
  }, [contacts, search, statusFilter, accountFilter]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handleFilterChange = () => setCurrentPage(1);

  const getFullName = (c: Contact) => `${c.firstName} ${c.lastName}`.replace(/ \.$/, "");

  const handleView = (contact: Contact) => { setSelectedContact(contact); setIsViewModalOpen(true); };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setEditForm({
      name: getFullName(contact),
      jobTitle: contact.title || "",
      email: contact.email || "",
      phone: contact.phone || "",
      department: contact.department || "",
      leadSource: contact.source || "",
      preferredContactMethod: contact.preferredContactMethod || "",
      tags: (contact.tags as string[]) || [],
      socialMediaUrl: contact.socialMediaUrl || "",
      accountId: contact.accountId || "",
      assignedTo: contact.assignedTo || "",
      address: contact.address || "",
      city: contact.city || "",
      state: contact.state || "",
      country: contact.country || "",
      postalCode: contact.postalCode || "",
      description: contact.description || "",
      status: contact.status === "Active",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedContact) return;
    setSaving(true);
    try {
      const nameParts = editForm.name.trim().split(/\s+/);
      const res = await fetch(`/api/crm/contacts/${selectedContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || ".",
          email: editForm.email,
          phone: editForm.phone,
          title: editForm.jobTitle,
          department: editForm.department,
          accountId: editForm.accountId,
          assignedTo: editForm.assignedTo,
          source: editForm.leadSource,
          preferredContactMethod: editForm.preferredContactMethod,
          tags: editForm.tags,
          socialMediaUrl: editForm.socialMediaUrl,
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          postalCode: editForm.postalCode,
          description: editForm.description,
          status: editForm.status ? "Active" : "Inactive",
        }),
      });
      if (!res.ok) return;
      setIsEditModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
    } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContact) return;
    await fetch(`/api/crm/contacts/${selectedContact.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    setSelectedContact(null);
    fetchContacts();
  };

  const handleCreateContact = async () => {
    if (!createForm.name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const nameParts = createForm.name.trim().split(/\s+/);
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || ".",
          email: createForm.email,
          phone: createForm.phone,
          title: createForm.jobTitle,
          department: createForm.department,
          accountId: createForm.accountId,
          assignedTo: createForm.assignedTo,
          source: createForm.leadSource,
          preferredContactMethod: createForm.preferredContactMethod,
          tags: createForm.tags,
          socialMediaUrl: createForm.socialMediaUrl,
          address: createForm.address,
          city: createForm.city,
          state: createForm.state,
          country: createForm.country,
          postalCode: createForm.postalCode,
          description: createForm.description,
          status: createForm.status ? "Active" : "Inactive",
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setIsCreateModalOpen(false);
      setCreateForm(defaultForm);
      fetchContacts();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const toggleTag = (form: typeof defaultForm, setter: (f: typeof defaultForm) => void, tag: string) => {
    setter({
      ...form,
      tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag],
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Manage Contacts</h1></div>
          <Button onClick={() => { setCreateForm(defaultForm); setError(""); setIsCreateModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Create Contact
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <SimpleSelect value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); handleFilterChange(); }}>
              <option value="all">All Status</option>
              {uniqueStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
            </SimpleSelect>
            <SimpleSelect value={accountFilter} onValueChange={(v: string) => { setAccountFilter(v); handleFilterChange(); }}>
              <option value="all">All Accounts</option>
              {uniqueAccounts.map((a) => (<option key={a} value={a}>{a}</option>))}
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Account</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : paginatedContacts.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No contacts found</td></tr>
                    ) : (
                      paginatedContacts.map((contact, index) => (
                        <tr key={contact.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{getFullName(contact)}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{contact.email || "—"}</span></div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{contact.phone || "—"}</span></div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{contact.account?.name || "—"}</span></div>
                          </td>
                          <td className="p-3 md:p-4"><span className="text-sm">{contact.assignedTo || "—"}</span></td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[contact.status]}>{contact.status}</Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(contact)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(contact)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => { setSelectedContact(contact); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} results
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Contact Details" maxWidth="max-2xl">
        {selectedContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
              <div><p className="font-medium text-lg">{getFullName(selectedContact)}</p><p className="text-sm text-muted-foreground">{selectedContact.email}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedContact.phone || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Account</p><p className="text-sm font-medium">{selectedContact.account?.name || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned User</p><p className="text-sm font-medium">{selectedContact.assignedTo || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedContact.status]}>{selectedContact.status}</Badge></div>
              {selectedContact.title && <div><p className="text-xs text-muted-foreground">Job Title</p><p className="text-sm font-medium">{selectedContact.title}</p></div>}
              {selectedContact.department && <div><p className="text-xs text-muted-foreground">Department</p><p className="text-sm font-medium">{selectedContact.department}</p></div>}
              {selectedContact.address && <div className="col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="text-sm">{selectedContact.address}</p></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Contact" maxWidth="max-4xl">
        <ContactForm
          form={editForm}
          onChange={setEditForm}
          accounts={accounts}
          users={users}
          saving={saving}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          saveLabel="Save Changes"
          toggleTag={(tag) => toggleTag(editForm, setEditForm, tag)}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Contact">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedContact && getFullName(selectedContact)}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Contact" maxWidth="max-4xl">
        <ContactForm
          form={createForm}
          onChange={setCreateForm}
          accounts={accounts}
          users={users}
          saving={saving}
          error={error}
          onCancel={() => setIsCreateModalOpen(false)}
          onSave={handleCreateContact}
          saveLabel="Create"
          toggleTag={(tag) => toggleTag(createForm, setCreateForm, tag)}
        />
      </Modal>
    </DashboardLayout>
  );
}

function ContactForm({
  form, onChange, accounts, users, saving, error, onCancel, onSave, saveLabel, toggleTag,
}: {
  form: typeof defaultForm;
  onChange: (f: typeof defaultForm) => void;
  accounts: any[];
  users: any[];
  saving: boolean;
  error?: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  toggleTag: (tag: string) => void;
}) {
  const upd = (patch: Partial<typeof defaultForm>) => onChange({ ...form, ...patch });

  return (
    <div className="space-y-5">
      {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <FormSection title="Basic Information">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name" required>
            <Input placeholder="Enter name" value={form.name} onChange={(e) => upd({ name: e.target.value })} />
          </FormField>
          <FormField label="Job Title">
            <Input placeholder="Enter job title" value={form.jobTitle} onChange={(e) => upd({ jobTitle: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email" required>
            <Input placeholder="Enter email address" value={form.email} onChange={(e) => upd({ email: e.target.value })} />
          </FormField>
          <FormField label="Phone" required>
            <Input placeholder="+1234567890" value={form.phone} onChange={(e) => upd({ phone: e.target.value })} />
            <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Department">
            <Input placeholder="Enter department" value={form.department} onChange={(e) => upd({ department: e.target.value })} />
          </FormField>
          <FormField label="Lead Source">
            <Input placeholder="Enter lead source" value={form.leadSource} onChange={(e) => upd({ leadSource: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Preferred Contact Method">
            <Input placeholder="Enter preferred contact method" value={form.preferredContactMethod} onChange={(e) => upd({ preferredContactMethod: e.target.value })} />
          </FormField>
          <FormField label="Social Media URL">
            <Input placeholder="Enter social media URL" value={form.socialMediaUrl} onChange={(e) => upd({ socialMediaUrl: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Tags">
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  form.tags.includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </FormField>
      </FormSection>

      <FormSection title="Account & Assignment">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Account" required>
            <SimpleSelect value={form.accountId} onValueChange={(v: string) => upd({ accountId: v })} placeholder="Select account">
              {accounts.map((acc: any) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
            </SimpleSelect>
          </FormField>
          <FormField label="Assigned User" required>
            <SimpleSelect value={form.assignedTo} onValueChange={(v: string) => upd({ assignedTo: v })} placeholder="Select user">
              {users.map((u: any) => (<option key={u.id} value={u.name || u.email}>{u.name || u.email}</option>))}
            </SimpleSelect>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Address">
        <FormField label="Address" required>
          <Input placeholder="Enter address" value={form.address} onChange={(e) => upd({ address: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" required>
            <Input placeholder="Enter city" value={form.city} onChange={(e) => upd({ city: e.target.value })} />
          </FormField>
          <FormField label="State" required>
            <Input placeholder="Enter state" value={form.state} onChange={(e) => upd({ state: e.target.value })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Country" required>
            <Input placeholder="Enter country" value={form.country} onChange={(e) => upd({ country: e.target.value })} />
          </FormField>
          <FormField label="Postal Code" required>
            <Input placeholder="Enter postal code" value={form.postalCode} onChange={(e) => upd({ postalCode: e.target.value })} />
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
              <input type="checkbox" className="sr-only" checked={form.status}
                onChange={(e) => upd({ status: e.target.checked })} />
              <div className={`block w-10 h-6 rounded-full transition ${form.status ? "bg-green-500" : "bg-gray-300"}`} />
              <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${form.status ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-sm font-medium">{form.status ? "Active" : "Inactive"}</span>
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
