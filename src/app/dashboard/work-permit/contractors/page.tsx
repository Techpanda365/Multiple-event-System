// app/dashboard/work-permit/contractors/page.tsx
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
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  Star,
  MapPin,
  FileText,
} from "lucide-react";

type Contractor = {
  id: string;
  companyName: string;
  companyCode: string;
  contactPerson: string;
  phoneNumber: string;
  emailAddress?: string;
  licenseExpiryDate: string;
  safetyRating: number;
  licenseNumber?: string;
  address?: string;
  insuranceDetails?: string;
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

// Sample contractors data
const sampleContractors: Contractor[] = [
  {
    id: "1",
    companyName: "Alpha Industrial Services",
    companyCode: "AIS001",
    contactPerson: "John Carter",
    phoneNumber: "+14155550101",
    emailAddress: "john@alphaindustrial.com",
    licenseExpiryDate: "2027-03-15",
    safetyRating: 4,
    licenseNumber: "LIC-2024-001",
    address: "123 Industrial Park, Houston, TX",
    insuranceDetails: "ABC Insurance - Policy #12345",
  },
  {
    id: "2",
    companyName: "Skyline Electrical Ltd",
    companyCode: "SEL002",
    contactPerson: "Michael Brown",
    phoneNumber: "+14155550102",
    emailAddress: "michael@skylineelectrical.com",
    licenseExpiryDate: "2026-11-20",
    safetyRating: 5,
  },
  {
    id: "3",
    companyName: "Prime Mechanical Works",
    companyCode: "PMW003",
    contactPerson: "David Wilson",
    phoneNumber: "+14155550103",
    emailAddress: "david@primemechanical.com",
    licenseExpiryDate: "2027-06-10",
    safetyRating: 3,
  },
  {
    id: "4",
    companyName: "Safelift Crane Services",
    companyCode: "SLC004",
    contactPerson: "Robert Taylor",
    phoneNumber: "+14155550104",
    emailAddress: "robert@safelift.com",
    licenseExpiryDate: "2026-09-05",
    safetyRating: 5,
  },
  {
    id: "5",
    companyName: "GreenField Excavation",
    companyCode: "GFE005",
    contactPerson: "William Anderson",
    phoneNumber: "+14155550105",
    emailAddress: "william@greenfield.com",
    licenseExpiryDate: "2027-01-18",
    safetyRating: 4,
  },
  {
    id: "6",
    companyName: "BrightSpark Electrical",
    companyCode: "BSE006",
    contactPerson: "James Miller",
    phoneNumber: "+14155550106",
    emailAddress: "james@brightspark.com",
    licenseExpiryDate: "2026-12-12",
    safetyRating: 4,
  },
  {
    id: "7",
    companyName: "Titan Construction Group",
    companyCode: "TCG007",
    contactPerson: "Christopher Lee",
    phoneNumber: "+14155550107",
    emailAddress: "chris@titanconstruction.com",
    licenseExpiryDate: "2027-08-30",
    safetyRating: 5,
  },
  {
    id: "8",
    companyName: "Secure Pipeline Services",
    companyCode: "SPS008",
    contactPerson: "Daniel Martinez",
    phoneNumber: "+14155550108",
    emailAddress: "daniel@securepipeline.com",
    licenseExpiryDate: "2026-10-25",
    safetyRating: 3,
  },
  {
    id: "9",
    companyName: "Rapid Maintenance Co",
    companyCode: "RMC009",
    contactPerson: "Anthony Harris",
    phoneNumber: "+14155550109",
    emailAddress: "anthony@rapidmaintenance.com",
    licenseExpiryDate: "2027-04-14",
    safetyRating: 4,
  },
  {
    id: "10",
    companyName: "Eagle Safety Solutions",
    companyCode: "ESS010",
    contactPerson: "Matthew Clark",
    phoneNumber: "+14155550110",
    emailAddress: "matthew@eaglesafety.com",
    licenseExpiryDate: "2027-02-02",
    safetyRating: 5,
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
};

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>(sampleContractors);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    companyName: "",
    companyCode: "",
    contactPerson: "",
    phoneNumber: "",
    emailAddress: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    address: "",
    insuranceDetails: "",
    safetyRating: 3,
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    companyName: "",
    companyCode: "",
    contactPerson: "",
    phoneNumber: "",
    emailAddress: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    address: "",
    insuranceDetails: "",
    safetyRating: 3,
  });

  // Filter contractors
  const filteredContractors = useMemo(() => {
    let filtered = contractors;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.companyCode.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q)
      );
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter((c) => c.safetyRating === parseInt(ratingFilter));
    }

    return filtered;
  }, [contractors, search, ratingFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredContractors.length / itemsPerPage);
  const paginatedContractors = filteredContractors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // View Contractor
  const handleView = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsViewModalOpen(true);
  };

  // Edit Contractor
  const handleEdit = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setEditForm({
      companyName: contractor.companyName,
      companyCode: contractor.companyCode,
      contactPerson: contractor.contactPerson,
      phoneNumber: contractor.phoneNumber,
      emailAddress: contractor.emailAddress || "",
      licenseNumber: contractor.licenseNumber || "",
      licenseExpiryDate: contractor.licenseExpiryDate,
      address: contractor.address || "",
      insuranceDetails: contractor.insuranceDetails || "",
      safetyRating: contractor.safetyRating,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (selectedContractor) {
      const updatedContractors = contractors.map((c) =>
        c.id === selectedContractor.id
          ? {
              ...c,
              companyName: editForm.companyName,
              companyCode: editForm.companyCode,
              contactPerson: editForm.contactPerson,
              phoneNumber: editForm.phoneNumber,
              emailAddress: editForm.emailAddress,
              licenseNumber: editForm.licenseNumber,
              licenseExpiryDate: editForm.licenseExpiryDate,
              address: editForm.address,
              insuranceDetails: editForm.insuranceDetails,
              safetyRating: editForm.safetyRating,
            }
          : c
      );
      setContractors(updatedContractors);
      setIsEditModalOpen(false);
      setSelectedContractor(null);
    }
  };

  // Delete Contractor
  const handleDelete = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedContractor) {
      const updatedContractors = contractors.filter((c) => c.id !== selectedContractor.id);
      setContractors(updatedContractors);
      setIsDeleteModalOpen(false);
      setSelectedContractor(null);
    }
  };

  // Create Contractor
  const handleCreateContractor = () => {
    const newContractor: Contractor = {
      id: Date.now().toString(),
      companyName: createForm.companyName,
      companyCode: createForm.companyCode,
      contactPerson: createForm.contactPerson,
      phoneNumber: createForm.phoneNumber,
      emailAddress: createForm.emailAddress,
      licenseNumber: createForm.licenseNumber,
      licenseExpiryDate: createForm.licenseExpiryDate,
      address: createForm.address,
      insuranceDetails: createForm.insuranceDetails,
      safetyRating: createForm.safetyRating,
    };
    setContractors([newContractor, ...contractors]);
    setIsCreateModalOpen(false);
    setCreateForm({
      companyName: "",
      companyCode: "",
      contactPerson: "",
      phoneNumber: "",
      emailAddress: "",
      licenseNumber: "",
      licenseExpiryDate: "",
      address: "",
      insuranceDetails: "",
      safetyRating: 3,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Contractors</h1>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Contractor
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Company Name, Code or Contact"
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
              value={ratingFilter}
              onValueChange={(value) => {
                setRatingFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </FilterSelect>
            <div className="text-sm text-muted-foreground">
              {itemsPerPage} per page
            </div>
          </div>
        </div>

        {/* Contractors Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Company Code
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        License Expiry Date
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Safety Rating
                      </th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedContractors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No contractors found
                        </td>
                      </tr>
                    ) : (
                      paginatedContractors.map((contractor, index) => (
                        <tr
                          key={contractor.id}
                          className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/5"
                          }`}
                        >
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{contractor.companyName}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge variant="secondary" className="font-mono">
                              {contractor.companyCode}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                  {getInitials(contractor.contactPerson)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{contractor.contactPerson}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{contractor.phoneNumber}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{contractor.licenseExpiryDate}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            {renderStars(contractor.safetyRating)}
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleView(contractor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(contractor)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(contractor)}
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
              {Math.min(currentPage * itemsPerPage, filteredContractors.length)} of{" "}
              {filteredContractors.length} entries
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

      {/* View Contractor Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Contractor Details"
        maxWidth="max-w-2xl"
      >
        {selectedContractor && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">{selectedContractor.companyName}</p>
                <p className="text-sm text-muted-foreground">{selectedContractor.companyCode}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Contact Person</p>
                <p className="text-sm font-medium">{selectedContractor.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium">{selectedContractor.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm font-medium">{selectedContractor.emailAddress || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">License Number</p>
                <p className="text-sm font-medium">{selectedContractor.licenseNumber || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">License Expiry Date</p>
                <p className="text-sm font-medium">{selectedContractor.licenseExpiryDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Safety Rating</p>
                {renderStars(selectedContractor.safetyRating)}
              </div>
              {selectedContractor.address && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{selectedContractor.address}</p>
                </div>
              )}
              {selectedContractor.insuranceDetails && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Insurance Details</p>
                  <p className="text-sm">{selectedContractor.insuranceDetails}</p>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit Contractor Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contractor"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={editForm.companyName}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Code</label>
              <Input
                value={editForm.companyCode}
                onChange={(e) => setEditForm({ ...editForm, companyCode: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <Input
                value={editForm.contactPerson}
                onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                value={editForm.emailAddress}
                onChange={(e) => setEditForm({ ...editForm, emailAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">License Number</label>
              <Input
                value={editForm.licenseNumber}
                onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">License Expiry Date</label>
              <Input
                type="date"
                value={editForm.licenseExpiryDate}
                onChange={(e) => setEditForm({ ...editForm, licenseExpiryDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Safety Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, safetyRating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= editForm.safetyRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Insurance Details</label>
            <Input
              value={editForm.insuranceDetails}
              onChange={(e) => setEditForm({ ...editForm, insuranceDetails: e.target.value })}
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
        title="Delete Contractor"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{selectedContractor?.companyName}</span>?
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

      {/* Create Contractor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Contractor"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Company Name"
                value={createForm.companyName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, companyName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Company Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Company Code"
                value={createForm.companyCode}
                onChange={(e) =>
                  setCreateForm({ ...createForm, companyCode: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Contact Person"
                value={createForm.contactPerson}
                onChange={(e) =>
                  setCreateForm({ ...createForm, contactPerson: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="+1234567890"
                value={createForm.phoneNumber}
                onChange={(e) =>
                  setCreateForm({ ...createForm, phoneNumber: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Format: +[country code][phone number]
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter Email Address"
                value={createForm.emailAddress}
                onChange={(e) =>
                  setCreateForm({ ...createForm, emailAddress: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                License Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter License Number"
                value={createForm.licenseNumber}
                onChange={(e) =>
                  setCreateForm({ ...createForm, licenseNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                License Expiry Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={createForm.licenseExpiryDate}
                onChange={(e) =>
                  setCreateForm({ ...createForm, licenseExpiryDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Safety Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, safetyRating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= createForm.safetyRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              placeholder="Enter Address"
              value={createForm.address}
              onChange={(e) =>
                setCreateForm({ ...createForm, address: e.target.value })
              }
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Insurance Details</label>
            <Input
              type="text"
              placeholder="Enter Insurance Details"
              value={createForm.insuranceDetails}
              onChange={(e) =>
                setCreateForm({ ...createForm, insuranceDetails: e.target.value })
              }
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
            <Button className="flex-1" onClick={handleCreateContractor}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}   