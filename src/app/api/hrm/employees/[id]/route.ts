import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const employee = await prisma.employee.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!employee) return notFound("Employee not found");
  return Response.json(employee);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.employee.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Employee not found");

  const data: Record<string, unknown> = {};
  if (body.firstName !== undefined) data.firstName = body.firstName;
  if (body.lastName !== undefined) data.lastName = body.lastName;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.position !== undefined) data.position = body.position;
  if (body.salary !== undefined) data.salary = Number(body.salary);
  if (body.departmentId !== undefined) data.departmentId = body.departmentId;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
  if (body.gender !== undefined) data.gender = body.gender;
  if (body.biometricEmployeeId !== undefined) data.biometricEmployeeId = body.biometricEmployeeId;
  if (body.address !== undefined) data.address = body.address;
  if (body.city !== undefined) data.city = body.city;
  if (body.state !== undefined) data.state = body.state;
  if (body.zipCode !== undefined) data.zipCode = body.zipCode;
  if (body.country !== undefined) data.country = body.country;
  if (body.bankName !== undefined) data.bankName = body.bankName;
  if (body.bankAccountNumber !== undefined) data.bankAccountNumber = body.bankAccountNumber;
  if (body.bankRoutingNumber !== undefined) data.bankRoutingNumber = body.bankRoutingNumber;
  if (body.hourlyRate !== undefined) data.hourlyRate = body.hourlyRate != null ? Number(body.hourlyRate) : null;
  if (body.overtimeRate !== undefined) data.overtimeRate = body.overtimeRate != null ? Number(body.overtimeRate) : null;

  const employee = await prisma.employee.update({ where: { id }, data });
  return Response.json(employee);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.employee.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Employee not found");
  await prisma.employee.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
