import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status && status !== "ALL" ? { status: status as any } : {}),
      ...(search ? { customerName: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(invoices);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer name is required");

  const items = body.items || [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0), 0);
  const tax = Number(body.tax) || 0;
  const total = subtotal + tax;

  const count = await prisma.invoice.count();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const number = `INV-${dateStr}-${String(count + 1).padStart(3, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId: ctx.workspace.id,
      number,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      items,
      subtotal,
      tax,
      total,
      status: body.status || "DRAFT",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes || null,
    },
  });

  return Response.json(invoice, { status: 201 });
}
