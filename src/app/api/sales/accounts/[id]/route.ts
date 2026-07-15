import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const account = await prisma.salesAccount.findFirst({
    where: { id: params.id, workspaceId: ctx.workspace.id },
  });
  if (!account) return notFound();
  return Response.json(account);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const account = await prisma.salesAccount.findFirst({
    where: { id: params.id, workspaceId: ctx.workspace.id },
  });
  if (!account) return notFound();

  const updated = await prisma.salesAccount.update({
    where: { id: params.id },
    data: {
      name: body.name,
      email: body.email ?? undefined,
      phone: body.phone ?? undefined,
      website: body.website ?? undefined,
      accountType: body.accountType ?? undefined,
      industry: body.industry ?? undefined,
      assignedTo: body.assignedTo ?? undefined,
      document: body.document ?? undefined,
      address: body.address ?? undefined,
      city: body.city ?? undefined,
      billingState: body.billingState ?? undefined,
      country: body.country ?? undefined,
      billingPostalCode: body.billingPostalCode ?? undefined,
      shippingSameAsBilling: body.shippingSameAsBilling ?? undefined,
      shippingAddress: body.shippingAddress ?? undefined,
      shippingCity: body.shippingCity ?? undefined,
      shippingState: body.shippingState ?? undefined,
      shippingCountry: body.shippingCountry ?? undefined,
      shippingPostalCode: body.shippingPostalCode ?? undefined,
      description: body.description ?? undefined,
      notes: body.notes ?? undefined,
      status: body.status ?? undefined,
    },
  });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const account = await prisma.salesAccount.findFirst({
    where: { id: params.id, workspaceId: ctx.workspace.id },
  });
  if (!account) return notFound();

  await prisma.salesAccount.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
