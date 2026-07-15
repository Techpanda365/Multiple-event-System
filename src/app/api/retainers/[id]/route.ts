import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const r = await prisma.setting.findFirst({ where: { id, group: `retainers:${ctx.workspace.id}` } });
  if (!r) return notFound();
  try { return Response.json({ id: r.id, ...JSON.parse(r.value) }); } catch { return notFound(); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const r = await prisma.setting.findFirst({ where: { id, group: `retainers:${ctx.workspace.id}` } });
  if (!r) return notFound();
  const existing = JSON.parse(r.value || "{}");
  await prisma.setting.update({ where: { id }, data: { value: JSON.stringify({ ...existing, ...body }) } });
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const result = await prisma.setting.deleteMany({ where: { id, group: `retainers:${ctx.workspace.id}` } });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}
