import type { Metadata } from "next";
import UsersPage from "@/views/settings/UsersPage";

export const metadata: Metadata = {
	title: "Users | Settings",
};

export default function Page() {
	return <UsersPage />;
}
