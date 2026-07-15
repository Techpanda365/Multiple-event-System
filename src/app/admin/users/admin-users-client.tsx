// app/admin/users/admin-users-client.tsx
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
  UserPlus,
  Mail,
  Phone,
  Building2,
  Eye,
  Pencil,
  Trash2,
  X,
  LogIn,
  AlertTriangle,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  company?: string;
};

interface Props {
  users: User[];
  user?: { id?: string; name?: string | null; email?: string; role?: string; image?: string | null } | null;
}

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
const Modal = ({ isOpen, onClose, title, children, className }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg ${className || ""}`}>
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

const statusColors: Record<string, string> = {
  Enabled: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Disabled: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  Suspended: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  ADMIN: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  MANAGER: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  STAFF: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  USER: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export function AdminUsersClient({ users: initialUsers, user }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginHistoryOpen, setIsLoginHistoryOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", company: "", status: "Enabled" });
  const [editMsg, setEditMsg] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isLoginAsOpen, setIsLoginAsOpen] = useState(false);
  const [loginAsUser, setLoginAsUser] = useState<User | null>(null);
  const [users, setUsers] = useState(initialUsers);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    company: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    loginStatus: "Enabled",
  });
  const [createUserMsg, setCreateUserMsg] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(initialUsers.map((user) => user.role));
    return Array.from(roles);
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q) ||
          (user.company && user.company.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  }, [users, search, statusFilter, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleCreateUser = async () => {
    setCreateUserMsg("");
    if (!newUser.email || !newUser.password) {
      setCreateUserMsg("Email and password are required");
      return;
    }
    if (newUser.password.length < 6) {
      setCreateUserMsg("Password must be at least 6 characters");
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      setCreateUserMsg("Passwords do not match");
      return;
    }
    setCreatingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: newUser.email,
              password: newUser.password,
              name: newUser.name || undefined,
              companyName: newUser.company || undefined,
              phone: newUser.mobile || undefined,
              role: "ADMIN",
              isActive: newUser.loginStatus === "Enabled",
            }),
      });
      const data = await res.json();
      if (res.ok) {
        const created = data.user;
        setUsers((prev) => [{ id: created.id, name: created.name || "", email: created.email, role: created.role, status: created.isActive ? "Enabled" : "Disabled", company: created.companyName || "" }, ...prev]);
        setIsCreateModalOpen(false);
        setNewUser({ name: "", email: "", company: "", mobile: "", password: "", confirmPassword: "", loginStatus: "Enabled" });
        setCreateUserMsg("");
        // Success toast — workspace auto-bani
        if (data.workspace) {
          alert(`✅ Company owner created!\nWorkspace "${data.workspace.name}" bhi automatically ban gayi.\n\nLogin credentials:\nEmail: ${created.email}`);
        }
      } else {
        setCreateUserMsg(data.error || "Failed to create user");
      }
    } catch {
      setCreateUserMsg("Network error - could not create user");
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <DashboardLayout title="Users" user={user}>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => { setCreateUserMsg(""); setIsCreateModalOpen(true); }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
              <option value="Suspended">Suspended</option>
            </FilterSelect>
            <FilterSelect
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                handleFilterChange();
              }}
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </FilterSelect>
            <div className="text-sm text-muted-foreground">
              {itemsPerPage} per page
            </div>
          </div>
        </div>

        {/* Users Cards - Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            paginatedUsers.map((user, index) => (
              <Card
                key={user.id}
                className="rounded-xl hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {user.company || `${user.name}`}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {user.company ? user.company : "User"}
                        </span>
                      </div>
                    </div>
                    <Badge className={statusColors[user.status]}>
                      {user.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs">{user.phone || "—"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <Badge className={roleColors[user.role] || "bg-gray-500/10 text-gray-700"}>
                      {user.role.replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingUser(user); setEditForm({ name: user.name, email: user.email, phone: user.phone || "", company: user.company || "", status: user.status }); setEditMsg(""); setIsEditModalOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => { setSelectedUser(user); setIsDeleteConfirmOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-8 rounded-lg" onClick={() => { setLoginAsUser(user); setIsLoginAsOpen(true); }}>
                    <LogIn className="h-3.5 w-3.5" />
                    Login as User
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} entries
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

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setCreateUserMsg(""); setIsCreateModalOpen(false); }}
        title="Create New User"
      >
        <div className="space-y-4">
          {createUserMsg && (
            <div className={`p-3 rounded-lg text-sm ${createUserMsg === "User created successfully" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {createUserMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="John Doe"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile No</label>
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={newUser.mobile}
              onChange={(e) =>
                setNewUser({ ...newUser, mobile: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Input
              placeholder="Company name"
              value={newUser.company}
              onChange={(e) =>
                setNewUser({ ...newUser, company: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newUser.confirmPassword}
              onChange={(e) =>
                setNewUser({ ...newUser, confirmPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Login Status</label>
            <FilterSelect
              value={newUser.loginStatus}
              onValueChange={(value) =>
                setNewUser({ ...newUser, loginStatus: value })
              }
            >
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </FilterSelect>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setCreateUserMsg(""); setIsCreateModalOpen(false); }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreateUser} disabled={creatingUser}>
              {creatingUser ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Login History Modal */}
      <Modal
        isOpen={isLoginHistoryOpen}
        onClose={() => setIsLoginHistoryOpen(false)}
        title="Login History"
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">
                    User
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">
                    Role
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">
                    IP Address
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">
                    Location & Device
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">
                    Time
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-3">Super Admin</td>
                  <td className="p-3">
                    <Badge className="bg-red-500/10 text-red-700">SUPER_ADMIN</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">192.168.1.1</td>
                  <td className="p-3 text-muted-foreground">Mumbai, IN · Chrome on Windows</td>
                  <td className="p-3 text-muted-foreground">2 mins ago</td>
                  <td className="p-3">
                    <Badge className="bg-green-500/10 text-green-700">Success</Badge>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-3">Company User</td>
                  <td className="p-3">
                    <Badge className="bg-purple-500/10 text-purple-700">ADMIN</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">192.168.1.2</td>
                  <td className="p-3 text-muted-foreground">Delhi, IN · Chrome on Android</td>
                  <td className="p-3 text-muted-foreground">1 hour ago</td>
                  <td className="p-3">
                    <Badge className="bg-green-500/10 text-green-700">Success</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Guest User</td>
                  <td className="p-3">
                    <Badge className="bg-blue-500/10 text-blue-700">USER</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">192.168.1.3</td>
                  <td className="p-3 text-muted-foreground">Bangalore, IN · Safari on macOS</td>
                  <td className="p-3 text-muted-foreground">3 hours ago</td>
                  <td className="p-3">
                    <Badge className="bg-red-500/10 text-red-700">Failed</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsLoginHistoryOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
        className="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge className={roleColors[selectedUser.role]}>{selectedUser.role.replace("_", " ")}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className={statusColors[selectedUser.status]}>{selectedUser.status}</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setEditMsg(""); setIsEditModalOpen(false); }}
        title="Edit User"
      >
        {editingUser && (
          <div className="space-y-4">
            {editMsg && (
              <div className={`p-3 rounded-lg text-sm ${editMsg === "User updated successfully" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {editMsg}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile No</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setEditMsg(""); setIsEditModalOpen(false); }}>Cancel</Button>
              <Button className="flex-1" onClick={async () => {
                setSavingEdit(true);
                setEditMsg("");
                try {
                  const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: editForm.name,
                      email: editForm.email,
                      phone: editForm.phone || null,
                      companyName: editForm.company || null,
                      isActive: editForm.status === "Enabled",
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, name: editForm.name, email: editForm.email, phone: editForm.phone || null, company: editForm.company, status: editForm.status } : u));
                    setEditMsg("User updated successfully");
                  } else {
                    setEditMsg(data.error || "Failed to update user");
                  }
                } catch {
                  setEditMsg("Network error");
                } finally {
                  setSavingEdit(false);
                }
              }} disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setDeletingUserId(null); setIsDeleteConfirmOpen(false); }}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">Are you sure you want to delete this user? This action cannot be undone.</p>
          </div>
          {selectedUser && <p className="text-sm font-medium">User: {selectedUser.name}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" disabled={!!deletingUserId} onClick={() => { setDeletingUserId(null); setIsDeleteConfirmOpen(false); }}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={!!deletingUserId} onClick={async () => {
              if (!selectedUser) return;
              setDeletingUserId(selectedUser.id);
              try {
                const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
                if (res.ok) {
                  setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
                }
              } catch {
                // silent
              } finally {
                setDeletingUserId(null);
                setIsDeleteConfirmOpen(false);
              }
            }}>{deletingUserId ? "Deleting..." : "Delete"}</Button>
          </div>
        </div>
      </Modal>

      {/* Login as User Modal */}
      <Modal
        isOpen={isLoginAsOpen}
        onClose={() => setIsLoginAsOpen(false)}
        title="Login as User"
      >
        {loginAsUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Impersonation Active</h3>
                <p className="text-xs text-muted-foreground">You are now logged in as</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{loginAsUser.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{loginAsUser.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Role</span>
                <Badge className={roleColors[loginAsUser.role]}>{loginAsUser.role.replace("_", " ")}</Badge>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsLoginAsOpen(false)}>
                Back to Admin
              </Button>
              <Button className="flex-1 gap-2" onClick={async () => {
                if (!loginAsUser) return;
                try {
                  const res = await fetch("/api/admin/auth/login-as", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: loginAsUser.id }),
                  });
                  if (res.ok) {
                    window.location.href = "/dashboard";
                  } else {
                    const err = await res.json();
                    alert(err.error || "Failed to login as user");
                  }
                } catch {
                  alert("Failed to login as user");
                }
                setIsLoginAsOpen(false);
              }}>
                <LogIn className="h-4 w-4" />
                Login as User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}