"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Building2,
  Users,
  Target,
  Truck,
  FileText,
  Folder,
  Briefcase,
  Tag,
  Settings,
  Globe,
  Hash,
  Palette,
  AlertCircle,
  Loader2,
} from "lucide-react";

type SetupItem = {
  id: string;
  name: string;
  attributes: Record<string, any>;
  order: number;
  isActive: boolean;
};

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || 'max-w-2xl'} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

type TabConfig = {
  id: string;
  label: string;
  icon: any;
  fields: { label: string; type: string; placeholder?: string; options?: string[]; key: string }[];
};

const tabs: TabConfig[] = [
  { id: "accountType", label: "Account Types", icon: Building2, fields: [{ label: "Name", type: "text", placeholder: "Enter account type name", key: "name" }] },
  { id: "accountIndustry", label: "Account Industries", icon: Tag, fields: [{ label: "Name", type: "text", placeholder: "Enter industry name", key: "name" }] },
  { id: "opportunityStage", label: "Opportunity Stages", icon: Target, fields: [
    { label: "Name", type: "text", placeholder: "Enter stage name", key: "name" },
    { label: "Order", type: "number", placeholder: "0", key: "order" },
    { label: "Color", type: "color", placeholder: "", key: "color" },
    { label: "Description", type: "textarea", placeholder: "Enter description", key: "description" },
    { label: "Status", type: "select", placeholder: "", options: ["Active", "Inactive"], key: "status" },
  ]},
  { id: "shippingProvider", label: "Shipping Providers", icon: Truck, fields: [
    { label: "Name", type: "text", placeholder: "Enter provider name", key: "name" },
    { label: "Website", type: "text", placeholder: "Enter website URL", key: "website" },
  ]},
  { id: "caseType", label: "Case Types", icon: Briefcase, fields: [{ label: "Name", type: "text", placeholder: "Enter type", key: "name" }] },
  { id: "documentType", label: "Document Types", icon: FileText, fields: [{ label: "Name", type: "text", placeholder: "Enter name", key: "name" }] },
  { id: "documentFolder", label: "Document Folders", icon: Folder, fields: [
    { label: "Name", type: "text", placeholder: "Enter name", key: "name" },
    { label: "Parent", type: "select", placeholder: "Select Parent", options: ["Root", "Legal Documents", "Marketing Materials", "Sales Contracts", "Project Documents"], key: "parent" },
    { label: "Description", type: "textarea", placeholder: "Enter description", key: "description" },
  ]},
];

export default function SalesSetupPage() {
  const [activeTab, setActiveTab] = useState("accountType");
  const [items, setItems] = useState<Record<string, SetupItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState<SetupItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState<Record<string, any>>({});
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const fetchItems = useCallback(async (type: string) => {
    try {
      const res = await fetch(`/api/sales/setup?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => ({ ...prev, [type]: data }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all(tabs.map((t) => fetchItems(t.id))).finally(() => setLoading(false));
  }, [fetchItems]);

  const currentItems = items[activeTab] || [];
  const currentTab = tabs.find((t) => t.id === activeTab);

  const filteredItems = useMemo(() => {
    if (!search) return currentItems;
    const q = search.toLowerCase();
    return currentItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [currentItems, search]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = () => setCurrentPage(1);

  const getTabIcon = (tabId: string) => tabs.find((t) => t.id === tabId)?.icon || Tag;
  const getTabLabel = (tabId: string) => tabs.find((t) => t.id === tabId)?.label || tabId;

  const handleView = (item: SetupItem) => { setSelectedItem(item); setIsViewModalOpen(true); };

  const handleEdit = (item: SetupItem) => {
    setSelectedItem(item);
    const formData: Record<string, any> = {};
    currentTab?.fields.forEach((field) => {
      formData[field.key] = field.key === "name" ? item.name : item.attributes?.[field.key] || "";
    });
    setEditForm(formData);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedItem) return;
    setSaving(true); setError("");
    try {
      const attrs: Record<string, any> = {};
      currentTab?.fields.forEach((field) => {
        if (field.key !== "name") attrs[field.key] = editForm[field.key] || "";
      });
      const payload: Record<string, any> = { name: editForm.name, attributes: attrs };
      if (editForm.order) payload.order = Number(editForm.order);
      const res = await fetch(`/api/sales/setup/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setIsEditModalOpen(false);
      setSelectedItem(null);
      fetchItems(activeTab);
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    await fetch(`/api/sales/setup/${selectedItem.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
    fetchItems(activeTab);
  };

  const handleCreateItem = async () => {
    if (!createForm.name?.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const attrs: Record<string, any> = {};
      currentTab?.fields.forEach((field) => {
        if (field.key !== "name") attrs[field.key] = createForm[field.key] || "";
      });
      const payload: Record<string, any> = { type: activeTab, name: createForm.name, attributes: attrs };
      if (createForm.order) payload.order = Number(createForm.order);
      const res = await fetch("/api/sales/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setIsCreateModalOpen(false);
      setCreateForm({});
      fetchItems(activeTab);
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const renderFormFields = (fields: TabConfig["fields"], formData: any, setFormData: any) => {
    return fields.map((field) => (
      <div key={field.key} className="space-y-2">
        <label className="text-sm font-medium">{field.label} {field.type !== "color" && <span className="text-red-500">*</span>}</label>
        {field.type === "textarea" ? (
          <textarea placeholder={field.placeholder} value={formData[field.key] || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        ) : field.type === "select" ? (
          <SimpleSelect value={formData[field.key] || ""} onValueChange={(value: string) => setFormData({ ...formData, [field.key]: value })} placeholder={field.placeholder}>
            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </SimpleSelect>
        ) : field.type === "color" ? (
          <div className="flex items-center gap-3">
            <input type="color" value={formData[field.key] || "#3b82f6"}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="w-12 h-10 rounded-md border border-input cursor-pointer p-0.5 bg-transparent" />
            <Input type="text" value={formData[field.key] || "#3b82f6"}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="flex-1" />
          </div>
        ) : field.type === "number" ? (
          <Input type="number" placeholder={field.placeholder} value={formData[field.key] || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} />
        ) : (
          <Input type="text" placeholder={field.placeholder} value={formData[field.key] || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} />
        )}
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Setup</h1>
          <p className="text-sm text-muted-foreground">Manage all sales system settings</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />{tab.label}
              </button>
            );
          })}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {(() => { const Icon = getTabIcon(activeTab); return <Icon className="h-5 w-5 text-primary" />; })()}
              {getTabLabel(activeTab)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-[200px]" value={search}
                  onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
              </div>
              <Button size="sm" onClick={() => { setCreateForm({}); setError(""); setIsCreateModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-2">
                {paginatedItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No items found</p>
                ) : (
                  paginatedItems.map((item, index) => (
                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium">{item.name}</span>
                        {item.attributes?.color && <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: item.attributes.color }} />}
                        {item.order > 0 && <Badge variant="secondary">Order: {item.order}</Badge>}
                        {item.attributes?.status && (
                          <Badge className={item.attributes.status === "Active" ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>{item.attributes.status}</Badge>
                        )}
                        {item.attributes?.website && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.attributes.website}</span>}
                        {item.attributes?.description && <span className="text-xs text-muted-foreground">{item.attributes.description}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(item)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Details">
        {selectedItem && (
          <div className="space-y-4">
            <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{selectedItem.name}</p></div>
            {selectedItem.order > 0 && <div><p className="text-xs text-muted-foreground">Order</p><p className="text-sm font-medium">{selectedItem.order}</p></div>}
            {selectedItem.attributes?.color && (
              <div><p className="text-xs text-muted-foreground">Color</p><div className="flex items-center gap-2 mt-1"><div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: selectedItem.attributes.color }} /><span className="text-sm">{selectedItem.attributes.color}</span></div></div>
            )}
            {selectedItem.attributes?.status && <div><p className="text-xs text-muted-foreground">Status</p><Badge className={selectedItem.attributes.status === "Active" ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>{selectedItem.attributes.status}</Badge></div>}
            {selectedItem.attributes?.website && <div><p className="text-xs text-muted-foreground">Website</p><p className="text-sm">{selectedItem.attributes.website}</p></div>}
            {selectedItem.attributes?.parent && <div><p className="text-xs text-muted-foreground">Parent</p><p className="text-sm font-medium">{selectedItem.attributes.parent}</p></div>}
            {selectedItem.attributes?.description && <div><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedItem.attributes.description}</p></div>}
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${getTabLabel(activeTab)}`}>
        <div className="space-y-4">
          {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {currentTab && renderFormFields(currentTab.fields, editForm, setEditForm)}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="flex-1" onClick={handleEditSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Item">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{selectedItem?.name}</span>? This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={`Create ${getTabLabel(activeTab)}`}>
        <div className="space-y-4">
          {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {currentTab && renderFormFields(currentTab.fields, createForm, setCreateForm)}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="flex-1" onClick={handleCreateItem} disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
