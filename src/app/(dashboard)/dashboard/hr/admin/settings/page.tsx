import type { Metadata } from "next";
import HrSettingsPage from "@/views/hr/admin/HrSettingsPage";

export const metadata: Metadata = {
	title: "HR Settings | HR Admin",
};

export default function Page() {
	return <HrSettingsPage />;
}
