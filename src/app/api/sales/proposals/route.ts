import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const proposals = await prisma.salesProposal.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(search
        ? {
            OR: [
              { number: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(proposals);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer is required");

  const items = body.items || [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0), 0);
  const discount = Number(body.discount) || 0;
  const tax = Number(body.tax) || 0;
  const total = subtotal - discount + tax;

  const count = await prisma.salesProposal.count();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const number = `SP-${dateStr}-${String(count + 1).padStart(3, "0")}`;

  const proposal = await prisma.salesProposal.create({
    data: {
      workspaceId: ctx.workspace.id,
      number,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      warehouse: body.warehouse || null,
      paymentTerms: body.paymentTerms || null,
      notes: body.notes || null,
      specialInstructions: body.specialInstructions || null,
      items,
      subtotal,
      discount,
      tax,
      total,
      balance: total,
      status: body.status || "Draft",
      proposalDate: body.proposalDate ? new Date(body.proposalDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });

  return Response.json(proposal, { status: 201 });
}
