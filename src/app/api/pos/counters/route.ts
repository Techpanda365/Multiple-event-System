import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const records = await prisma.setting.findMany({
    where: { group: `pos_counters:${ctx.workspace.id}` },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(
    records.map((r) => {
      try { return { id: r.id, ...JSON.parse(r.value) }; } catch { return null; }
    }).filter(Boolean)
  );
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.name?.trim()) return badRequest("Counter name is required");
  if (!body.code?.trim()) return badRequest("Counter code is required");

  // Check duplicate code
  const existing = await prisma.setting.findMany({
    where: { group: `pos_counters:${ctx.workspace.id}` },
  });
  const isDuplicate = existing.some((r) => {
    try { return JSON.parse(r.value).code?.toLowerCase() === body.code.trim().toLowerCase(); }
    catch { return false; }
  });
  if (isDuplicate) return badRequest("Counter code already exists");

  const record = await prisma.setting.create({
    data: {
      key:   `pos_counter:${ctx.workspace.id}:${Date.now()}`,
      value: JSON.stringify({
        name:        body.name.trim(),
        code:        body.code.trim().toUpperCase(),
        bankAccount: body.bankAccount?.trim() || null,
        description: body.description?.trim() || null,
        isActive:    body.isActive !== false,
        createdAt:   new Date().toISOString(),
      }),
      group: `pos_counters:${ctx.workspace.id}`,
    },
  });

  return Response.json({ id: record.id, ...JSON.parse(record.value) }, { status: 201 });
}
