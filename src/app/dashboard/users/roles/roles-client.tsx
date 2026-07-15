"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, ChevronDown, ChevronRight, CheckCircle2, Eye, X } from "lucide-react";

type RoleUser = { id: string; name: string; email: string; image?: string | null };

type RoleData = {
  id: string;       // ADMIN, MANAGER, STAFF, CUSTOMER
  name: string;     // "Admin", "Manager" etc.
  description: string;
  permissions: string[];
  users: RoleUser[];
};

interface Props {
  roles: RoleData[];
  workspaceId: string;
}

const roleColors: Record<string, string> = {
  ADMIN:    "bg-purple-500/10 text-purple-700 border-purple-500/20",
  MANAGER:  "bg-blue-500/10 text-blue-700 border-blue-500/20",
  STAFF:    "bg-green-500/10 text-green-700 border-green-500/20",
  CUSTOMER: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const roleIcons: Record<string, string> = {
  ADMIN: "🔴", MANAGER: "🔵", STAFF: "🟢", CUSTOMER: "🟠",
};

export function RolesClient({ roles }: Props) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [viewUsersRole, setViewUsersRole] = useState<RoleData | null>(null);

  return (
    <DashboardLayout title="Roles & Permissions">
      <div className="space-y-6 max-w-5xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access levels defined for your workspace members
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => {
            const isExpanded = expandedRole === role.id;
            return (
              <Card key={role.id} className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-0">

                  {/* Role Header Row */}
                  <div className="flex items-center gap-4 p-4">

                    {/* Icon */}
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                      {roleIcons[role.id] || "🔷"}
                    </div>

                    {/* Name + Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{role.name}</h3>
                        <Badge className={`text-xs ${roleColors[role.id] || "bg-gray-100 text-gray-700"}`}>
                          {role.id}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {role.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Permission count */}
                      <div className="text-center hidden sm:block">
                        <p className="text-lg font-bold text-primary">{role.permissions.length}</p>
                        <p className="text-[10px] text-muted-foreground">Permissions</p>
                      </div>

                      {/* User count */}
                      <button
                        onClick={() => setViewUsersRole(role)}
                        className="text-center hover:opacity-80 transition-opacity"
                      >
                        <p className="text-lg font-bold">{role.users.length}</p>
                        <p className="text-[10px] text-muted-foreground">Users</p>
                      </button>

                      {/* Expand permissions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                        className="gap-1 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Permissions</span>
                        {isExpanded
                          ? <ChevronDown className="h-3.5 w-3.5" />
                          : <ChevronRight className="h-3.5 w-3.5" />
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Permissions */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        All Permissions ({role.permissions.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {role.permissions.map((perm) => (
                          <div key={perm} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex gap-3">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">How roles work</p>
              <p className="text-xs text-muted-foreground mt-1">
                When you add a user to your workspace, you assign them a role.
                Each role has a predefined set of permissions.
                <strong> Admin</strong> has full access,
                <strong> Manager</strong> can manage teams,
                <strong> Staff</strong> has view-only access to most modules.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Users Modal */}
      {viewUsersRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">
                  {viewUsersRole.name} Users ({viewUsersRole.users.length})
                </h3>
              </div>
              <button onClick={() => setViewUsersRole(null)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {viewUsersRole.users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No users with this role yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {viewUsersRole.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge className={`text-xs ml-auto flex-shrink-0 ${roleColors[viewUsersRole.id]}`}>
                        {viewUsersRole.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t px-5 py-3">
              <Button variant="outline" className="w-full" onClick={() => setViewUsersRole(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
