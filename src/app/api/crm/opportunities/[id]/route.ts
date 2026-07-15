import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const opp = await prisma.opportunity.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { account: true, salesOrders: true },
  });
  if (!opp) return notFound();
  return Response.json(opp);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.opportunity.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      name: body.name,
      accountId: body.accountId,
      contactId: body.contactId,
      value: body.value != null ? Number(body.value) : undefined,
      stage: body.stage,
      probability: body.probability != null ? Number(body.probability) : undefined,
      closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
      assignedTo: body.assignedTo,
      source: body.source,
      nextFollowupDate: body.nextFollowupDate ? new Date(body.nextFollowupDate) : undefined,
      nextStep: body.nextStep,
      lostReason: body.lostReason,
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
  await prisma.opportunity.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
