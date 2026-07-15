// app/dashboard/work-permit/permit-types/page.tsx
"use client";

import { useMemo, useState } from "react";
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
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Circle,
} from "lucide-react";

type PermitType = {
  id: string;
  typeName: string;
  validityPeriod: number;
  colorCode: string;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  status: "Active" | "Inactive";
  description?: string;
};

// Simple Select component for filter
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

// Simple Select for form
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

// Simple Modal component
const Modal = ({ isOpen, onClose, title, children, maxWidth }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full ${maxWidth || 'max-w-2xl'} max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6 shadow-lg`}>
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

// Sample permit types data
const samplePermitTypes: PermitType[] = [
  {
    id: "1",
    typeName: "Hot Work Permit",
    validityPeriod: 1,
    colorCode: "#ef4444",
    riskLevel: "High",
    status: "Inactive",
    description: "For hot work activities like welding, cutting, grinding",
  },
  {
    id: "2",
    typeName: "Cold Work Permit",
    validityPeriod: 3,
    colorCode: "#3b82f6",
    riskLevel: "Medium",
    status: "Active",
    description: "For cold work activities not involving heat",
  },
  {
    id: "3",
    typeName: "Electrical Work Permit",
    validityPeriod: 1,
    colorCode: "#22c55e",
    riskLevel: "Low",
    status: "Inactive",
    description: "For electrical installation and maintenance work",
  },
  {
    id: "4",
    typeName: "Confined Space Permit",
    validityPeriod: 1,
    colorCode: "#ef4444",
    riskLevel: "Critical",
    status: "Active",
    description: "For work in confined spaces",
  },
  {
    id: "5",
    typeName: "Work at Height Permit",
    validityPeriod: 2,
    colorCode: "#f59e0b",
    riskLevel: "High",
    status: "Active",
    description: "For work at height above 2 meters",
  },
  {
    id: "6",
    typeName: "Excavation Permit",
    validityPeriod: 2,
    colorCode: "#22c55e",
    riskLevel: "Low",
    status: "Active",
    description: "For excavation work",
  },
  {
    id: "7",
    typeName: "Lifting Operation Permit",
    validityPeriod: 1,
    colorCode: "#ef4444",
    riskLevel: "High",
    status: "Active",
    description: "For lifting operations",
  },
  {
    id: "8",
    typeName: "Chemical Handling Permit",
    validityPeriod: 2,
    colorCode: "#ef4444",
    riskLevel: "Critical",
    status: "Active",
    description: "For handling hazardous chemicals",
  },
  {
    id: "9",
    typeName: "General Maintenance Permit",
    validityPeriod: 5,
    colorCode: "#3b82f6",
    riskLevel: "Medium",
    status: "Active",
    description: "For general maintenance work",
  },
];

const riskLevelColors: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  High: "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  Medium: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Low: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
};

const statusColors: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Inactive: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export default function PermitTypesPage() {
  const [permitTypes, setPermitTypes] = useState<PermitType[]>(samplePermitTypes);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPermit, setSelectedPermit] = useState<PermitType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    typeName: "",
    validityPeriod: "",
    colorCode: "#3b82f6",
    riskLevel: "Medium",
    status: "Active",
    description: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    typeName: "",
    validityPeriod: "",
    colorCode: "",
    riskLevel: "",
    status: "",
    description: "",
  });

  // Get unique risk levels for filter
  const uniqueRiskLevels = useMemo(() => {
    const levels = new Set(permitTypes.map((p) => p.riskLevel));
    return Array.from(levels);
  }, [permitTypes]);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(permitTypes.map((p) => p.status));
    return Array.from(statuses);
  }, [permitTypes]);

  // Filter permit types
  const filteredPermitTypes = useMemo(() => {
    let filtered = permitTypes;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.typeName.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter((p) => p.riskLevel === riskFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    return filtered;
  }, [permitTypes, search, riskFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPermitTypes.length / itemsPerPage);
  const paginatedPermitTypes = filteredPermitTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // View Permit Type
  const handleView = (permit: PermitType) => {
    setSelectedPermit(permit);
    setIsViewModalOpen(true);
  };

  // Edit Permit Type
  const handleEdit = (permit: PermitType) => {
    setSelectedPermit(permit);
    setEditForm({
      typeName: permit.typeName,
      validityPeriod: String(permit.validityPeriod),
      colorCode: permit.colorCode,
      riskLevel: permit.riskLevel,
      status: permit.status,
      description: permit.description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (selectedPermit) {
      const updatedPermitTypes = permitTypes.map((p) =>
        p.id === selectedPermit.id
          ? {
              ...p,
              typeName: editForm.typeName,
              validityPeriod: parseInt(editForm.validityPeriod),
              colorCode: editForm.colorCode,
              riskLevel: editForm.riskLevel as "Critical" | "High" | "Medium" | "Low",
              status: editForm.status as "Active" | "Inactive",
              description: editForm.description,
            }
          : p
      );
      setPermitTypes(updatedPermitTypes);
      setIsEditModalOpen(false);
      setSelectedPermit(null);
    }
  };

  // Delete Permit Type
  const handleDelete = (permit: PermitType) => {
    setSelectedPermit(permit);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPermit) {
      const updatedPermitTypes = permitTypes.filter((p) => p.id !== selectedPermit.id);
      setPermitTypes(updatedPermitTypes);
      setIsDeleteModalOpen(false);
      setSelectedPermit(null);
    }
  };

  // Create Permit Type
  const handleCreatePermit = () => {
    const newPermit: PermitType = {
      id: Date.now().toString(),
      typeName: createForm.typeName,
      validityPeriod: parseInt(createForm.validityPeriod) || 1,
      colorCode: createForm.colorCode,
      riskLevel: createForm.riskLevel as "Critical" | "High" | "Medium" | "Low",
      status: createForm.status as "Active" | "Inactive",
      description: createForm.description,
    };
    setPermitTypes([newPermit, ...permitTypes]);
    setIsCreateModalOpen(false);
    setCreateForm({
      typeName: "",
      validityPeriod: "",
      colorCode: "#3b82f6",
      riskLevel: "Medium",
      status: "Active",
      description: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Permit Types</h1>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Permit Type
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Permit Types..."
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
              value={riskFilter}
              onValueChange={(value) => {
                setRiskFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Risk</option>
              {uniqueRiskLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
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
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </FilterSelect>
            <div className="text-sm text-muted-foreground">
              {itemsPerPage} per page
            </div>
          </div>
        </div>

        {/* Permit Types Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Type Name
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Validity Period Days
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Color Code
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPermitTypes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No permit types found
                        </td>
                      </tr>
                    ) : (
                      paginatedPermitTypes.map((permit, index) => (
                        <tr
                          key={permit.id}
                          className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/5"
                          }`}
                        >
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{permit.typeName}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge variant="secondary" className="font-mono">
                              {permit.validityPeriod}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 w-6 rounded-full border border-border"
                                style={{ backgroundColor: permit.colorCode }}
                              />
                              <span className="text-xs text-muted-foreground">{permit.colorCode}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={riskLevelColors[permit.riskLevel]}>
                              {permit.riskLevel}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[permit.status]}>
                              {permit.status}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleView(permit)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(permit)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(permit)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredPermitTypes.length)} of{" "}
              {filteredPermitTypes.length} results
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Permit Type Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Permit Type Details"
      >
        {selectedPermit && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedPermit.colorCode + "20" }}
              >
                <Shield className="h-5 w-5" style={{ color: selectedPermit.colorCode }} />
              </div>
              <div>
                <p className="font-medium">{selectedPermit.typeName}</p>
                <p className="text-sm text-muted-foreground">Permit Type</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Validity Period</p>
                <p className="text-sm font-medium">{selectedPermit.validityPeriod} days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Color Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ backgroundColor: selectedPermit.colorCode }}
                  />
                  <span className="text-sm">{selectedPermit.colorCode}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <Badge className={riskLevelColors[selectedPermit.riskLevel]}>
                  {selectedPermit.riskLevel}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className={statusColors[selectedPermit.status]}>
                  {selectedPermit.status}
                </Badge>
              </div>
              {selectedPermit.description && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedPermit.description}</p>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit Permit Type Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Permit Type"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type Name</label>
            <Input
              value={editForm.typeName}
              onChange={(e) => setEditForm({ ...editForm, typeName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Validity Period (Days)</label>
            <Input
              type="number"
              value={editForm.validityPeriod}
              onChange={(e) => setEditForm({ ...editForm, validityPeriod: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color Code</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={editForm.colorCode}
                onChange={(e) => setEditForm({ ...editForm, colorCode: e.target.value })}
                className="w-12 h-10 rounded-md border border-input cursor-pointer p-0.5 bg-transparent"
              />
              <Input
                type="text"
                value={editForm.colorCode}
                onChange={(e) => setEditForm({ ...editForm, colorCode: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Level</label>
            <SimpleSelect
              value={editForm.riskLevel}
              onValueChange={(value: string) =>
                setEditForm({ ...editForm, riskLevel: value })
              }
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </SimpleSelect>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <SimpleSelect
              value={editForm.status}
              onValueChange={(value: string) =>
                setEditForm({ ...editForm, status: value })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </SimpleSelect>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Enter Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleEditSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Permit Type"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{selectedPermit?.typeName}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Permit Type Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Permit Type"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter Type Name"
              value={createForm.typeName}
              onChange={(e) =>
                setCreateForm({ ...createForm, typeName: e.target.value })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Validity Period (Days) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="Enter Validity Period"
              value={createForm.validityPeriod}
              onChange={(e) =>
                setCreateForm({ ...createForm, validityPeriod: e.target.value })
              }
              className="w-full"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color Code</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={createForm.colorCode}
                onChange={(e) =>
                  setCreateForm({ ...createForm, colorCode: e.target.value })
                }
                className="w-12 h-10 rounded-md border border-input cursor-pointer p-0.5 bg-transparent"
              />
              <Input
                type="text"
                placeholder="#3b82f6"
                value={createForm.colorCode}
                onChange={(e) =>
                  setCreateForm({ ...createForm, colorCode: e.target.value })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Risk Level <span className="text-red-500">*</span>
            </label>
            <SimpleSelect
              value={createForm.riskLevel}
              onValueChange={(value: string) =>
                setCreateForm({ ...createForm, riskLevel: value })
              }
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </SimpleSelect>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Status <span className="text-red-500">*</span>
            </label>
            <SimpleSelect
              value={createForm.status}
              onValueChange={(value: string) =>
                setCreateForm({ ...createForm, status: value })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </SimpleSelect>
          </div>

          {/* ✅ Description Field Added */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="Enter Description"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreatePermit}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}