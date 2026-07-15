import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateItemClient } from "./create-item-client";

export default async function CreateItemPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CreateItemClient />;
}
