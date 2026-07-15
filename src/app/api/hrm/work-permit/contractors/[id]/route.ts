import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const c = await prisma.contractor.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!c) return notFound();
  return Response.json(c);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const result = await prisma.contractor.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: { name: body.name, company: body.company, email: body.email, phone: body.phone, address: body.address, isActive: body.isActive },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.contractor.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
