import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { HrmClient } from "./hrm-client";

export default async function HRMPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [employees, departments] = await Promise.all([
    prisma.employee.findMany({
      include: { department: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <HrmClient
      employees={employees.map((emp) => ({
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department?.name ?? null,
        position: emp.position,
        isActive: emp.isActive,
      }))}
      departments={departments.map((d) => d.name)}
    />
  );
}
