import type { Metadata } from "next";
import LeaveRequestsPage from "@/views/hr/admin/LeaveRequestsPage";

export const metadata: Metadata = {
	title: "Leave Requests | HR Admin",
};

export default function Page() {
	return <LeaveRequestsPage />;
}
