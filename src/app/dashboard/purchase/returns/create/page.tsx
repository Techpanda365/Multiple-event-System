import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePurchaseReturnClient } from "./create-purchase-return-client";

export default async function CreatePurchaseReturnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CreatePurchaseReturnClient />;
}
