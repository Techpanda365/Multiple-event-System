import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <VendorsClient />;
}
