import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

// PATCH /api/sales/invoices/[id]/signature
// Body: { signature: "data:image/png;base64,..." }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const body = await req.json();

  if (!body.signature) return badRequest("Signature data is required");
  if (!body.signature.startsWith("data:image/")) return badRequest("Invalid signature format");

  const result = await prisma.salesInvoice.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: { signature: body.signature },
  });

  if (result.count === 0) return notFound("Invoice not found");

  return Response.json({ success: true, message: "Signature saved" });
}

// DELETE — remove signature
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const result = await prisma.salesInvoice.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: { signature: null },
  });

  if (result.count === 0) return notFound("Invoice not found");
  return Response.json({ success: true, message: "Signature removed" });
}
