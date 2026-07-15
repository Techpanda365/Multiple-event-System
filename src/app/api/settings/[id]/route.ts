import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const setting = await prisma.setting.findFirst({ where: { id } });
  if (!setting) return notFound();
  return Response.json(setting);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.setting.updateMany({
    where: { id },
    data: { value: body.value, group: body.group },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}
