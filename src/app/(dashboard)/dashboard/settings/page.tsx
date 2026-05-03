import { redirect } from "next/navigation";

export default function SettingsIndexPage() {
	redirect("/dashboard/settings/crm/lead-sources");
}
