import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const account = await prisma.crmAccount.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { contacts: true, opportunities: true },
  });
  if (!account) return notFound();
  return Response.json(account);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.crmAccount.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      website: body.website,
      accountType: body.accountType,
      industry: body.industry,
      assignedTo: body.assignedTo,
      document: body.document,
      address: body.address,
      city: body.city,
      billingState: body.billingState,
      country: body.country,
      billingPostalCode: body.billingPostalCode,
      shippingSameAsBilling: body.shippingSameAsBilling,
      shippingAddress: body.shippingAddress,
      shippingCity: body.shippingCity,
      shippingState: body.shippingState,
      shippingCountry: body.shippingCountry,
      shippingPostalCode: body.shippingPostalCode,
      description: body.description,
      notes: body.notes,
      status: body.status,
    },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.crmAccount.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
