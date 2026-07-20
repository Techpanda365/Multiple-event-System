import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const stage = req.nextUrl.searchParams.get("stage");
  const accountId = req.nextUrl.searchParams.get("accountId");

  const opportunities = await prisma.opportunity.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(stage ? { stage } : {}),
      ...(accountId ? { accountId } : {}),
    },
    include: { account: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(opportunities);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Opportunity name is required");

  const opportunity = await prisma.opportunity.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      accountId: body.accountId || null,
      contactId: body.contactId || null,
      value: body.value != null ? Number(body.value) : null,
      stage: body.stage || "Prospecting",
      probability: body.probability != null ? Number(body.probability) : 0,
      closeDate: body.closeDate ? new Date(body.closeDate) : null,
      assignedTo: body.assignedTo || null,
      source: body.source || null,
      nextFollowupDate: body.nextFollowupDate ? new Date(body.nextFollowupDate) : null,
      nextStep: body.nextStep || null,
      lostReason: body.lostReason || null,
      description: body.description || null,
      notes: body.notes || null,
      status: body.status || "Active",
    },
  });
  return Response.json(opportunity, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
