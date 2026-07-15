import { redirect } from "next/navigation";

export default function BackupPage() {
  redirect("/admin/backup/system");
}
