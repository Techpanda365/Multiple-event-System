import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const record = await prisma.setting.findFirst({
    where: { id, group: `inventory_adjustments:${ctx.workspace.id}` },
  });
  if (!record) return notFound();
  try {
    return Response.json({ id: record.id, ...JSON.parse(record.value) });
  } catch { return notFound(); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const result = await prisma.setting.deleteMany({
    where: { id, group: `inventory_adjustments:${ctx.workspace.id}` },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}
