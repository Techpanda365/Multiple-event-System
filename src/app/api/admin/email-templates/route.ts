import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

const DEFAULT_TEMPLATES = [
  { module: "User", subject: "Welcome to our platform", variables: ["{app_name}", "{user_name}", "{user_email}"] },
  { module: "Workspace", subject: "Workspace Created", variables: ["{workspace_name}", "{user_name}"] },
  { module: "Subscription", subject: "Subscription Confirmed", variables: ["{plan_name}", "{amount}", "{date}"] },
  { module: "Invoice", subject: "Invoice Generated", variables: ["{invoice_number}", "{amount}", "{due_date}"] },
  { module: "CRM Lead", subject: "New Lead Assigned", variables: ["{lead_name}", "{assigned_to}"] },
  { module: "Project", subject: "Task Assigned", variables: ["{task_name}", "{project_name}", "{assigned_by}"] },
];

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "email_templates" } });
  const templates = setting ? JSON.parse(setting.value) : DEFAULT_TEMPLATES;

  return success({ templates });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { templates } = body;

  await prisma.setting.upsert({
    where: { key: "email_templates" },
    update: { value: JSON.stringify(templates) },
    create: { key: "email_templates", value: JSON.stringify(templates), group: "email" },
  });

  return success({ templates, message: "Email templates saved" });
}
