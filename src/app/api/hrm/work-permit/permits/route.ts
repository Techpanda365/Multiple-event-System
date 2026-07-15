import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const contractorId = req.nextUrl.searchParams.get("contractorId");

  const permits = await prisma.workPermit.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status ? { status: status as any } : {}),
      ...(contractorId ? { contractorId } : {}),
    },
    include: { contractor: { select: { id: true, name: true, company: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(permits);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.contractorId || !body.type || !body.startDate || !body.endDate) {
    return badRequest("contractorId, type, startDate and endDate are required");
  }

  const count = await prisma.workPermit.count({ where: { workspaceId: ctx.workspace.id } });
  const permitNumber = `WP-${String(count + 1).padStart(5, "0")}`;

  const permit = await prisma.workPermit.create({
    data: {
      workspaceId: ctx.workspace.id,
      permitNumber,
      contractorId: body.contractorId,
      type: body.type,
      location: body.location || null,
      description: body.description || null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: "PENDING",
    },
  });
  return Response.json(permit, { status: 201 });
}
