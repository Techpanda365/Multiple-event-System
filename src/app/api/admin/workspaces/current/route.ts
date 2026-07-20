import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized } from "@/lib/api-auth";
import { getAdminWorkspaceCookie } from "@/lib/admin-workspace";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const workspaceId = await getAdminWorkspaceCookie();
  if (!workspaceId) return NextResponse.json({ workspace: null });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ workspace });
}
