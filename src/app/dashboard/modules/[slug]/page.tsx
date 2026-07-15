import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ModuleDashboardClient } from "@/app/dashboard/dashboards/_components/module-dashboard-client";
import { getModuleTitleFromSlug } from "@/lib/navigation/company-nav";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const title =
    getModuleTitleFromSlug(slug) ||
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  return (
    <ModuleDashboardClient
      title={title}
      description={`Manage ${title}. This module is ready for configuration.`}
      stats={[
        { label: "Status", value: "Active" },
        { label: "Module", value: title },
      ]}
      links={[
        { title: `${title} Dashboard`, href: `/dashboard/dashboards/${slug}` },
        { title: "Main Dashboard", href: "/dashboard" },
      ]}
    />
  );
}
