// app/dashboard/sales/documents/page.tsx
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
  Folder,
  Calendar,
  User,
  Clock,
  Download,
} from "lucide-react";

type Document = {
  id: string;
  name: string;
  account: string;
  folder: string;
  publishDate: string;
  expirationDate?: string;
  assignedUser: string;
  status: "Active" | "Draft" | "Expired" | "Cancelled";
  type?: string;
  description?: string;
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

const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Technical Specification",
    account: "Mining Operations Corp",
    folder: "Legal Documents",
    publishDate: "2026-07-31",
    assignedUser: "Daniel Thompson",
    status: "Expired",
  },
  {
    id: "2",
    name: "Vendor Evaluation Report",
    account: "Publishing & Media House",
    folder: "Marketing Materials",
    publishDate: "2026-04-23",
    assignedUser: "James Garcia",
    status: "Expired",
  },
  {
    id: "3",
    name: "Business Case Document",
    account: "Renewable Energy Systems",
    folder: "Sales Contracts",
    publishDate: "2026-07-08",
    assignedUser: "Anthony Walker",
    status: "Expired",
  },
  {
    id: "4",
    name: "Communication Plan",
    account: "Pharmaceutical Research",
    folder: "Project Documents",
    publishDate: "2026-01-20",
    expirationDate: "2026-06-27",
    assignedUser: "John Smith",
    status: "Draft",
  },
  {
    id: "5",
    name: "Vendor Evaluation Report",
    account: "Pharmaceutical Research",
    folder: "Proposals",
    publishDate: "2026-01-29",
    expirationDate: "2026-02-22",
    assignedUser: "Matthew Clark",
    status: "Draft",
  },
  {
    id: "6",
    name: "Testing Procedures",
    account: "Telecommunications Network",
    folder: "Marketing Materials",
    publishDate: "2025-12-04",
    assignedUser: "Michael Brown",
    status: "Active",
  },
  {
    id: "7",
    name: "Support Documentation",
    account: "Healthcare Partners LLC",
    folder: "Intellectual Property",
    assignedUser: "John Smith",
    status: "Cancelled",
  },
  {
    id: "8",
    name: "Risk Assessment Report",
    account: "Financial Services Group",
    folder: "Policies",
    publishDate: "2026-04-27",
    assignedUser: "Daniel Thompson",
    status: "Expired",
  },
  {
    id: "9",
    name: "Performance Metrics",
    account: "Mining Operations Corp",
    folder: "Case Studies",
    publishDate: "2025-12-27",
    assignedUser: "Robert Taylor",
    status: "Cancelled",
  },
  {
    id: "10",
    name: "Timeline Schedule",
    account: "Biotechnology Research",
    folder: "NDAs",
    publishDate: "2025-10-08",
    assignedUser: "Robert Taylor",
    status: "Active",
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700",
  Draft: "bg-yellow-500/10 text-yellow-700",
  Expired: "bg-red-500/10 text-red-700",
  Cancelled: "bg-gray-500/10 text-gray-700",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    status: "Draft",
    opportunity: "",
    account: "",
    folder: "",
    type: "",
    assignedUser: "",
    publishDate: "",
    expirationDate: "",
    description: "",
    attachment: null as File | null,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    account: "",
    folder: "",
    publishDate: "",
    expirationDate: "",
    assignedUser: "",
    status: "",
  });

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(documents.map((d) => d.status));
    return Array.from(statuses);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(q) ||
          doc.account.toLowerCase().includes(q) ||
          doc.folder.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    return filtered;
  }, [documents, search, statusFilter]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewModalOpen(true);
  };

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setEditForm({
      name: doc.name,
      account: doc.account,
      folder: doc.folder,
      publishDate: doc.publishDate || "",
      expirationDate: doc.expirationDate || "",
      assignedUser: doc.assignedUser,
      status: doc.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (selectedDocument) {
      const updatedDocuments = documents.map((d) =>
        d.id === selectedDocument.id
          ? {
              ...d,
              name: editForm.name,
              account: editForm.account,
              folder: editForm.folder,
              publishDate: editForm.publishDate,
              expirationDate: editForm.expirationDate,
              assignedUser: editForm.assignedUser,
              status: editForm.status as "Active" | "Draft" | "Expired" | "Cancelled",
            }
          : d
      );
      setDocuments(updatedDocuments);
      setIsEditModalOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleDelete = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDocument) {
      const updatedDocuments = documents.filter((d) => d.id !== selectedDocument.id);
      setDocuments(updatedDocuments);
      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleCreateDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      name: createForm.name || "New Document",
      account: createForm.account || "New Account",
      folder: createForm.folder || "General",
      publishDate: createForm.publishDate || new Date().toISOString().split('T')[0],
      expirationDate: createForm.expirationDate || "",
      assignedUser: createForm.assignedUser || "Unassigned",
      status: createForm.status as "Active" | "Draft" | "Expired" | "Cancelled",
      type: createForm.type,
      description: createForm.description,
    };
    setDocuments([newDocument, ...documents]);
    setIsCreateModalOpen(false);
    setCreateForm({
      name: "",
      status: "Draft",
      opportunity: "",
      account: "",
      folder: "",
      type: "",
      assignedUser: "",
      publishDate: "",
      expirationDate: "",
      description: "",
      attachment: null,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Documents</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Filters</span></div>
            <FilterSelect value={statusFilter} onValueChange={(value) => { setStatusFilter(value); handleFilterChange(); }}>
              <option value="all">All Status</option>
              {uniqueStatuses.map((status) => (<option key={status} value={status}>{status}</option>))}
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Account</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Folder</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Publish Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Expiration Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.length === 0 ? (<tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No documents found</td></tr>) : (
                      paginatedDocuments.map((doc, index) => (
                        <tr key={doc.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-sm">{doc.name}</span></div></td>
                          <td className="p-3 md:p-4"><div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{doc.account}</span></div></td>
                          <td className="p-3 md:p-4"><div className="flex items-center gap-1"><Folder className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{doc.folder}</span></div></td>
                          <td className="p-3 md:p-4">{doc.publishDate ? <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{doc.publishDate}</span></div> : <span className="text-sm text-muted-foreground">-</span>}</td>
                          <td className="p-3 md:p-4">{doc.expirationDate ? <span className="text-sm">{doc.expirationDate}</span> : <span className="text-sm text-muted-foreground">-</span>}</td>
                          <td className="p-3 md:p-4"><div className="flex items-center gap-1"><Avatar className="h-6 w-6"><AvatarFallback className="bg-primary/10 text-primary text-[10px]">{getInitials(doc.assignedUser)}</AvatarFallback></Avatar><span className="text-sm">{doc.assignedUser}</span></div></td>
                          <td className="p-3 md:p-4"><Badge className={statusColors[doc.status]}>{doc.status}</Badge></td>
                          <td className="p-3 md:p-4"><div className="flex items-center justify-center gap-1"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(doc)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(doc)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(doc)}><Trash2 className="h-4 w-4" /></Button></div></td>
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
            <div className="text-sm text-muted-foreground order-2 sm:order-1">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} results</div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Document Details" maxWidth="max-w-2xl">
        {selectedDocument && (
          <div className="space-y-4">
            <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><FileText className="h-6 w-6 text-primary" /></div><div><p className="font-medium text-lg">{selectedDocument.name}</p><p className="text-sm text-muted-foreground">{selectedDocument.folder}</p></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Account</p><p className="text-sm font-medium">{selectedDocument.account}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedDocument.status]}>{selectedDocument.status}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Publish Date</p><p className="text-sm font-medium">{selectedDocument.publishDate || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Expiration Date</p><p className="text-sm font-medium">{selectedDocument.expirationDate || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned User</p><p className="text-sm font-medium">{selectedDocument.assignedUser}</p></div>
              {selectedDocument.description && <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedDocument.description}</p></div>}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Document">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Account</label><Input value={editForm.account} onChange={(e) => setEditForm({ ...editForm, account: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Folder</label><Input value={editForm.folder} onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm font-medium">Publish Date</label><Input type="date" value={editForm.publishDate} onChange={(e) => setEditForm({ ...editForm, publishDate: e.target.value })} /></div><div className="space-y-2"><label className="text-sm font-medium">Expiration Date</label><Input type="date" value={editForm.expirationDate} onChange={(e) => setEditForm({ ...editForm, expirationDate: e.target.value })} /></div></div>
          <div className="space-y-2"><label className="text-sm font-medium">Assigned User</label><SimpleSelect value={editForm.assignedUser} onValueChange={(value: string) => setEditForm({ ...editForm, assignedUser: value })}><option value="John Smith">John Smith</option><option value="James Garcia">James Garcia</option><option value="Christopher Lee">Christopher Lee</option></SimpleSelect></div>
          <div className="space-y-2"><label className="text-sm font-medium">Status</label><SimpleSelect value={editForm.status} onValueChange={(value: string) => setEditForm({ ...editForm, status: value })}><option value="Active">Active</option><option value="Draft">Draft</option><option value="Expired">Expired</option><option value="Cancelled">Cancelled</option></SimpleSelect></div>
          <div className="flex gap-2 pt-4"><Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button className="flex-1" onClick={handleEditSave}>Save Changes</Button></div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Document">
        <div className="space-y-4"><p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{selectedDocument?.name}</span>? This action cannot be undone.</p><div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button></div></div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Document" maxWidth="max-4xl">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Name <span className="text-red-500">*</span></label><Input placeholder="Enter document name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><SimpleSelect value={createForm.status} onValueChange={(value: string) => setCreateForm({ ...createForm, status: value })}><option value="Draft">Draft</option><option value="Active">Active</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Opportunity</label><SimpleSelect value={createForm.opportunity} onValueChange={(value: string) => setCreateForm({ ...createForm, opportunity: value })} placeholder="Select Opportunity"><option value="opp1">Opportunity 1</option></SimpleSelect></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Account</label><SimpleSelect value={createForm.account} onValueChange={(value: string) => setCreateForm({ ...createForm, account: value })} placeholder="Select Account"><option value="TechCorp Solutions">TechCorp Solutions</option><option value="Global Manufacturing Inc">Global Manufacturing Inc</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Folder</label><SimpleSelect value={createForm.folder} onValueChange={(value: string) => setCreateForm({ ...createForm, folder: value })} placeholder="Select Folder"><option value="Legal Documents">Legal Documents</option><option value="Marketing Materials">Marketing Materials</option><option value="Sales Contracts">Sales Contracts</option></SimpleSelect></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Type</label><SimpleSelect value={createForm.type} onValueChange={(value: string) => setCreateForm({ ...createForm, type: value })} placeholder="Select Type"><option value="PDF">PDF</option><option value="Word">Word</option><option value="Excel">Excel</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Assigned User</label><SimpleSelect value={createForm.assignedUser} onValueChange={(value: string) => setCreateForm({ ...createForm, assignedUser: value })} placeholder="Select user"><option value="John Smith">John Smith</option><option value="James Garcia">James Garcia</option></SimpleSelect></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Attachment</label><div className="flex items-center gap-2"><Input type="file" onChange={(e) => setCreateForm({ ...createForm, attachment: e.target.files?.[0] || null })} className="flex-1" /><Button variant="outline" size="sm">Browse</Button></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm font-medium">Publish Date</label><Input type="date" value={createForm.publishDate} onChange={(e) => setCreateForm({ ...createForm, publishDate: e.target.value })} /></div><div className="space-y-2"><label className="text-sm font-medium">Expiration Date</label><Input type="date" value={createForm.expirationDate} onChange={(e) => setCreateForm({ ...createForm, expirationDate: e.target.value })} /></div></div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea placeholder="Enter description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" /></div>
          <div className="flex gap-2 pt-4 border-t border-border"><Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button className="flex-1" onClick={handleCreateDocument}>Create</Button></div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}