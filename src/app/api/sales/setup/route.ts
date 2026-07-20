import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { workspaceId: ctx.workspace.id };
  if (type) where.type = type;

  const items = await prisma.systemSetup.findMany({
    where: where as any,
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return Response.json(items);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.type || !body.name) return badRequest("type and name are required");

  const item = await prisma.systemSetup.create({
    data: {
      workspaceId: ctx.workspace.id,
      type: body.type,
      name: body.name,
      attributes: body.attributes || {},
      isActive: body.isActive !== false,
      order: body.order ?? 0,
    },
  });

  return Response.json(item, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
