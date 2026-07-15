import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

// GET /api/sales/invoices/[id]/pdf
// Returns all invoice data needed for PDF generation (client-side with jsPDF)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const invoice = await prisma.salesInvoice.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { customer: true },
  });

  if (!invoice) return notFound("Invoice not found");

  // Get workspace settings for company info
  const settings = await prisma.setting.findMany({
    where: { group: "general" },
    select: { key: true, value: true },
  });
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  // Build PDF-ready data structure
  const pdfData = {
    invoice: {
      id:            invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status:        invoice.status,
      invoiceDate:   invoice.invoiceDate.toISOString().slice(0, 10),
      dueDate:       invoice.dueDate?.toISOString().slice(0, 10) || null,
      paymentTerms:  invoice.paymentTerms,
      notes:         invoice.notes,
      items:         invoice.items,
      subtotal:      invoice.subtotal,
      discount:      invoice.discount,
      tax:           invoice.tax,
      total:         invoice.total,
      balance:       invoice.balance,
      signature:     invoice.signature,
      generatedAt:   invoice.generatedAt?.toISOString() || null,
    },
    customer: {
      name:    invoice.customerName,
      email:   invoice.customer?.email || null,
      phone:   invoice.customer?.phone || null,
      address: invoice.customer?.billingAddress || null,
      city:    invoice.customer?.billingCity || null,
      country: invoice.customer?.billingCountry || null,
      tax:     invoice.customer?.taxNumber || null,
    },
    company: {
      name:    settingsMap["company_name"]    || ctx.workspace.name,
      email:   settingsMap["company_email"]   || null,
      phone:   settingsMap["company_phone"]   || null,
      address: settingsMap["company_address"] || null,
      logo:    settingsMap["company_logo"]    || null,
    },
  };

  return Response.json(pdfData);
}
