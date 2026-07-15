import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const folder = req.nextUrl.searchParams.get("folder");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const documents = await prisma.document.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(folder && folder !== "ALL" ? { folder } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(documents);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Document name is required");

  const doc = await prisma.document.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      description: body.description || null,
      fileUrl: body.fileUrl || null,
      fileType: body.fileType || null,
      fileSize: body.fileSize ? Number(body.fileSize) : null,
      folder: body.folder || "general",
      tags: body.tags || [],
    },
  });

  return Response.json(doc, { status: 201 });
}
