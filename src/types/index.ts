import type { User, Workspace, WorkspaceMember } from "@prisma/client";

export type AuthUser = Pick<User, "id" | "email" | "name" | "image" | "role">;

export interface SessionWithWorkspace {
  user: AuthUser;
  currentWorkspace: Workspace | null;
  workspaces: (WorkspaceMember & { workspace: Workspace })[];
}

export interface DashboardStats {
  totalRevenue: number;
  activeProjects: number;
  openLeads: number;
  totalEmployees: number;
  pendingInvoices: number;
  monthlyGrowth: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  module: string;
  children?: NavItem[];
}

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  isPremium: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
