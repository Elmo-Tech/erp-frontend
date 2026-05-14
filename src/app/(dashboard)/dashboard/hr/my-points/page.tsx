import type { Metadata } from "next";
import MyPointsPage from "@/views/hr/employee/MyPointsPage";

export const metadata: Metadata = {
	title: "My Points",
};

export default function Page() {
	return <MyPointsPage />;
}
