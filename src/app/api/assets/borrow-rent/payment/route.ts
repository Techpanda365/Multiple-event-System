import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortField = searchParams.get("sortField") || "paymentDate";
  const sortDirection = searchParams.get("sortDirection") || "desc";

  const where: Record<string, unknown> = { workspaceId: ctx.workspace.id };
  if (search) {
    where.OR = [
      { assetName: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { referenceNumber: { contains: search, mode: "insensitive" } },
      { status: { contains: search, mode: "insensitive" } },
    ];
  }

  const total = await prisma.assetBorrowRentPayment.count({ where });
  const payments = await prisma.assetBorrowRentPayment.findMany({
    where,
    orderBy: { [sortField]: sortDirection },
    skip: (page - 1) * limit,
    take: limit,
  });

  return Response.json({ payments, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const assetName = body.assetName?.trim();
  const customerName = body.customerName?.trim();
  const paymentAmount = parseFloat(body.paymentAmount);
  const paymentDate = body.paymentDate;

  if (!assetName) return badRequest("Asset name is required");
  if (!customerName) return badRequest("Customer name is required");
  if (!paymentAmount || paymentAmount <= 0) return badRequest("Valid payment amount is required");
  if (!paymentDate) return badRequest("Payment date is required");

  const item = await prisma.assetBorrowRentPayment.create({
    data: {
      workspaceId: ctx.workspace.id,
      borrowRentId: body.borrowRentId || null,
      assetName,
      customerName,
      paymentAmount,
      paymentDate: new Date(paymentDate),
      referenceNumber: body.referenceNumber?.trim() || null,
      status: body.status || "Draft",
      notes: body.notes?.trim() || null,
    },
  });
  return Response.json(item, { status: 201 });
}
