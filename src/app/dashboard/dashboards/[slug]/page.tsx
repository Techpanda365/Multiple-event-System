import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  ModuleDashboardClient,
  moduleIcons,
  type ModuleLink,
  type ModuleStat,
} from "../_components/module-dashboard-client";

const dashboardNames: Record<string, string> = {
  project: "Project Dashboard",
  account: "Account Dashboard",
  hrm: "HRM Dashboard",
  recruitment: "Recruitment Dashboard",
  pos: "POS Dashboard",
  crm: "CRM Dashboard",
  "sales-agent": "Sales Agent Dashboard",
  sales: "Sales Dashboard",
  events: "Events Management Dashboard",
};

const moduleLinks: Record<string, ModuleLink[]> = {
  project: [
    { title: "All Projects", href: "/dashboard/projects" },
    { title: "Project Payments", href: "/dashboard/projects/payments" },
    { title: "Project Report", href: "/dashboard/projects/report" },
    { title: "Templates", href: "/dashboard/projects/templates" },
  ],
  hrm: [
    { title: "Employees", href: "/dashboard/hrm" },
    { title: "Payroll", href: "/dashboard/hrm/payroll" },
    { title: "Attendance", href: "/dashboard/hrm/attendance/list" },
    { title: "Leave Management", href: "/dashboard/hrm/leave/applications" },
  ],
  pos: [
    { title: "Add POS", href: "/dashboard/pos/add" },
    { title: "POS Orders", href: "/dashboard/pos/orders" },
    { title: "Sales Report", href: "/dashboard/pos/reports/sales" },
    { title: "Products", href: "/dashboard/products/items" },
  ],
  crm: [
    { title: "CRM Overview", href: "/dashboard/dashboards/crm" },
    { title: "Leads", href: "/dashboard/crm/leads" },
    { title: "Deals", href: "/dashboard/crm/deals" },
    { title: "Lead Reports", href: "/dashboard/crm/reports/leads" },
  ],
  sales: [
    { title: "Sale Invoices", href: "/dashboard/sales/invoices" },
    { title: "Quotations", href: "/dashboard/quotations" },
    { title: "Products", href: "/dashboard/products/items" },
    { title: "Account Dashboard", href: "/dashboard/dashboards/account" },
  ],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

async function getModuleStats(slug: string): Promise<ModuleStat[]> {
  switch (slug) {
    case "project": {
      const projects = await prisma.project.findMany();
      return [
        { label: "Total Projects", value: String(projects.length) },
        { label: "In Progress", value: String(projects.filter((p) => p.status === "IN_PROGRESS").length) },
        { label: "Completed", value: String(projects.filter((p) => p.status === "COMPLETED").length) },
        { label: "On Hold", value: String(projects.filter((p) => p.status === "ON_HOLD").length) },
      ];
    }
    case "hrm": {
      const [employees, departments] = await Promise.all([
        prisma.employee.findMany(),
        prisma.department.count(),
      ]);
      return [
        { label: "Employees", value: String(employees.length) },
        { label: "Active", value: String(employees.filter((e) => e.isActive).length) },
        { label: "Departments", value: String(departments) },
        { label: "Inactive", value: String(employees.filter((e) => !e.isActive).length) },
      ];
    }
    case "pos": {
      const [orders, products] = await Promise.all([
        prisma.posOrder.findMany(),
        prisma.product.count({ where: { isActive: true } }),
      ]);
      const revenue = orders.reduce((sum, o) => sum + o.total, 0);
      return [
        { label: "Total Orders", value: String(orders.length) },
        { label: "POS Revenue", value: formatCurrency(revenue) },
        { label: "Products", value: String(products) },
        { label: "Pending Orders", value: String(orders.filter((o) => o.status === "PENDING").length) },
      ];
    }
    case "crm": {
      const [leads, deals] = await Promise.all([
        prisma.crmLead.findMany(),
        prisma.crmDeal.findMany(),
      ]);
      const pipeline = deals
        .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
        .reduce((sum, d) => sum + (d.value || 0), 0);
      return [
        { label: "Total Leads", value: String(leads.length) },
        { label: "Open Leads", value: String(leads.filter((l) => !["WON", "LOST"].includes(l.status)).length) },
        { label: "Total Deals", value: String(deals.length) },
        { label: "Pipeline Value", value: formatCurrency(pipeline) },
      ];
    }
    case "sales": {
      const invoices = await prisma.invoice.findMany();
      const revenue = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + i.total, 0);
      return [
        { label: "Total Invoices", value: String(invoices.length) },
        { label: "Paid Revenue", value: formatCurrency(revenue) },
        { label: "Pending", value: String(invoices.filter((i) => ["SENT", "OVERDUE"].includes(i.status)).length) },
        { label: "Draft", value: String(invoices.filter((i) => i.status === "DRAFT").length) },
      ];
    }
    default:
      return [];
  }
}

export default async function DashboardSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { slug } = await params;

  if (slug === "account") redirect("/dashboard/dashboards/account");
  if (slug === "crm") redirect("/dashboard/dashboards/crm");

  const name =
    dashboardNames[slug] ||
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") + " Dashboard";

  const stats = await getModuleStats(slug);
  const links = moduleLinks[slug] || [];

  return (
    <ModuleDashboardClient
      title={name}
      description={`Overview and quick access.`}
      stats={stats}
      links={links}
      icon={moduleIcons[slug]}
    />
  );
}
