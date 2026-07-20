import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const type = req.nextUrl.searchParams.get("type");

  const accounts = await prisma.chartOfAccount.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      isActive: true,
      ...(type ? { type } : {}),
    },
    include: {
      parent: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ type: "asc" }, { code: "asc" }],
  });
  return Response.json(accounts);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.code || !body.name || !body.type) {
    return badRequest("code, name and type are required");
  }

  const account = await prisma.chartOfAccount.create({
    data: {
      workspaceId: ctx.workspace.id,
      code: body.code,
      name: body.name,
      type: body.type,
      subtype: body.subtype || null,
      description: body.description || null,
      isActive: body.isActive !== false,
      normalBalance: body.normalBalance || "Debit",
      openingBalance: body.openingBalance !== undefined ? parseFloat(body.openingBalance) : 0,
      currentBalance: body.currentBalance !== undefined ? parseFloat(body.currentBalance) : 0,
      parentId: body.parentId || null,
    },
  });
  return Response.json(account, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
