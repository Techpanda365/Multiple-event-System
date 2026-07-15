import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  const account = await prisma.bankAccount.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!account) return notFound();
  return Response.json(account);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.bankAccount.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      ...(body.name          !== undefined && { name: body.name }),
      ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber }),
      ...(body.bankName      !== undefined && { bankName: body.bankName }),
      ...(body.branchName    !== undefined && { branchName: body.branchName }),
      ...(body.type          !== undefined && { type: body.type }),
      ...(body.glAccount     !== undefined && { glAccount: body.glAccount }),
      ...(body.paymentGateway !== undefined && { paymentGateway: body.paymentGateway }),
      ...(body.currency      !== undefined && { currency: body.currency }),
      ...(body.iban          !== undefined && { iban: body.iban }),
      ...(body.swiftCode     !== undefined && { swiftCode: body.swiftCode }),
      ...(body.routingNumber !== undefined && { routingNumber: body.routingNumber }),
      ...(body.isActive      !== undefined && { isActive: body.isActive }),
    },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  await prisma.bankAccount.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: { isActive: false },
  });
  return Response.json({ success: true });
}
