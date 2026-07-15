"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  GitBranch,
  Users,
  FileText,
  Award,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Tag,
  Megaphone,
  CalendarDays,
  DollarSign,
  Wallet,
  CreditCard,
  Clock,
  Plus,
  X,
  Pencil,
  Trash2,
  Network,
  Loader2,
} from "lucide-react";

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
    <option value="">{placeholder || "Select..."}</option>
    {children}
  </select>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

type SetupItem = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  branch?: string;
  department?: string;
  isRequired?: boolean;
  branchId?: string;
  departmentId?: string;
  day?: string;
  isWorking?: boolean;
  ip?: string;
};

type TabConfig = {
  id: string;
  label: string;
  icon: any;
  formFields: { label: string; type: string; placeholder?: string; key: string; options?: string[] }[];
  apiType: string;
};

const tabs: TabConfig[] = [
  { id: "branches", label: "Branches", icon: GitBranch, apiType: "branches",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Branch Name", key: "name" }] },
  { id: "departments", label: "Departments", icon: Building2, apiType: "departments",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Department Name", key: "name" },
      { label: "Branch", type: "select", placeholder: "Select Branch", key: "branchId", options: [] },
    ] },
  { id: "designations", label: "Designations", icon: Users, apiType: "designations",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Designation Name", key: "name" },
      { label: "Branch", type: "select", placeholder: "Select Branch", key: "branchId", options: [] },
      { label: "Department", type: "select", placeholder: "Select Department", key: "departmentId", options: [] },
    ] },
  { id: "documentTypes", label: "Document Types", icon: FileText, apiType: "documentTypes",
    formFields: [
      { label: "Document Name", type: "text", placeholder: "Enter Document Name", key: "name" },
      { label: "Description", type: "textarea", placeholder: "Enter Description", key: "description" },
      { label: "Is Required", type: "toggle", key: "isRequired" },
    ] },
  { id: "awardTypes", label: "Award Types", icon: Award, apiType: "awardTypes",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Name", key: "name" },
      { label: "Description", type: "textarea", placeholder: "Enter Description", key: "description" },
    ] },
  { id: "terminationTypes", label: "Termination Types", icon: AlertTriangle, apiType: "terminationTypes",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Termination Type", key: "name" }] },
  { id: "warningTypes", label: "Warning Types", icon: AlertTriangle, apiType: "warningTypes",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Warning Type", key: "name" }] },
  { id: "complaintTypes", label: "Complaint Types", icon: MessageSquare, apiType: "complaintTypes",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Complaint Type", key: "name" }] },
  { id: "holidayTypes", label: "Holiday Types", icon: Calendar, apiType: "holidayTypes",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Holiday Type", key: "name" }] },
  { id: "documentCategories", label: "Document Categories", icon: Tag, apiType: "documentCategories",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Category Name", key: "name" },
      { label: "Enable/Disable", type: "toggle", key: "isActive" },
    ] },
  { id: "announcementCategories", label: "Announcement Categories", icon: Megaphone, apiType: "announcementCategories",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Announcement Category", key: "name" }] },
  { id: "eventTypes", label: "Event Types", icon: CalendarDays, apiType: "eventTypes",
    formFields: [{ label: "Name", type: "text", placeholder: "Enter Event Type", key: "name" }] },
  { id: "allowanceTypes", label: "Allowance Types", icon: DollarSign, apiType: "allowanceTypes",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Name", key: "name" },
      { label: "Description", type: "textarea", placeholder: "Enter Description", key: "description" },
    ] },
  { id: "deductionTypes", label: "Deduction Types", icon: Wallet, apiType: "deductionTypes",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Name", key: "name" },
      { label: "Description", type: "textarea", placeholder: "Enter Description", key: "description" },
    ] },
  { id: "loanTypes", label: "Loan Types", icon: CreditCard, apiType: "loanTypes",
    formFields: [
      { label: "Name", type: "text", placeholder: "Enter Name", key: "name" },
      { label: "Description", type: "textarea", placeholder: "Enter Description", key: "description" },
    ] },
  { id: "workingDays", label: "Working Days", icon: Clock, apiType: "workingDays", formFields: [] },
  { id: "ipRestricts", label: "IP Restrict", icon: Network, apiType: "ipRestricts",
    formFields: [{ label: "IP", type: "text", placeholder: "Enter IP", key: "ip" }] },
];

const defaultForm = { name: "", description: "", isActive: true, isRequired: false, branchId: "", departmentId: "", ip: "" };

export default function SystemSetupPage() {
  const [activeTab, setActiveTab] = useState("branches");
  const [items, setItems] = useState<SetupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<SetupItem[]>([]);
  const [departments, setDepartments] = useState<SetupItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SetupItem | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [editForm, setEditForm] = useState({ ...defaultForm });

  const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const currentTab = tabs.find((t) => t.id === activeTab);
  const apiType = currentTab?.apiType || activeTab;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrm/setup/${apiType}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/hrm/setup/branches");
      const data = await res.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch { setBranches([]); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/hrm/setup/departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch { setDepartments([]); }
  };

  useEffect(() => { fetchItems(); }, [apiType]);
  useEffect(() => { fetchBranches(); fetchDepartments(); }, []);

  useEffect(() => {
    if (activeTab === "departments" || activeTab === "designations") {
      const branchOpts = branches.map((b) => ({ label: b.name, value: b.id }));
      const tab = tabs.find((t) => t.id === activeTab);
      if (tab) {
        tab.formFields.forEach((f) => {
          if (f.key === "branchId") f.options = branchOpts.map((o) => o.label);
        });
      }
    }
    if (activeTab === "designations") {
      const deptOpts = departments.map((d) => ({ label: d.name, value: d.id }));
      const tab = tabs.find((t) => t.id === "designations");
      if (tab) {
        tab.formFields.forEach((f) => {
          if (f.key === "departmentId") f.options = deptOpts.map((o) => o.label);
        });
      }
    }
  }, [activeTab, branches, departments]);

  const handleAdd = async () => {
    try {
      const body: any = {};
      if (formData.name) body.name = formData.name;
      if (formData.description) body.description = formData.description;
      if (formData.isActive !== undefined) body.isActive = formData.isActive;
      if (formData.isRequired !== undefined) body.isRequired = formData.isRequired;
      if (formData.branchId) body.branch = branches.find((b) => b.id === formData.branchId)?.name;
      if (formData.departmentId) body.department = departments.find((d) => d.id === formData.departmentId)?.name;
      if (formData.ip) body.ip = formData.ip;

      const res = await fetch(`/api/hrm/setup/${apiType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create");
      setIsAddModalOpen(false);
      setFormData({ ...defaultForm });
      fetchItems();
    } catch { alert("Failed to create item"); }
  };

  const handleEdit = (item: SetupItem) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name || "",
      description: item.description || "",
      isActive: item.isActive ?? true,
      isRequired: item.isRequired ?? false,
      branchId: item.branchId || "",
      departmentId: item.departmentId || "",
      ip: item.ip || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    try {
      const body: any = {};
      if (editForm.name) body.name = editForm.name;
      if (editForm.description !== undefined) body.description = editForm.description;
      if (editForm.isActive !== undefined) body.isActive = editForm.isActive;
      if (editForm.isRequired !== undefined) body.isRequired = editForm.isRequired;
      if (editForm.branchId) body.branch = branches.find((b) => b.id === editForm.branchId)?.name;
      if (editForm.departmentId) body.department = departments.find((d) => d.id === editForm.departmentId)?.name;
      if (editForm.ip) body.ip = editForm.ip;

      const res = await fetch(`/api/hrm/setup/${apiType}/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      setIsEditModalOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch { alert("Failed to update item"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/hrm/setup/${apiType}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchItems();
    } catch { alert("Failed to delete item"); }
  };

  const toggleWorkingDay = async (dayName: string) => {
    const existing = items.find((d) => (d.name || d.day) === dayName);
    try {
      if (existing) {
        await fetch(`/api/hrm/setup/workingDays/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isWorking: !existing.isWorking }),
        });
      } else {
        await fetch(`/api/hrm/setup/workingDays`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: dayName, name: dayName, isWorking: false }),
        });
      }
      fetchItems();
    } catch { alert("Failed to update"); }
  };

  const getTabIcon = (tabId: string) => tabs.find((t) => t.id === tabId)?.icon || Tag;
  const getTabLabel = (tabId: string) => tabs.find((t) => t.id === tabId)?.label || tabId;

  const renderFormFields = (fields: any[], data: any, setData: any) =>
    fields.map((field) => (
      <div key={field.key} className="space-y-2">
        <label className="text-sm font-medium">{field.label} {field.type !== "toggle" && <span className="text-red-500">*</span>}</label>
        {field.type === "textarea" ? (
          <textarea placeholder={field.placeholder} value={data[field.key] || ""}
            onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        ) : field.type === "select" ? (
          <SimpleSelect value={data[field.key] || ""} onValueChange={(v: string) => setData({ ...data, [field.key]: v })} placeholder={field.placeholder}>
            {(field.options || []).map((opt: string) => (
              <option key={opt} value={branches.find((b) => b.name === opt)?.id || departments.find((d) => d.name === opt)?.id || opt}>{opt}</option>
            ))}
          </SimpleSelect>
        ) : field.type === "toggle" ? (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setData({ ...data, [field.key]: !data[field.key] })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data[field.key] ? "bg-primary" : "bg-muted"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data[field.key] ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm">{data[field.key] ? "Enabled" : "Disabled"}</span>
          </div>
        ) : (
          <Input type="text" placeholder={field.placeholder} value={data[field.key] || ""}
            onChange={(e) => setData({ ...data, [field.key]: e.target.value })} />
        )}
      </div>
    ));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Setup</h1>
          <p className="text-sm text-muted-foreground">Manage all HRM system settings</p>
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
            {activeTab !== "workingDays" && (
              <Button size="sm" onClick={() => { setFormData({ ...defaultForm }); setIsAddModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />Add
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : activeTab === "workingDays" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select the days of the week that are considered working days for your organization.</p>
                <div className="space-y-2">
                  {defaultDays.map((dayName) => {
                    const dbDay = items.find((d) => (d.name || d.day) === dayName);
                    const isChecked = dbDay ? dbDay.isWorking : (dayName !== "Saturday" && dayName !== "Sunday");
                    return (
                      <label key={dayName} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/5 cursor-pointer">
                        <input type="checkbox" checked={!!isChecked} onChange={() => toggleWorkingDay(dayName)} className="h-4 w-4 text-primary rounded" />
                        <span className="text-sm">{dayName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No items found</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium">{item.name || item.ip}</span>
                      {item.branch && <Badge variant="secondary" className="text-xs">{item.branch}</Badge>}
                      {item.department && <Badge variant="outline" className="text-xs">{item.department}</Badge>}
                      {item.isActive !== undefined && (
                        <Badge className={item.isActive ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                      {item.isRequired !== undefined && (
                        <Badge className={item.isRequired ? "bg-blue-500/10 text-blue-700" : "bg-gray-500/10 text-gray-700"}>
                          {item.isRequired ? "Required" : "Optional"}
                        </Badge>
                      )}
                      {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Create ${getTabLabel(activeTab)}`}>
        <div className="space-y-4">
          {currentTab && renderFormFields(currentTab.formFields, formData, setFormData)}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAdd}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${getTabLabel(activeTab)}`}>
        <div className="space-y-4">
          {currentTab && renderFormFields(currentTab.formFields, editForm, setEditForm)}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSaveEdit}>Save</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
