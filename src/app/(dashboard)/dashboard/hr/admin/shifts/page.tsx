import type { Metadata } from "next";
import ShiftsPage from "@/views/hr/admin/ShiftsPage";

export const metadata: Metadata = {
	title: "Shifts | HR Admin",
};

export default function Page() {
	return <ShiftsPage />;
}
