import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { RolesClient } from "./roles-client";

// Real permissions list for each role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "Manage Users", "Create Users", "Edit Users", "Delete Users",
    "Manage Roles", "Create Roles", "Edit Roles",
    "Manage Projects", "Create Projects", "Edit Projects", "Delete Projects",
    "Manage Invoices", "Create Invoices", "Edit Invoices", "Delete Invoices",
    "Manage CRM", "Manage HRM", "Manage Accounting",
    "Manage POS", "Manage Inventory", "Manage Products",
    "Manage Settings", "Edit Settings",
    "Manage Reports", "View Reports",
    "Manage Documents", "Manage Assets", "Manage Calendar",
    "Manage Workflows", "Manage Media",
  ],
  MANAGER: [
    "Manage Projects", "Create Projects", "Edit Projects",
    "View Invoices", "Create Invoices",
    "Manage CRM", "View HRM",
    "View Reports",
    "Manage Documents", "Manage Calendar",
    "View Users", "Edit Own Profile",
  ],
  STAFF: [
    "View Projects", "View Invoices",
    "View CRM", "View Calendar",
    "View Documents", "View Reports",
    "Edit Own Profile",
  ],
  CUSTOMER: [
    "View Own Invoices", "View Own Projects",
    "Submit Support Tickets", "Edit Own Profile",
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Full workspace access — can manage all modules and users",
  MANAGER: "Team management — can manage projects, CRM and view reports",
  STAFF: "Standard access — view only for most modules",
  CUSTOMER: "Client access — view own data and submit tickets",
};

export default async function RolesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) redirect("/dashboard");

  // Workspace ke actual members se role counts nikalo
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  // Role ke hisaab se group karo
  const roleGroups: Record<string, typeof members> = {};
  for (const m of members) {
    if (!roleGroups[m.role]) roleGroups[m.role] = [];
    roleGroups[m.role].push(m);
  }

  // Roles build karo — sirf woh jo workspace mein actually hain
  const roles = Object.entries(roleGroups).map(([role, roleMembers]) => ({
    id: role,
    name: ROLE_LABELS[role] || role,
    description: ROLE_DESCRIPTIONS[role] || "",
    permissions: ROLE_PERMISSIONS[role] || [],
    users: roleMembers.map((m) => ({
      id: m.user.id,
      name: m.user.name || m.user.email,
      email: m.user.email,
      image: m.user.image,
    })),
  }));

  // Agar koi role nahi hai workspace mein toh default roles dikhao
  const finalRoles = roles.length > 0 ? roles : (
    ["ADMIN", "MANAGER", "STAFF"].map((role) => ({
      id: role,
      name: ROLE_LABELS[role],
      description: ROLE_DESCRIPTIONS[role],
      permissions: ROLE_PERMISSIONS[role],
      users: [],
    }))
  );

  return <RolesClient roles={finalRoles} workspaceId={workspace.id} />;
}
