import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

async function getData(workspaceId: string) {
  const accounts = await prisma.chartOfAccount.findMany({
    where: { workspaceId, type: { in: ["Income", "Revenue", "Expense"] } },
    select: { code: true, name: true, type: true, currentBalance: true },
    orderBy: { code: "asc" },
  });

  const revenue = accounts
    .filter(a => (a.type === "Income" || a.type === "Revenue") && a.currentBalance !== 0)
    .map(a => ({ code: a.code, name: a.name, amount: a.currentBalance }));

  const expenses = accounts
    .filter(a => a.type === "Expense" && a.currentBalance !== 0)
    .map(a => ({ code: a.code, name: a.name, amount: a.currentBalance }));

  return { revenue, expenses };
}

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  return Response.json(await getData(ctx.workspace.id));
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  return Response.json(await getData(ctx.workspace.id));
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
