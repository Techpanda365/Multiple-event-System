import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const account = await prisma.chartOfAccount.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!account) return notFound();
  return Response.json(account);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.chartOfAccount.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      code: body.code,
      name: body.name,
      type: body.type,
      subtype: body.subtype,
      description: body.description,
      isActive: body.isActive,
      normalBalance: body.normalBalance,
      openingBalance: body.openingBalance !== undefined ? parseFloat(body.openingBalance) : undefined,
      currentBalance: body.currentBalance !== undefined ? parseFloat(body.currentBalance) : undefined,
      parentId: body.parentId,
    },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.chartOfAccount.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
