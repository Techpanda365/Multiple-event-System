import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const name = body.name?.trim();
  const slug = body.slug?.trim();

  if (!name || !slug) return badRequest("Name and slug are required");

  const existingSlug = await prisma.workspace.findFirst({
    where: { slug },
  });
  if (existingSlug) return badRequest("Slug is already taken");

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: ctx.user.id },
  });
  if (!membership) return badRequest("No workspace found");

  const workspace = await prisma.workspace.update({
    where: { id: membership.workspaceId },
    data: {
      name,
      slug,
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
    },
  });

  return Response.json({ workspace });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
