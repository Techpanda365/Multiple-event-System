import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.assetBorrowRent.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { createdAt: "desc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const staffUserName = body.staffUserName?.trim();
  const assetName = body.assetName?.trim();
  const startDate = body.startDate;
  const endDate = body.endDate;

  if (!staffUserName) return badRequest("Staff user is required");
  if (!assetName) return badRequest("Asset is required");
  if (!startDate) return badRequest("Start date is required");
  if (!endDate) return badRequest("End date is required");

  const item = await prisma.assetBorrowRent.create({
    data: {
      workspaceId: ctx.workspace.id,
      staffUserId: body.staffUserId || null,
      staffUserName,
      staffUserEmail: body.staffUserEmail?.trim() || null,
      assetId: body.assetId || null,
      assetName,
      assetCode: body.assetCode?.trim() || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      actualReturnDate: body.actualReturnDate ? new Date(body.actualReturnDate) : null,
      quantity: parseInt(body.quantity, 10) || 1,
      purpose: body.purpose?.trim() || null,
      status: body.status || "Draft",
    },
  });
  return Response.json(item, { status: 201 });
}
