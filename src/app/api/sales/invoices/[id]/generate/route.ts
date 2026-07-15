import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

// POST /api/sales/invoices/[id]/generate
// Marks the invoice as "generated" and sets generatedAt timestamp.
// The actual PDF is rendered client-side using jsPDF (see /pdf endpoint).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const invoice = await prisma.salesInvoice.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { customer: true },
  });

  if (!invoice) return notFound("Invoice not found");

  // Mark as generated
  const updated = await prisma.salesInvoice.update({
    where: { id },
    data: {
      generatedAt: new Date(),
      // Auto-update status to Sent if it's still Draft
      status: invoice.status === "Draft" ? "Sent" : invoice.status,
    },
  });

  return Response.json({
    success: true,
    message: "Invoice generated successfully",
    invoice: {
      id: updated.id,
      invoiceNumber: updated.invoiceNumber,
      status: updated.status,
      generatedAt: updated.generatedAt,
    },
  });
}
