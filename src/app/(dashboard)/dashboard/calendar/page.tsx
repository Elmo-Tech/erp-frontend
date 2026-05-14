import type { Metadata } from "next";
import MasterCalendarPage from "@/views/calendar/MasterCalendarPage";

export const metadata: Metadata = { title: "Master Calendar" };

export default function Page() {
	return <MasterCalendarPage />;
}
