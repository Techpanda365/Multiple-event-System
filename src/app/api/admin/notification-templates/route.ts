import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

const DEFAULT_CHANNELS = ["Email", "SMS", "Push Notification", "Slack", "WhatsApp", "Telegram", "Webhook", "In-App"];
const DEFAULT_TEMPLATES = [
  { subject: "Welcome Notification", module: "User" },
  { subject: "Login Alert", module: "Security" },
  { subject: "Password Changed", module: "Security" },
  { subject: "New Workspace Member", module: "Workspace" },
  { subject: "Subscription Expiring", module: "Subscription" },
  { subject: "Payment Received", module: "Billing" },
  { subject: "Invoice Overdue", module: "Invoice" },
  { subject: "Task Reminder", module: "Project" },
  { subject: "New Lead Assigned", module: "CRM" },
  { subject: "System Update", module: "System" },
];

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const channelsSetting = await prisma.setting.findUnique({ where: { key: "notif_channels" } });
  const templatesSetting = await prisma.setting.findUnique({ where: { key: "notif_templates" } });

  return success({
    channels: channelsSetting ? JSON.parse(channelsSetting.value) : DEFAULT_CHANNELS,
    templates: templatesSetting ? JSON.parse(templatesSetting.value) : DEFAULT_TEMPLATES,
  });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (body.channels) {
    await prisma.setting.upsert({
      where: { key: "notif_channels" },
      update: { value: JSON.stringify(body.channels) },
      create: { key: "notif_channels", value: JSON.stringify(body.channels), group: "notification" },
    });
  }
  if (body.templates) {
    await prisma.setting.upsert({
      where: { key: "notif_templates" },
      update: { value: JSON.stringify(body.templates) },
      create: { key: "notif_templates", value: JSON.stringify(body.templates), group: "notification" },
    });
  }

  return success({ message: "Notification settings saved" });
}
