import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();
  const departmentId = req.nextUrl.searchParams.get("departmentId");

  const employees = await prisma.employee.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(departmentId && departmentId !== "ALL" ? { departmentId } : {}),
      ...(search
        ? { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }, { email: { contains: search } }] }
        : {}),
    },
    include: { department: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(employees);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.firstName || !body.lastName || !body.email) {
    return badRequest("First name, last name, and email are required");
  }

  const count = await prisma.employee.count();
  const employee = await prisma.employee.create({
    data: {
      workspaceId: ctx.workspace.id,
      employeeId: `EMP${String(count + 1).padStart(4, "0")}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      position: body.position || null,
      salary: body.salary != null ? Number(body.salary) : null,
      departmentId: body.departmentId || null,
      userId: body.userId || null,
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      biometricEmployeeId: body.biometricEmployeeId || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zipCode: body.zipCode || null,
      country: body.country || null,
      bankName: body.bankName || null,
      bankAccountNumber: body.bankAccountNumber || null,
      bankRoutingNumber: body.bankRoutingNumber || null,
      hourlyRate: body.hourlyRate != null ? Number(body.hourlyRate) : null,
      overtimeRate: body.overtimeRate != null ? Number(body.overtimeRate) : null,
      isActive: body.isActive !== false,
    },
  });

  return Response.json(employee, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
