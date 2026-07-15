import { redirect } from "next/navigation";

export default function HelpDeskPage() {
  redirect("/admin/helpdesk/all-tickets");
}
