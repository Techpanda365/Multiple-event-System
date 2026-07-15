import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("1234", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const companyUser = await prisma.user.upsert({
    where: { email: "company@example.com" },
    update: {},
    create: {
      email: "company@example.com",
      name: "Company User",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const mainWorkspace = await prisma.workspace.upsert({
    where: { slug: "my-company" },
    update: {},
    create: {
      name: "My Company",
      slug: "my-company",
      description: "Main company workspace",
      isActive: true,
    },
  });

  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: "demo-corp" },
    update: {},
    create: {
      name: "Demo Corp",
      slug: "demo-corp",
      description: "Demo company workspace",
      isActive: true,
    },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: superAdmin.id, workspaceId: mainWorkspace.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      workspaceId: mainWorkspace.id,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: superAdmin.id, workspaceId: demoWorkspace.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      workspaceId: demoWorkspace.id,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: companyUser.id, workspaceId: demoWorkspace.id } },
    update: {},
    create: {
      userId: companyUser.id,
      workspaceId: demoWorkspace.id,
      role: "ADMIN",
    },
  });

  for (const ws of [mainWorkspace, demoWorkspace]) {
    await prisma.subscriptionPlan.upsert({
      where: { id: `${ws.id}-starter` },
      update: {},
      create: {
        id: `${ws.id}-starter`,
        name: "Starter",
        description: "For small teams",
        price: 29,
        interval: "MONTHLY",
        trialDays: 14,
        features: ["CRM", "Projects", "Basic Reports"],
      },
    });

    await prisma.subscriptionPlan.upsert({
      where: { id: `${ws.id}-pro` },
      update: {},
      create: {
        id: `${ws.id}-pro`,
        name: "Professional",
        description: "For growing businesses",
        price: 79,
        interval: "MONTHLY",
        trialDays: 14,
        features: ["CRM", "HRM", "Accounting", "Projects", "POS", "Advanced Reports"],
      },
    });

    await prisma.subscriptionPlan.upsert({
      where: { id: `${ws.id}-enterprise` },
      update: {},
      create: {
        id: `${ws.id}-enterprise`,
        name: "Enterprise",
        description: "For large organizations",
        price: 199,
        interval: "MONTHLY",
        trialDays: 30,
        features: ["All Modules", "API Access", "Custom Branding", "Priority Support", "Dedicated Server"],
      },
    });
  }

  const dept = await prisma.department.upsert({
    where: { id: "engineering-dept" },
    update: {},
    create: {
      id: "engineering-dept",
      workspaceId: mainWorkspace.id,
      name: "Engineering",
      description: "Engineering Department",
    },
  });

  await prisma.employee.createMany({
    data: [
      { workspaceId: mainWorkspace.id, employeeId: "EMP001", firstName: "John", lastName: "Doe", email: "john@company.com", departmentId: dept.id, position: "Senior Developer", salary: 95000 },
      { workspaceId: mainWorkspace.id, employeeId: "EMP002", firstName: "Sarah", lastName: "Smith", email: "sarah@company.com", departmentId: dept.id, position: "Marketing Lead", salary: 75000 },
    ],
  });

  // Demo Corp — company user workspace sample data
  await prisma.crmLead.createMany({
    data: [
      { workspaceId: demoWorkspace.id, title: "Alice Johnson", company: "Bright Ideas Co", email: "alice@brightideas.com", phone: "(555) 123-4567", value: 15000, status: "QUALIFIED", source: "Website", assignedTo: "John Doe" },
      { workspaceId: demoWorkspace.id, title: "Bob Williams", company: "TechVenture Inc", email: "bob@techventure.com", phone: "(555) 234-5678", value: 8500, status: "NEW", source: "Referral", assignedTo: "Sarah Smith" },
      { workspaceId: demoWorkspace.id, title: "Carol Martinez", company: "GreenLeaf Ltd", email: "carol@greenleaf.com", phone: "(555) 345-6789", value: 22000, status: "PROPOSAL", source: "LinkedIn", assignedTo: "Mike Johnson" },
      { workspaceId: demoWorkspace.id, title: "David Lee", company: "Precision Tools", email: "david@precisiontools.com", phone: "(555) 456-7890", value: 6000, status: "CONTACTED", source: "Email Campaign", assignedTo: "Lisa Brown" },
      { workspaceId: demoWorkspace.id, title: "Emma Davis", company: "NextGen Solutions", email: "emma@nextgen.com", phone: "(555) 567-8901", value: 18500, status: "NEGOTIATION", source: "Trade Show", assignedTo: "John Doe" },
    ],
  });

  await prisma.crmDeal.createMany({
    data: [
      { workspaceId: demoWorkspace.id, name: "Acme Corp Deal", company: "Acme Corp", value: 12000, stage: "proposal", probability: 60, assignedTo: "John Doe" },
      { workspaceId: demoWorkspace.id, name: "TechStart Migration", company: "TechStart Inc", value: 25000, stage: "negotiation", probability: 80, assignedTo: "Sarah Smith" },
      { workspaceId: demoWorkspace.id, name: "GlobalTech Renewal", company: "GlobalTech", value: 8500, stage: "closed_won", probability: 100, assignedTo: "Mike Johnson" },
      { workspaceId: demoWorkspace.id, name: "InnovateLab Setup", company: "InnovateLab", value: 6000, stage: "qualified", probability: 40, assignedTo: "Lisa Brown" },
    ],
  });

  const monthsAgo = (n: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - n);
    return d;
  };

  await prisma.invoice.createMany({
    data: [
      { workspaceId: demoWorkspace.id, number: "INV-001", customerName: "Acme Corp", customerEmail: "billing@acme.com", items: [], subtotal: 2500, tax: 0, total: 2500, status: "PAID", createdAt: monthsAgo(5) },
      { workspaceId: demoWorkspace.id, number: "INV-002", customerName: "TechStart Inc", customerEmail: "ap@techstart.com", items: [], subtotal: 8000, tax: 0, total: 8000, status: "SENT", createdAt: monthsAgo(4) },
      { workspaceId: demoWorkspace.id, number: "INV-003", customerName: "GlobalTech", customerEmail: "finance@globaltech.com", items: [], subtotal: 15000, tax: 0, total: 15000, status: "PAID", createdAt: monthsAgo(3) },
      { workspaceId: demoWorkspace.id, number: "INV-004", customerName: "InnovateLab", customerEmail: "hello@innovatelab.com", items: [], subtotal: 3200, tax: 0, total: 3200, status: "PAID", createdAt: monthsAgo(2) },
      { workspaceId: demoWorkspace.id, number: "INV-005", customerName: "DataFlow Systems", customerEmail: "accounts@dataflow.com", items: [], subtotal: 6500, tax: 0, total: 6500, status: "OVERDUE", createdAt: monthsAgo(1) },
      { workspaceId: demoWorkspace.id, number: "INV-006", customerName: "Summit Group", customerEmail: "pay@summit.com", items: [], subtotal: 4200, tax: 0, total: 4200, status: "PAID", createdAt: new Date() },
    ],
  });

  await prisma.customer.deleteMany({ where: { workspaceId: demoWorkspace.id } });
  await prisma.customer.createMany({
    data: [
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0001", name: "Acme Corp", email: "billing@acme.com", phone: "(555) 111-0001" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0002", name: "TechStart Inc", email: "ap@techstart.com", phone: "(555) 111-0002" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0003", name: "GlobalTech", email: "finance@globaltech.com", phone: "(555) 111-0003" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0004", name: "InnovateLab", email: "hello@innovatelab.com", phone: "(555) 111-0004" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0005", name: "DataFlow Systems", email: "accounts@dataflow.com", phone: "(555) 111-0005" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0006", name: "Summit Group", email: "pay@summit.com", phone: "(555) 111-0006" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0007", name: "Sarah Johnson", email: "sarah.johnson@client.com", phone: "(555) 222-0001" },
      { workspaceId: demoWorkspace.id, customerCode: "CUST-0008", name: "Emily Davis", email: "emily.davis@client.com", phone: "(555) 222-0002" },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { workspaceId: demoWorkspace.id, category: "Office Rent", amount: 3000, description: "Monthly office rent", date: monthsAgo(5) },
      { workspaceId: demoWorkspace.id, category: "Software Licenses", amount: 1200, description: "SaaS subscriptions", date: monthsAgo(4) },
      { workspaceId: demoWorkspace.id, category: "Utilities", amount: 450, description: "Electricity & internet", date: monthsAgo(3) },
      { workspaceId: demoWorkspace.id, category: "Marketing", amount: 2800, description: "Ad campaigns", date: monthsAgo(2) },
      { workspaceId: demoWorkspace.id, category: "Travel", amount: 950, description: "Client meetings", date: monthsAgo(1) },
      { workspaceId: demoWorkspace.id, category: "Office Supplies", amount: 320, description: "Stationery", date: new Date() },
    ],
  });

  await prisma.product.createMany({
    data: [
      { workspaceId: demoWorkspace.id, name: "ERP Starter License", sku: "ERP-001", price: 299, cost: 50, stock: 999, category: "Software" },
      { workspaceId: demoWorkspace.id, name: "Consulting Hour", sku: "CON-001", price: 150, cost: 0, stock: 999, category: "Service" },
      { workspaceId: demoWorkspace.id, name: "Support Package", sku: "SUP-001", price: 499, cost: 100, stock: 999, category: "Service" },
    ],
  });

  const demoDeptEngineering = await prisma.department.upsert({
    where: { id: "demo-engineering-dept" },
    update: {},
    create: {
      id: "demo-engineering-dept",
      workspaceId: demoWorkspace.id,
      name: "Engineering",
      description: "Engineering Department",
    },
  });

  const demoDeptSales = await prisma.department.upsert({
    where: { id: "demo-sales-dept" },
    update: {},
    create: {
      id: "demo-sales-dept",
      workspaceId: demoWorkspace.id,
      name: "Sales",
      description: "Sales Department",
    },
  });

  const demoDeptHr = await prisma.department.upsert({
    where: { id: "demo-hr-dept" },
    update: {},
    create: {
      id: "demo-hr-dept",
      workspaceId: demoWorkspace.id,
      name: "HR",
      description: "Human Resources",
    },
  });

  await prisma.employee.createMany({
    data: [
      { workspaceId: demoWorkspace.id, employeeId: "DEM001", firstName: "John", lastName: "Doe", email: "john@company.com", departmentId: demoDeptEngineering.id, position: "Senior Developer", salary: 95000, isActive: true },
      { workspaceId: demoWorkspace.id, employeeId: "DEM002", firstName: "Sarah", lastName: "Smith", email: "sarah@company.com", departmentId: demoDeptSales.id, position: "Sales Manager", salary: 82000, isActive: true },
      { workspaceId: demoWorkspace.id, employeeId: "DEM003", firstName: "Mike", lastName: "Johnson", email: "mike@company.com", departmentId: demoDeptSales.id, position: "Account Executive", salary: 68000, isActive: true },
      { workspaceId: demoWorkspace.id, employeeId: "DEM004", firstName: "Lisa", lastName: "Brown", email: "lisa@company.com", departmentId: demoDeptHr.id, position: "HR Coordinator", salary: 55000, isActive: false },
      { workspaceId: demoWorkspace.id, employeeId: "DEM005", firstName: "Tom", lastName: "Wilson", email: "tom@company.com", departmentId: demoDeptEngineering.id, position: "Junior Developer", salary: 62000, isActive: true },
      { workspaceId: demoWorkspace.id, employeeId: "DEM006", firstName: "Emma", lastName: "Davis", email: "emma@company.com", departmentId: demoDeptHr.id, position: "Accountant", salary: 71000, isActive: true },
    ],
  });

  const staffUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "john@example.com" },
      update: {},
      create: { email: "john@example.com", name: "John Doe", passwordHash, role: "MANAGER", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "sarah@example.com" },
      update: {},
      create: { email: "sarah@example.com", name: "Sarah Smith", passwordHash, role: "MANAGER", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "mike@example.com" },
      update: {},
      create: { email: "mike@example.com", name: "Mike Johnson", passwordHash, role: "STAFF", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "lisa@example.com" },
      update: {},
      create: { email: "lisa@example.com", name: "Lisa Brown", passwordHash, role: "STAFF", isActive: false },
    }),
  ]);

  for (const [index, staffUser] of staffUsers.entries()) {
    const roles = ["MANAGER", "MANAGER", "STAFF", "STAFF"] as const;
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: staffUser.id, workspaceId: demoWorkspace.id } },
      update: {},
      create: {
        userId: staffUser.id,
        workspaceId: demoWorkspace.id,
        role: roles[index],
      },
    });
  }

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: companyUser.id, workspaceId: demoWorkspace.id } },
    update: {},
    create: { userId: companyUser.id, workspaceId: demoWorkspace.id, role: "ADMIN" },
  });

  const proPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Professional" },
  });

  if (proPlan) {
    await prisma.subscription.upsert({
      where: { id: `${demoWorkspace.id}-company-sub` },
      update: {},
      create: {
        id: `${demoWorkspace.id}-company-sub`,
        userId: companyUser.id,
        planId: proPlan.id,
        status: "SUCCEEDED",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const addonRecords = await Promise.all([
    prisma.addon.upsert({
      where: { slug: "email-marketing" },
      update: {},
      create: { name: "Email Marketing", slug: "email-marketing", description: "Send campaigns and track analytics", price: 15, isPremium: false },
    }),
    prisma.addon.upsert({
      where: { slug: "inventory-management" },
      update: {},
      create: { name: "Inventory Management", slug: "inventory-management", description: "Advanced inventory tracking & alerts", price: 25, isPremium: false },
    }),
    prisma.addon.upsert({
      where: { slug: "time-tracking" },
      update: {},
      create: { name: "Time Tracking", slug: "time-tracking", description: "Track employee work hours", price: 10, isPremium: false },
    }),
    prisma.addon.upsert({
      where: { slug: "custom-reports" },
      update: {},
      create: { name: "Custom Reports", slug: "custom-reports", description: "Build custom reports and dashboards", price: 20, isPremium: true },
    }),
    prisma.addon.upsert({
      where: { slug: "api-access" },
      update: {},
      create: { name: "API Access", slug: "api-access", description: "REST API for external integrations", price: 30, isPremium: true },
    }),
    prisma.addon.upsert({
      where: { slug: "whatsapp-integration" },
      update: {},
      create: { name: "WhatsApp Integration", slug: "whatsapp-integration", description: "Send notifications via WhatsApp", price: 12, isPremium: false },
    }),
  ]);

  for (const addon of addonRecords.slice(0, 2)) {
    await prisma.addonSubscription.upsert({
      where: { workspaceId_addonId: { workspaceId: demoWorkspace.id, addonId: addon.id } },
      update: { isActive: true },
      create: { workspaceId: demoWorkspace.id, addonId: addon.id, isActive: true },
    });
  }

  const projectWebsite = await prisma.project.upsert({
    where: { id: "demo-project-website" },
    update: {},
    create: {
      id: "demo-project-website",
      workspaceId: demoWorkspace.id,
      name: "Website Redesign",
      description: "Complete redesign of company website",
      status: "IN_PROGRESS",
      startDate: monthsAgo(2),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 45000,
      createdBy: companyUser.id,
    },
  });

  const projectMobile = await prisma.project.upsert({
    where: { id: "demo-project-mobile" },
    update: {},
    create: {
      id: "demo-project-mobile",
      workspaceId: demoWorkspace.id,
      name: "Mobile App v2",
      description: "Next generation mobile application",
      status: "PLANNING",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      budget: 120000,
      createdBy: companyUser.id,
    },
  });

  await prisma.project.upsert({
    where: { id: "demo-project-api" },
    update: {},
    create: {
      id: "demo-project-api",
      workspaceId: demoWorkspace.id,
      name: "API Integration",
      description: "Third-party API integrations",
      status: "COMPLETED",
      startDate: monthsAgo(4),
      endDate: monthsAgo(1),
      budget: 18000,
      createdBy: companyUser.id,
    },
  });

  await prisma.projectTask.createMany({
    data: [
      { projectId: projectWebsite.id, title: "Design mockups", status: "DONE", priority: "high" },
      { projectId: projectWebsite.id, title: "Frontend development", status: "IN_PROGRESS", priority: "high" },
      { projectId: projectWebsite.id, title: "QA testing", status: "TODO", priority: "medium" },
      { projectId: projectMobile.id, title: "Requirements gathering", status: "IN_PROGRESS", priority: "high" },
      { projectId: projectMobile.id, title: "UI/UX design", status: "TODO", priority: "medium" },
    ],
  });

  console.log("Seed completed!");
  console.log("Super Admin: superadmin@example.com / 1234");
  console.log("Company User: company@example.com / 1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
