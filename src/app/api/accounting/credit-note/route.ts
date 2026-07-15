import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const notes = await prisma.creditNote.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(notes);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.date) return badRequest("Date is required");
  if (!body.totalAmount || Number(body.totalAmount) <= 0) return badRequest("Valid total amount is required");

  const count = await prisma.creditNote.count({ where: { workspaceId: ctx.workspace.id } });
  const creditNoteNumber = `CN-${String(count + 1).padStart(4, "0")}`;

  const note = await prisma.creditNote.create({
    data: {
      workspaceId: ctx.workspace.id,
      creditNoteNumber,
      salesReturnId: body.salesReturnId || null,
      customerId: body.customerId || null,
      date: new Date(body.date),
      totalAmount: Number(body.totalAmount),
      balance: Number(body.balance ?? body.totalAmount),
      status: body.status || "Draft",
      approvedById: ctx.user.id,
      notes: body.notes?.trim() || null,
    },
    include: {
      salesReturn: { select: { id: true, returnNumber: true } },
      customer: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });

  return Response.json(note, { status: 201 });
}
