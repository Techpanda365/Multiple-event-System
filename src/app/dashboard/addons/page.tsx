import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { AddonsClient } from "./addons-client";

export default async function AddonsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [addons, installed] = await Promise.all([
    prisma.addon.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.addonSubscription.findMany({
      where: { isActive: true },
      select: { addonId: true },
    }),
  ]);

  const installedIds = new Set(installed.map((s) => s.addonId));

  return (
    <AddonsClient
      addons={addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        premium: addon.isPremium,
        installed: installedIds.has(addon.id),
      }))}
    />
  );
}
