import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function RetainerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <DashboardLayout user={session.user}>
      <h1 className="text-2xl font-bold">Retainer</h1>
    </DashboardLayout>
  );
}
