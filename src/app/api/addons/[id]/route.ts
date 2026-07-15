import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const addon = await prisma.addon.findFirst({ where: { id, isActive: true } });
  if (!addon) return badRequest("Add-on not found");

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: ctx.user.id },
  });
  if (!membership) return badRequest("No workspace found");

  const subscription = await prisma.addonSubscription.upsert({
    where: {
      workspaceId_addonId: { workspaceId: membership.workspaceId, addonId: addon.id },
    },
    update: { isActive: true },
    create: {
      workspaceId: membership.workspaceId,
      addonId: addon.id,
      isActive: true,
    },
  });

  return Response.json(subscription);
}
