import { prisma } from "@/lib/db";

export async function seedWorkspaceDefaults(workspaceId: string) {
  const [customerCount, productCount, warehouseCount] = await Promise.all([
    prisma.customer.count({ where: { workspaceId } }),
    prisma.product.count({ where: { workspaceId } }),
    prisma.warehouse.count({ where: { workspaceId } }),
  ]);

  const promises: Promise<any>[] = [];

  if (customerCount === 0) {
    promises.push(
      prisma.customer.createMany({
        data: [
          { workspaceId, customerCode: "CUST-0001", name: "Acme Corp", email: "billing@acme.com", phone: "(555) 111-0001" },
          { workspaceId, customerCode: "CUST-0002", name: "TechStart Inc", email: "ap@techstart.com", phone: "(555) 111-0002" },
          { workspaceId, customerCode: "CUST-0003", name: "GlobalTech", email: "finance@globaltech.com", phone: "(555) 111-0003" },
          { workspaceId, customerCode: "CUST-0004", name: "Sarah Johnson", email: "sarah.johnson@client.com", phone: "(555) 222-0001" },
        ],
      })
    );
  }

  if (productCount === 0) {
    promises.push(
      prisma.product.createMany({
        data: [
          { workspaceId, name: "ERP Starter License", sku: "ERP-001", price: 299, cost: 50, stock: 999, category: "Software" },
          { workspaceId, name: "Consulting Hour", sku: "CON-001", price: 150, cost: 0, stock: 999, category: "Service" },
          { workspaceId, name: "Support Package", sku: "SUP-001", price: 499, cost: 100, stock: 999, category: "Service" },
        ],
      })
    );
  }

  if (warehouseCount === 0) {
    promises.push(
      prisma.warehouse.createMany({
        data: [
          { workspaceId, name: "Central Distribution Center", code: "CDC-01", address: "1250 Industrial Blvd", city: "Chicago", country: "USA", isActive: true },
          { workspaceId, name: "West Coast Warehouse", code: "WCW-01", address: "800 Pacific Ave", city: "Los Angeles", country: "USA", isActive: true },
        ],
      })
    );
  }

  await Promise.all(promises);
}

/**
 * Agar user ke paas koi workspace nahi hai toh automatically bana do.
 * Naye workspace mein default customers, products, aur warehouses bhi seed ho jayenge.
 * Yeh Login, Register, aur Admin User Create — teeno mein call hoga.
 * Returns: existing or newly created workspace
 */
export async function ensureUserWorkspace(userId: string): Promise<{
  id: string;
  name: string;
  slug: string;
} | null> {
  // Pehle check karo — kya workspace already hai?
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: { select: { id: true, name: true, slug: true } } },
    orderBy: { joinedAt: "asc" },
  });

  if (existing) return existing.workspace;

  // Super Admin ke liye workspace zaruri nahi
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, companyName: true, role: true },
  });

  if (!user) return null;
  if (user.role === "SUPER_ADMIN") return null;

  // Workspace name — companyName > name > email prefix
  const wsName = user.companyName?.trim() || user.name?.trim() || user.email.split("@")[0];
  const slugBase = wsName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Unique slug ensure karo
  let slug = slugBase;
  let attempt = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${attempt++}`;
  }

  // Workspace create karo
  const workspace = await prisma.workspace.create({
    data: { name: wsName, slug, isActive: true },
  });

  // User ko ADMIN member banao
  await prisma.workspaceMember.create({
    data: { userId, workspaceId: workspace.id, role: "ADMIN" },
  });

  // Default data seed karo naye workspace mein
  await seedWorkspaceDefaults(workspace.id);

  return { id: workspace.id, name: workspace.name, slug: workspace.slug };
}
