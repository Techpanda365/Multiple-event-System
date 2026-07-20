import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const docs = await prisma.document.findMany({
    where: { employeeId: id, workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(docs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const employee = await prisma.employee.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!employee) return notFound("Employee not found");

  const body = await req.json();
  if (!body.name) return Response.json({ error: "Document name is required" }, { status: 400 });

  const doc = await prisma.document.create({
    data: {
      workspaceId: ctx.workspace.id,
      employeeId: id,
      name: body.name,
      description: body.description || null,
      fileUrl: body.fileUrl || null,
      fileType: body.fileType || null,
      fileSize: body.fileSize ? Number(body.fileSize) : null,
      folder: "employee-documents",
      tags: body.tags || [],
    },
  });
  return Response.json(doc, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const body = await req.json();
  const doc = await prisma.document.findFirst({
    where: { id: body.documentId, employeeId: id, workspaceId: ctx.workspace.id },
  });
  if (!doc) return notFound("Document not found");

  await prisma.document.delete({ where: { id: body.documentId } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
