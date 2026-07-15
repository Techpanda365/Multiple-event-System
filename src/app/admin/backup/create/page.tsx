import { redirect } from "next/navigation";

export default function CreateBackupPage() {
  redirect("/admin/backup/system");
}
