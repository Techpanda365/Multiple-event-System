import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const quotations = await prisma.quotation.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(search ? { customerName: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(quotations);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer name is required");

  const items = body.items || [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0), 0);
  const discount = Number(body.discount) || 0;
  const tax = Number(body.tax) || 0;
  const total = subtotal - discount + tax;

  const count = await prisma.quotation.count({ where: { workspaceId: ctx.workspace.id } });
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const number = `QT-${dateStr}-${String(count + 1).padStart(3, "0")}`;

  const quotation = await prisma.quotation.create({
    data: {
      workspaceId: ctx.workspace.id,
      number,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      warehouse: body.warehouse || null,
      paymentTerms: body.paymentTerms || null,
      notes: body.notes || null,
      items,
      subtotal,
      discount,
      tax,
      total,
      status: body.status || "Draft",
      proposalDate: body.proposalDate ? new Date(body.proposalDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });

  return Response.json(quotation, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
