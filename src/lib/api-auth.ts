import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "./auth";
import { getUserWorkspace } from "./workspace";
import { getAdminWorkspaceCookie } from "./admin-workspace";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) return null;
  return { session, user: session.user };
}

// Workspace-required session — works for ADMIN, MANAGER, STAFF
// Super admin with active workspace cookie uses that instead
export async function requireWorkspaceSession() {
  const session = await auth();
  if (!session?.user) return null;

  const isSuperAdmin = session.user.role?.toUpperCase() === "SUPER_ADMIN";

  if (isSuperAdmin) {
    const adminWsId = await getAdminWorkspaceCookie();
    if (adminWsId) {
      const workspace = await prisma.workspace.findUnique({ where: { id: adminWsId } });
      if (workspace) return { session, workspace, user: session.user };
    }
    return null;
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) return null;

  return { session, workspace, user: session.user };
}

// Same as requireWorkspaceSession — alias for clarity
export async function requireAnySession() {
  return requireWorkspaceSession();
}

// Strict version — sirf tab kaam karta hai jab workspace ho
export async function requireWorkspaceSessionStrict() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return null;
  if (!ctx.workspace) return null;
  return ctx as typeof ctx & { workspace: NonNullable<typeof ctx.workspace> };
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) return null;
  const isSuperAdmin = session.user.role?.toUpperCase() === "SUPER_ADMIN";
  if (!isSuperAdmin) return null;
  return { session, user: session.user };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function success(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// Helper — returns 400 with helpful message if workspace missing
export function noWorkspace() {
  return NextResponse.json(
    { error: "No workspace found. Please logout and login again." },
    { status: 400 }
  );
}
