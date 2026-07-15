// app/dashboard/sales/cases/page.tsx
"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  FileText,
  Building2,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  Circle,
  Flag,
} from "lucide-react";

type Case = {
  id: string;
  caseNumber: string;
  name: string;
  account: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedUser: string;
  status: "New" | "Assigned" | "Pending" | "Closed" | "Duplicate";
};

const FilterSelect = ({ value, onValueChange, children }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </select>
  );
};

const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <option value="">{placeholder || "Select..."}</option>
      {children}
    </select>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || 'max-4xl'} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const sampleCases: Case[] = [
  {
    id: "1",
    caseNumber: "#CASE0000024",
    name: "Training Request",
    account: "Renewable Energy Systems",
    priority: "Medium",
    assignedUser: "Robert Taylor",
    status: "Pending",
  },
  {
    id: "2",
    caseNumber: "#CASE0000017",
    name: "Software Update Problem",
    account: "Aerospace Engineering",
    priority: "Medium",
    assignedUser: "Anthony Walker",
    status: "Closed",
  },
  {
    id: "3",
    caseNumber: "#CASE0000018",
    name: "Software Update Problem",
    account: "Global Manufacturing Inc",
    priority: "Urgent",
    assignedUser: "David Wilson",
    status: "Duplicate",
  },
  {
    id: "4",
    caseNumber: "#CASE0000019",
    name: "Payment Processing Error",
    account: "Renewable Energy Systems",
    priority: "Medium",
    assignedUser: "Daniel Thompson",
    status: "Assigned",
  },
  {
    id: "5",
    caseNumber: "#CASE0000020",
    name: "Mobile App Problems",
    account: "Educational Services Inc",
    priority: "Medium",
    assignedUser: "Christopher Lee",
    status: "Duplicate",
  },
  {
    id: "6",
    caseNumber: "#CASE0000021",
    name: "Software Update Problem",
    account: "Sports Equipment Manufacturing",
    priority: "Low",
    assignedUser: "Daniel Thompson",
    status: "New",
  },
  {
    id: "7",
    caseNumber: "#CASE0000022",
    name: "Compliance Audit Support",
    account: "TechCorp Solutions",
    priority: "Urgent",
    assignedUser: "Christopher Lee",
    status: "Pending",
  },
  {
    id: "8",
    caseNumber: "#CASE0000023",
    name: "Payment Processing Error",
    account: "Cloud Computing Services",
    priority: "High",
    assignedUser: "Mark Allen",
    status: "Closed",
  },
  {
    id: "9",
    caseNumber: "#CASE0000029",
    name: "Data Export Request",
    account: "TechCorp Solutions",
    priority: "High",
    assignedUser: "Daniel Thompson",
    status: "Closed",
  },
  {
    id: "10",
    caseNumber: "#CASE0000028",
    name: "Password Reset Issue",
    account: "Marine Transportation",
    priority: "High",
    assignedUser: "James Garcia",
    status: "New",
  },
];

const priorityColors: Record<string, string> = {
  Low: "bg-blue-500/10 text-blue-700",
  Medium: "bg-yellow-500/10 text-yellow-700",
  High: "bg-orange-500/10 text-orange-700",
  Urgent: "bg-red-500/10 text-red-700",
};

const priorityIcons: Record<string, any> = {
  Low: Circle,
  Medium: Clock,
  High: Flag,
  Urgent: AlertTriangle,
};

const statusColors: Record<string, string> = {
  New: "bg-blue-500/10 text-blue-700",
  Assigned: "bg-purple-500/10 text-purple-700",
  Pending: "bg-yellow-500/10 text-yellow-700",
  Closed: "bg-green-500/10 text-green-700",
  Duplicate: "bg-gray-500/10 text-gray-700",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>(sampleCases);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    account: "",
    contact: "",
    caseType: "",
    status: "New",
    priority: "Medium",
    assignedUser: "",
    description: "",
    attachment: null as File | null,
  });

  const [editForm, setEditForm] = useState({
    caseNumber: "",
    name: "",
    account: "",
    priority: "",
    assignedUser: "",
    status: "",
  });

  const uniquePriorities = useMemo(() => {
    const priorities = new Set(cases.map((c) => c.priority));
    return Array.from(priorities);
  }, [cases]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(cases.map((c) => c.status));
    return Array.from(statuses);
  }, [cases]);

  const filteredCases = useMemo(() => {
    let filtered = cases;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.account.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    return filtered;
  }, [cases, search, priorityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleView = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsViewModalOpen(true);
  };

  const handleEdit = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setEditForm({
      caseNumber: caseItem.caseNumber,
      name: caseItem.name,
      account: caseItem.account,
      priority: caseItem.priority,
      assignedUser: caseItem.assignedUser,
      status: caseItem.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (selectedCase) {
      const updatedCases = cases.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              name: editForm.name,
              account: editForm.account,
              priority: editForm.priority as "Low" | "Medium" | "High" | "Urgent",
              assignedUser: editForm.assignedUser,
              status: editForm.status as "New" | "Assigned" | "Pending" | "Closed" | "Duplicate",
            }
          : c
      );
      setCases(updatedCases);
      setIsEditModalOpen(false);
      setSelectedCase(null);
    }
  };

  const handleDelete = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCase) {
      const updatedCases = cases.filter((c) => c.id !== selectedCase.id);
      setCases(updatedCases);
      setIsDeleteModalOpen(false);
      setSelectedCase(null);
    }
  };

  const handleCreateCase = () => {
    const newCase: Case = {
      id: Date.now().toString(),
      caseNumber: `#CASE00000${cases.length + 1}`,
      name: createForm.name || "New Case",
      account: createForm.account || "New Account",
      priority: createForm.priority as "Low" | "Medium" | "High" | "Urgent",
      assignedUser: createForm.assignedUser || "Unassigned",
      status: createForm.status as "New" | "Assigned" | "Pending" | "Closed" | "Duplicate",
    };
    setCases([newCase, ...cases]);
    setIsCreateModalOpen(false);
    setCreateForm({
      name: "",
      account: "",
      contact: "",
      caseType: "",
      status: "New",
      priority: "Medium",
      assignedUser: "",
      description: "",
      attachment: null,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Cases</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Case
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <FilterSelect
              value={priorityFilter}
              onValueChange={(value) => {
                setPriorityFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Priority</option>
              {uniquePriorities.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </FilterSelect>
            <div className="text-sm text-muted-foreground">{itemsPerPage} per page</div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Case Number</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Account</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Priority</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCases.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No cases found</td></tr>
                    ) : (
                      paginatedCases.map((caseItem, index) => {
                        const PriorityIcon = priorityIcons[caseItem.priority] || Circle;
                        return (
                          <tr key={caseItem.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{caseItem.caseNumber}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4"><span className="text-sm">{caseItem.name}</span></td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{caseItem.account}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <Badge className={priorityColors[caseItem.priority]}>
                                <PriorityIcon className="h-3 w-3 mr-1" />
                                {caseItem.priority}
                              </Badge>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                    {getInitials(caseItem.assignedUser)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{caseItem.assignedUser}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <Badge className={statusColors[caseItem.status] || "bg-gray-500/10 text-gray-700"}>
                                {caseItem.status}
                              </Badge>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(caseItem)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(caseItem)}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(caseItem)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCases.length)} of {filteredCases.length} results
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Case Details" maxWidth="max-w-2xl">
        {selectedCase && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">{selectedCase.caseNumber}</p>
                <p className="text-sm text-muted-foreground">{selectedCase.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Account</p><p className="text-sm font-medium">{selectedCase.account}</p></div>
              <div><p className="text-xs text-muted-foreground">Priority</p><Badge className={priorityColors[selectedCase.priority]}>{selectedCase.priority}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Assigned User</p><p className="text-sm font-medium">{selectedCase.assignedUser}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedCase.status]}>{selectedCase.status}</Badge></div>
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Case">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Case Number</label><Input value={editForm.caseNumber} disabled className="bg-muted" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Account</label><Input value={editForm.account} onChange={(e) => setEditForm({ ...editForm, account: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Priority</label><SimpleSelect value={editForm.priority} onValueChange={(value: string) => setEditForm({ ...editForm, priority: value })}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option></SimpleSelect></div>
          <div className="space-y-2"><label className="text-sm font-medium">Assigned User</label><SimpleSelect value={editForm.assignedUser} onValueChange={(value: string) => setEditForm({ ...editForm, assignedUser: value })}><option value="John Smith">John Smith</option><option value="James Garcia">James Garcia</option><option value="Christopher Lee">Christopher Lee</option><option value="Daniel Thompson">Daniel Thompson</option></SimpleSelect></div>
          <div className="space-y-2"><label className="text-sm font-medium">Status</label><SimpleSelect value={editForm.status} onValueChange={(value: string) => setEditForm({ ...editForm, status: value })}><option value="New">New</option><option value="Assigned">Assigned</option><option value="Pending">Pending</option><option value="Closed">Closed</option><option value="Duplicate">Duplicate</option></SimpleSelect></div>
          <div className="flex gap-2 pt-4"><Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button className="flex-1" onClick={handleEditSave}>Save Changes</Button></div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Case">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{selectedCase?.caseNumber}</span>? This action cannot be undone.</p>
          <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button></div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Case" maxWidth="max-4xl">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Name <span className="text-red-500">*</span></label><Input placeholder="Enter case name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Account</label><SimpleSelect value={createForm.account} onValueChange={(value: string) => setCreateForm({ ...createForm, account: value })} placeholder="Select Account"><option value="Renewable Energy Systems">Renewable Energy Systems</option><option value="Aerospace Engineering">Aerospace Engineering</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Contact</label><SimpleSelect value={createForm.contact} onValueChange={(value: string) => setCreateForm({ ...createForm, contact: value })} placeholder="Select Contact"><option value="contact1">Contact 1</option></SimpleSelect></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Case Type</label><SimpleSelect value={createForm.caseType} onValueChange={(value: string) => setCreateForm({ ...createForm, caseType: value })} placeholder="Select case type"><option value="Technical">Technical</option><option value="Billing">Billing</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><SimpleSelect value={createForm.status} onValueChange={(value: string) => setCreateForm({ ...createForm, status: value })}><option value="New">New</option><option value="Assigned">Assigned</option><option value="Pending">Pending</option></SimpleSelect></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Priority</label><SimpleSelect value={createForm.priority} onValueChange={(value: string) => setCreateForm({ ...createForm, priority: value })}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Assigned User</label><SimpleSelect value={createForm.assignedUser} onValueChange={(value: string) => setCreateForm({ ...createForm, assignedUser: value })} placeholder="Select user"><option value="John Smith">John Smith</option><option value="James Garcia">James Garcia</option><option value="Christopher Lee">Christopher Lee</option></SimpleSelect></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Attachment</label><div className="flex items-center gap-2"><Input type="file" onChange={(e) => setCreateForm({ ...createForm, attachment: e.target.files?.[0] || null })} className="flex-1" /><Button variant="outline" size="sm">Browse</Button></div></div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea placeholder="Enter case description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" /></div>
          <div className="flex gap-2 pt-4 border-t border-border"><Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button className="flex-1" onClick={handleCreateCase}>Create</Button></div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}