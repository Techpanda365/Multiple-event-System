import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;

  const r = await prisma.setting.findFirst({
    where: { id, group: `pos_counters:${ctx.workspace.id}` },
  });
  if (!r) return notFound();
  try { return Response.json({ id: r.id, ...JSON.parse(r.value) }); }
  catch { return notFound(); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const r = await prisma.setting.findFirst({
    where: { id, group: `pos_counters:${ctx.workspace.id}` },
  });
  if (!r) return notFound();

  const existing = JSON.parse(r.value || "{}");
  const updated = {
    ...existing,
    name:        body.name?.trim()        ?? existing.name,
    code:        body.code?.trim().toUpperCase() ?? existing.code,
    bankAccount: body.bankAccount !== undefined ? body.bankAccount?.trim() || null : existing.bankAccount,
    description: body.description !== undefined ? body.description?.trim() || null : existing.description,
    isActive:    body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    updatedAt:   new Date().toISOString(),
  };

  await prisma.setting.update({ where: { id }, data: { value: JSON.stringify(updated) } });
  return Response.json({ id, ...updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;

  const result = await prisma.setting.deleteMany({
    where: { id, group: `pos_counters:${ctx.workspace.id}` },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}
