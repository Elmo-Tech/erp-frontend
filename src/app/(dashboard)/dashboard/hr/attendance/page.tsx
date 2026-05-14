import type { Metadata } from "next";
import MyAttendancePage from "@/views/hr/employee/MyAttendancePage";

export const metadata: Metadata = {
	title: "My Attendance",
};

export default function Page() {
	return <MyAttendancePage />;
}
