import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, notFound, success } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const ticket = await prisma.helpdeskTicket.findUnique({ where: { id } });
  if (!ticket) return notFound("Ticket not found");

  return success({ ticket });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.helpdeskTicket.findUnique({ where: { id } });
  if (!existing) return notFound("Ticket not found");

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  if (body.newReply) {
    const replies = typeof existing.replies === "string" ? JSON.parse(existing.replies) : existing.replies;
    data.replies = [...(Array.isArray(replies) ? replies : []), {
      id: crypto.randomUUID(),
      text: body.newReply,
      author: body.replyAuthor || "Admin",
      createdAt: new Date().toISOString(),
    }];
  }

  const ticket = await prisma.helpdeskTicket.update({ where: { id }, data });

  return success({ ticket });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.helpdeskTicket.findUnique({ where: { id } });
  if (!existing) return notFound("Ticket not found");

  await prisma.helpdeskTicket.delete({ where: { id } });

  return success({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
