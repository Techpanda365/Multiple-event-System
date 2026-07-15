import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const contact = await prisma.crmContact.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { account: true },
  });
  if (!contact) return notFound();
  return Response.json(contact);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.crmContact.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      title: body.title,
      department: body.department,
      accountId: body.accountId,
      assignedTo: body.assignedTo,
      source: body.source,
      preferredContactMethod: body.preferredContactMethod,
      tags: body.tags,
      socialMediaUrl: body.socialMediaUrl,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postalCode: body.postalCode,
      description: body.description,
      notes: body.notes,
      status: body.status,
    },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.crmContact.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
