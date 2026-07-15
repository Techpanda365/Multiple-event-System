import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");

  const retainers = await prisma.setting.findMany({
    where: {
      group: `retainers:${ctx.workspace.id}`,
      ...(status ? { key: { contains: `:${status}:` } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    retainers.map((r) => {
      try { return { id: r.id, ...JSON.parse(r.value) }; } catch { return null; }
    }).filter(Boolean)
  );
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.clientName || !body.amount) return badRequest("Client name and amount are required");

  const count = await prisma.setting.count({ where: { group: `retainers:${ctx.workspace.id}` } });
  const retainerNumber = `RET-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const retainer = await prisma.setting.create({
    data: {
      key: `retainer:DRAFT:${ctx.workspace.id}:${Date.now()}`,
      value: JSON.stringify({
        retainerNumber,
        clientName: body.clientName,
        clientEmail: body.clientEmail || "",
        amount: Number(body.amount),
        cycleType: body.cycleType || "Monthly",
        startDate: body.startDate || new Date().toISOString().slice(0, 10),
        nextBillingDate: body.nextBillingDate || "",
        description: body.description || "",
        status: "Draft",
        createdAt: new Date().toISOString(),
      }),
      group: `retainers:${ctx.workspace.id}`,
    },
  });

  return Response.json({ id: retainer.id, ...JSON.parse(retainer.value) }, { status: 201 });
}
