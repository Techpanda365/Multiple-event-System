import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const payments = await prisma.setting.findMany({
    where: { group: `retainer-payments:${ctx.workspace.id}` },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    payments.map((p) => {
      try { return { id: p.id, ...JSON.parse(p.value) }; } catch { return null; }
    }).filter(Boolean)
  );
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.retainer || !body.amount) return badRequest("Retainer and amount are required");

  const count = await prisma.setting.count({ where: { group: `retainer-payments:${ctx.workspace.id}` } });
  const paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const payment = await prisma.setting.create({
    data: {
      key: `payment:${ctx.workspace.id}:${Date.now()}`,
      value: JSON.stringify({
        number: paymentNumber,
        retainer: body.retainer,
        customer: body.customer || "",
        amount: Number(body.amount),
        date: body.date || new Date().toISOString().slice(0, 10),
        method: body.method || "Bank Transfer",
        status: body.status || "Completed",
        notes: body.notes || "",
        createdAt: new Date().toISOString(),
      }),
      group: `retainer-payments:${ctx.workspace.id}`,
    },
  });

  return Response.json({ id: payment.id, ...JSON.parse(payment.value) }, { status: 201 });
}
