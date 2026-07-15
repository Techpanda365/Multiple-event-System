"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Calendar,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type DocumentType = {
  id: string;
  title?: string;
  name: string;
  documentCategory?: string;
  effectiveDate?: string;
  uploadedBy?: string;
  approvedBy?: string;
  status: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  employee?: { id: string; firstName: string; lastName: string; employeeId: string };
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
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
  Pending: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Approved: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Rejected: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  Expired: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/hrm/documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(documents.map((d) => d.status));
    return Array.from(statuses);
  }, [documents]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(documents.map((d) => d.documentCategory).filter(Boolean));
    return Array.from(categories) as string[];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((d) =>
        (d.title || d.name).toLowerCase().includes(q) ||
        (d.documentCategory || "").toLowerCase().includes(q) ||
        (d.uploadedBy || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => d.documentCategory === categoryFilter);
    }
    return filtered;
  }, [documents, search, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (doc: DocumentType) => { setSelectedDocument(doc); setIsViewModalOpen(true); };
  const handleDelete = (doc: DocumentType) => { setSelectedDocument(doc); setIsDeleteModalOpen(true); };
  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;
    await fetch(`/api/hrm/documents/${selectedDocument.id}`, { method: "DELETE" });
    setIsDeleteModalOpen(false); setSelectedDocument(null); fetchDocuments();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Documents</h1>
          </div>
          <Link href="/dashboard/hrm/documents/new" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />Create Document
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="all">All Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Category</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Uploaded By</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
                    ) : paginatedDocuments.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No documents found</td></tr>
                    ) : (
                      paginatedDocuments.map((doc, index) => {
                        const title = doc.title || doc.name;
                        return (
                          <tr key={doc.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{title}</span>
                              </div>
                            </td>
                            <td className="p-3 md:p-4"><span className="text-sm">{doc.documentCategory || "-"}</span></td>
                            <td className="p-3 md:p-4"><span className="text-sm">{doc.uploadedBy || "-"}</span></td>
                            <td className="p-3 md:p-4">
                              <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(doc)}><Eye className="h-4 w-4" /></Button>
                                <Link href={`/dashboard/hrm/documents/edit/${doc.id}`} className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                {doc.fileUrl && (
                                  <a href={doc.fileUrl} target="_blank" className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                    <Download className="h-4 w-4" />
                                  </a>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(doc)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} entries
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Document Details">
        {selectedDocument && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">{selectedDocument.title || selectedDocument.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDocument.documentCategory || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Uploaded By</p><p className="text-sm font-medium">{selectedDocument.uploadedBy || "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Approved By</p><p className="text-sm font-medium">{selectedDocument.approvedBy || "-"}</p></div>
              {selectedDocument.effectiveDate && <div><p className="text-xs text-muted-foreground">Effective Date</p><p className="text-sm font-medium">{new Date(selectedDocument.effectiveDate).toLocaleDateString("en-IN")}</p></div>}
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedDocument.status]}>{selectedDocument.status}</Badge></div>
              {selectedDocument.description && <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="text-sm">{selectedDocument.description}</p></div>}
              {selectedDocument.fileUrl && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">File</p>
                  <a href={selectedDocument.fileUrl} target="_blank" className="text-sm text-blue-600 underline flex items-center gap-1">
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Document">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedDocument?.title || selectedDocument?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
