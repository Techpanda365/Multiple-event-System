// app/dashboard/sales/meetings/page.tsx
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
  Calendar,
  Building2,
  User,
  Users,
  Video,
  Clock,
} from "lucide-react";

type Meeting = {
  id: string;
  name: string;
  parent: string;
  parentType: "Account" | "Contact" | "Opportunity" | "Case";
  account: string;
  startDate: string;
  assignedUser: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  meetingType?: "In Person" | "Virtual" | "Phone";
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

const sampleMeetings: Meeting[] = [
  {
    id: "1",
    name: "Performance Review Meeting",
    parent: "Account",
    parentType: "Account",
    account: "Publishing & Media House",
    startDate: "2025-11-13",
    assignedUser: "James Garcia",
    status: "Cancelled",
  },
  {
    id: "2",
    name: "Project Kickoff Meeting",
    parent: "Opportunity",
    parentType: "Opportunity",
    account: "TechCorp Solutions",
    startDate: "2025-11-12",
    assignedUser: "Daniel Thompson",
    status: "Scheduled",
  },
  {
    id: "3",
    name: "Quality Assurance Review",
    parent: "Case",
    parentType: "Case",
    account: "Educational Services Inc",
    startDate: "2025-09-09",
    assignedUser: "Michael Brown",
    status: "Completed",
  },
  {
    id: "4",
    name: "Quality Assurance Review",
    parent: "Opportunity",
    parentType: "Opportunity",
    account: "Logistics & Transportation",
    startDate: "2025-10-04",
    assignedUser: "Daniel Thompson",
    status: "Completed",
  },
  {
    id: "5",
    name: "Partnership Discussion",
    parent: "Case",
    parentType: "Case",
    account: "Security Systems Ltd",
    startDate: "2026-01-23",
    assignedUser: "Mark Allen",
    status: "In Progress",
  },
  {
    id: "6",
    name: "Budget Planning Meeting",
    parent: "Account",
    parentType: "Account",
    account: "TechCorp Solutions",
    startDate: "2025-10-07",
    assignedUser: "James Garcia",
    status: "Cancelled",
  },
  {
    id: "7",
    name: "Training Session",
    parent: "Case",
    parentType: "Case",
    account: "TechCorp Solutions",
    startDate: "2026-01-02",
    assignedUser: "David Wilson",
    status: "In Progress",
  },
  {
    id: "8",
    name: "Integration Planning",
    parent: "Contact",
    parentType: "Contact",
    account: "Digital Marketing Agency",
    startDate: "2025-12-05",
    assignedUser: "Anthony Walker",
    status: "Completed",
  },
  {
    id: "9",
    name: "Customer Feedback Session",
    parent: "Opportunity",
    parentType: "Opportunity",
    account: "Global Manufacturing Inc",
    startDate: "2025-11-21",
    assignedUser: "David Wilson",
    status: "In Progress",
  },
  {
    id: "10",
    name: "Quality Assurance Review",
    parent: "Account",
    parentType: "Account",
    account: "Food & Beverage Corp",
    startDate: "2025-12-29",
    assignedUser: "Daniel Thompson",
    status: "Scheduled",
  },
];

const statusColors: Record<string, string> = {
  Scheduled: "bg-blue-500/10 text-blue-700",
  "In Progress": "bg-yellow-500/10 text-yellow-700",
  Completed: "bg-green-500/10 text-green-700",
  Cancelled: "bg-red-500/10 text-red-700",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    status: "Scheduled",
    startDate: "",
    endDate: "",
    meetingType: "In Person",
    parentType: "",
    parentRecord: "",
    account: "",
    assignedUser: "",
    description: "",
    attendeesUsers: [] as string[],
    attendeesContacts: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    name: "",
    parent: "",
    account: "",
    startDate: "",
    assignedUser: "",
    status: "",
  });

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(meetings.map((m) => m.status));
    return Array.from(statuses);
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (meeting) =>
          meeting.name.toLowerCase().includes(q) ||
          meeting.parent.toLowerCase().includes(q) ||
          meeting.account.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((meeting) => meeting.status === statusFilter);
    }

    return filtered;
  }, [meetings, search, statusFilter]);

  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const paginatedMeetings = filteredMeetings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleView = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsViewModalOpen(true);
  };

  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setEditForm({
      name: meeting.name,
      parent: meeting.parent,
      account: meeting.account,
      startDate: meeting.startDate,
      assignedUser: meeting.assignedUser,
      status: meeting.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (selectedMeeting) {
      const updatedMeetings = meetings.map((m) =>
        m.id === selectedMeeting.id
          ? {
              ...m,
              name: editForm.name,
              parent: editForm.parent,
              account: editForm.account,
              startDate: editForm.startDate,
              assignedUser: editForm.assignedUser,
              status: editForm.status as "Scheduled" | "In Progress" | "Completed" | "Cancelled",
            }
          : m
      );
      setMeetings(updatedMeetings);
      setIsEditModalOpen(false);
      setSelectedMeeting(null);
    }
  };

  const handleDelete = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedMeeting) {
      const updatedMeetings = meetings.filter((m) => m.id !== selectedMeeting.id);
      setMeetings(updatedMeetings);
      setIsDeleteModalOpen(false);
      setSelectedMeeting(null);
    }
  };

  const handleCreateMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      name: createForm.name || "New Meeting",
      parent: createForm.parentRecord || "New Parent",
      parentType: createForm.parentType as "Account" | "Contact" | "Opportunity" | "Case" || "Account",
      account: createForm.account || "New Account",
      startDate: createForm.startDate || new Date().toISOString().split('T')[0],
      assignedUser: createForm.assignedUser || "Unassigned",
      status: createForm.status as "Scheduled" | "In Progress" | "Completed" | "Cancelled",
      meetingType: createForm.meetingType as "In Person" | "Virtual" | "Phone",
    };
    setMeetings([newMeeting, ...meetings]);
    setIsCreateModalOpen(false);
    setCreateForm({
      name: "",
      status: "Scheduled",
      startDate: "",
      endDate: "",
      meetingType: "In Person",
      parentType: "",
      parentRecord: "",
      account: "",
      assignedUser: "",
      description: "",
      attendeesUsers: [],
      attendeesContacts: [],
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Meetings</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Meeting
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
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
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Parent</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Account</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start Date</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assigned User</th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-center p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMeetings.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No meetings found</td></tr>
                    ) : (
                      paginatedMeetings.map((meeting, index) => (
                        <tr key={meeting.id} className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{meeting.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{meeting.parent}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{meeting.account}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{meeting.startDate}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                  {getInitials(meeting.assignedUser)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{meeting.assignedUser}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge className={statusColors[meeting.status] || "bg-gray-500/10 text-gray-700"}>
                              {meeting.status}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleView(meeting)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(meeting)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(meeting)}><Trash2 className="h-4 w-4" /></Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMeetings.length)} of {filteredMeetings.length} results
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
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Meeting Details" maxWidth="max-w-2xl">
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">{selectedMeeting.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMeeting.parent}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Account</p><p className="text-sm font-medium">{selectedMeeting.account}</p></div>
              <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium">{selectedMeeting.startDate}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned User</p><p className="text-sm font-medium">{selectedMeeting.assignedUser}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground">Status</p><Badge className={statusColors[selectedMeeting.status]}>{selectedMeeting.status}</Badge></div>
            </div>
            <Button className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Meeting">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Parent</label><Input value={editForm.parent} onChange={(e) => setEditForm({ ...editForm, parent: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Account</label><Input value={editForm.account} onChange={(e) => setEditForm({ ...editForm, account: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Start Date</label><Input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Assigned User</label><SimpleSelect value={editForm.assignedUser} onValueChange={(value: string) => setEditForm({ ...editForm, assignedUser: value })}><option value="John Smith">John Smith</option><option value="James Garcia">James Garcia</option><option value="Christopher Lee">Christopher Lee</option></SimpleSelect></div>
          <div className="space-y-2"><label className="text-sm font-medium">Status</label><SimpleSelect value={editForm.status} onValueChange={(value: string) => setEditForm({ ...editForm, status: value })}><option value="Scheduled">Scheduled</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></SimpleSelect></div>
          <div className="flex gap-2 pt-4"><Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button className="flex-1" onClick={handleEditSave}>Save Changes</Button></div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Meeting">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-medium text-foreground">{selectedMeeting?.name}</span>? This action cannot be undone.</p>
          <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" className="flex-1" onClick={handleDeleteConfirm}>Delete</Button></div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Meeting" maxWidth="max-4xl">
        <div className="space-y-4">
          <div className="space-y-2"><label className="text-sm font-medium">Name <span className="text-red-500">*</span></label><Input placeholder="Enter meeting name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Status</label><SimpleSelect value={createForm.status} onValueChange={(value: string) => setCreateForm({ ...createForm, status: value })}><option value="Scheduled">Scheduled</option><option value="In Progress">In Progress</option></SimpleSelect></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Start Date <span className="text-red-500">*</span></label><Input type="datetime-local" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">End Date <span className="text-red-500">*</span></label><Input type="datetime-local" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Meeting Type</label><SimpleSelect value={createForm.meetingType} onValueChange={(value: string) => setCreateForm({ ...createForm, meetingType: value })}><option value="In Person">In Person</option><option value="Virtual">Virtual</option><option value="Phone">Phone</option></SimpleSelect></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Parent Type</label><SimpleSelect value={createForm.parentType} onValueChange={(value: string) => setCreateForm({ ...createForm, parentType: value })} placeholder="Select parent type"><option value="Account">Account</option><option value="Contact">Contact</option><option value="Opportunity">Opportunity</option><option value="Case">Case</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Parent Record</label><SimpleSelect value={createForm.parentRecord} onValueChange={(value: string) => setCreateForm({ ...createForm, parentRecord: value })} placeholder="Select parent type first"><option value="Parent 1">Parent 1</option></SimpleSelect></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Account</label><SimpleSelect value={createForm.account} onValueChange={(value: string) => setCreateForm({ ...createForm, account: value })} placeholder="Select account"><option value="TechCorp Solutions">TechCorp Solutions</option><option value="Global Manufacturing Inc">Global Manufacturing Inc</option></SimpleSelect></div>
            <div className="space-y-2"><label className="text-sm font-medium">Assigned User</label><SimpleSelect value={createForm.assignedUser} onValueChange={(value: string) => setCreateForm({ ...createForm, assignedUser: value })} placeholder="Select user"><option value="John Smith">John Smith</option><option value="James Garcia">James Garcia</option></SimpleSelect></div>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea placeholder="Enter description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" /></div>
          <div className="flex gap-2 pt-4 border-t border-border"><Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button className="flex-1" onClick={handleCreateMeeting}>Create</Button></div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}