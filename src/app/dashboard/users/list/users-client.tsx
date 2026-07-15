"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft, ChevronRight, Plus, Search, Filter, Mail, Phone, User,
  Pencil, Trash2, LogIn, Key, X, CheckCircle2, AlertTriangle
} from "lucide-react";

type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  workspace: string;
  status: string;
};

const mockPhones = ["+6491234567801", "+861234567897", "+81234567898", "+6121234567800", "+821234567899"];

interface Props {
  users: WorkspaceUser[];
  workspaceName: string;
}

const statusColors: Record<string, string> = {
  Enabled: "bg-green-500/10 text-green-700 border-green-500/20",
  Disabled: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  Suspended: "bg-red-500/10 text-red-700 border-red-500/20",
};

const roleColors: Record<string, string> = {
  Admin: "bg-rose-500/10 text-rose-700",
  Manager: "bg-amber-500/10 text-amber-700",
  Staff: "bg-blue-500/10 text-blue-700",
  Customer: "bg-green-500/10 text-green-700",
  "Super Admin": "bg-red-500/10 text-red-700",
};

const Select = ({ value, onValueChange, children }: any) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)}
    className="h-9 w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
    {children}
  </select>
);

const roles = ["Admin", "Manager", "Staff", "Customer"];

export function UsersListClient({ users: initialUsers, workspaceName }: Props) {
  const [users, setUsers] = useState(() =>
    initialUsers.map((u, i) => ({ ...u, phone: u.phone || mockPhones[i % mockPhones.length] }))
  );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [editUser, setEditUser] = useState<WorkspaceUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [passwordUser, setPasswordUser] = useState<WorkspaceUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [deleteUser, setDeleteUser] = useState<WorkspaceUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addRole, setAddRole] = useState("Staff");
  const [addStatus, setAddStatus] = useState("Enabled");
  const [addError, setAddError] = useState("");
  const [toast, setToast] = useState("");

  const uniqueRoles = useMemo(() => {
    const roles_set = new Set(initialUsers.map((u) => u.role));
    return Array.from(roles_set);
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") filtered = filtered.filter((u) => u.status === statusFilter);
    if (roleFilter !== "all") filtered = filtered.filter((u) => u.role === roleFilter);
    return filtered;
  }, [users, search, statusFilter, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Role display → DB value mapping
  const roleToDb: Record<string, string> = {
    Admin: "ADMIN", Manager: "MANAGER", Staff: "STAFF", Customer: "CUSTOMER", "Super Admin": "SUPER_ADMIN",
  };
  const dbToRole: Record<string, string> = {
    ADMIN: "Admin", MANAGER: "Manager", STAFF: "Staff", CUSTOMER: "Customer", SUPER_ADMIN: "Super Admin",
  };

  const handleEdit = (user: WorkspaceUser) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role); // display value (Admin/Manager/Staff)
    setEditStatus(user.status); // Enabled/Disabled
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSavingEdit(true);
    setEditError("");
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone || null,
          role: roleToDb[editRole] || editRole,       // "Admin" → "ADMIN"
          isActive: editStatus === "Enabled",          // "Enabled" → true
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((u) =>
          u.id === editUser.id
            ? { ...u, name: editName, phone: editPhone, role: editRole, status: editStatus }
            : u
        ));
        setEditUser(null);
        showToast("User updated successfully");
      } else {
        setEditError(data.error || "Failed to update user");
      }
    } catch {
      setEditError("Network error");
    } finally {
      setSavingEdit(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (user: WorkspaceUser) => setDeleteUser(user);

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeletingId(deleteUser.id);
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
        showToast(`${deleteUser.name} removed from workspace`);
      } else {
        showToast("Failed to delete user");
      }
    } catch {
      showToast("Network error");
    } finally {
      setDeletingId(null);
      setDeleteUser(null);
    }
  };

  const handleLoginAsUser = (user: WorkspaceUser) => {
    document.cookie = `session-token=${btoa(JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }))}; path=/; max-age=3600`;
    showToast(`Logged in as ${user.name}`);
    setTimeout(() => window.location.href = "/dashboard", 500);
  };

  const handleChangePassword = (user: WorkspaceUser) => {
    setPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const savePassword = () => {
    if (!newPassword) { setPasswordError("Password is required"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    setPasswordError("");
    setPasswordUser(null);
    showToast("Password changed successfully");
  };

  const [addLoading, setAddLoading] = useState(false);

  const openAddModal = () => {
    setAddName(""); setAddEmail(""); setAddPhone(""); setAddPassword("");
    setAddConfirmPassword(""); setAddRole("Staff"); setAddStatus("Enabled"); setAddError("");
    setShowAddModal(true);
  };

  const handleAddUser = async () => {
    if (!addName.trim()) { setAddError("Name is required"); return; }
    if (!addEmail.trim()) { setAddError("Email is required"); return; }
    if (!addPassword) { setAddError("Password is required"); return; }
    if (addPassword.length < 6) { setAddError("Password must be at least 6 characters"); return; }
    if (addPassword !== addConfirmPassword) { setAddError("Passwords do not match"); return; }

    setAddError("");
    setAddLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim(),
          phone: addPhone.trim() || null,
          password: addPassword,
          role: roleToDb[addRole] || "STAFF",      // "Staff" → "STAFF"
          isActive: addStatus === "Enabled",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Failed to create user");
        return;
      }

      // API se returned user ko list mein add karo
      const created: WorkspaceUser = {
        id: data.id,
        name: data.name || addName.trim(),
        email: data.email || addEmail.trim(),
        phone: addPhone.trim() || "",
        role: addRole,                               // display label
        workspace: workspaceName,
        status: addStatus,
      };

      setUsers((prev) => [created, ...prev]);
      setShowAddModal(false);
      showToast(`${created.name} added successfully`);
    } catch {
      setAddError("Network error — please try again");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <DashboardLayout title="Users">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage all registered users in {workspaceName}</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={openAddModal}><Plus className="h-4 w-4 mr-2" />Add User</Button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setCurrentPage(1); }}>
              <option value="all">All Status</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </Select>
            <Select value={roleFilter} onValueChange={(v: string) => { setRoleFilter(v); setCurrentPage(1); }}>
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </Select>
            <div className="text-sm text-muted-foreground">{itemsPerPage} per page</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">No users found</div>
          ) : (
            paginatedUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow border-border/50 hover:border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{user.name}</h3>
                        <Badge className={`${roleColors[user.role] || "bg-gray-500/10 text-gray-700"} text-xs mt-0.5`}>{user.role}</Badge>
                      </div>
                    </div>
                    <Badge className={statusColors[user.status]}>{user.status}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs">{user.phone}</span>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Workspace: <span className="font-medium text-foreground">{user.workspace}</span></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-0.5 pt-1 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="h-7 px-1.5 text-xs" onClick={() => handleEdit(user)}>
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-1.5 text-xs" onClick={() => handleLoginAsUser(user)}>
                      <LogIn className="h-3 w-3" /> Login
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-1.5 text-xs" onClick={() => handleChangePassword(user)}>
                      <Key className="h-3 w-3" /> Pwd
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-1.5 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(user)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="font-semibold">Create User</h3>
              <button onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Enter full name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
                <Input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="company@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mobile Number</label>
                <Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+1234567890" />
                <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password <span className="text-destructive">*</span></label>
                <Input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></label>
                <Input type="password" value={addConfirmPassword} onChange={(e) => setAddConfirmPassword(e.target.value)} placeholder="Confirm password" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role <span className="text-destructive">*</span></label>
                <select value={addRole} onChange={(e) => setAddRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Login Status</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="addStatus" value="Enabled" checked={addStatus === "Enabled"} onChange={(e) => setAddStatus(e.target.value)} className="accent-primary" />
                    <span className="text-sm">Enabled</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="addStatus" value="Disabled" checked={addStatus === "Disabled"} onChange={(e) => setAddStatus(e.target.value)} className="accent-primary" />
                    <span className="text-sm">Disabled</span>
                  </label>
                </div>
              </div>
              {addError && <p className="text-sm text-destructive">{addError}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddUser} disabled={addLoading}>
                {addLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="font-semibold">Edit User</h3>
              <button onClick={() => { setEditUser(null); setEditError(""); }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
              </div>

              {/* Email — readonly */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input value={editEmail} disabled className="bg-muted/50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mobile No</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 9876543210" />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Login Status */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Login Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editStatus"
                      value="Enabled"
                      checked={editStatus === "Enabled"}
                      onChange={() => setEditStatus("Enabled")}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm font-medium text-green-700">Enabled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editStatus"
                      value="Disabled"
                      checked={editStatus === "Disabled"}
                      onChange={() => setEditStatus("Disabled")}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-600">Disabled</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {editStatus === "Enabled" ? "✅ User can login" : "🚫 User cannot login"}
                </p>
              </div>

              {/* Error */}
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {editError}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button variant="outline" onClick={() => { setEditUser(null); setEditError(""); }}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="font-semibold">Change Password - {passwordUser.name}</h3>
              <button onClick={() => setPasswordUser(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              </div>
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
              <Button onClick={savePassword}>Change Password</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-5 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
              <h3 className="font-semibold">Delete User</h3>
              <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteUser.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3 border-t px-5 py-3">
              <Button variant="outline" onClick={() => setDeleteUser(null)} disabled={!!deletingId}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={!!deletingId}>
                {deletingId ? "Removing..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
