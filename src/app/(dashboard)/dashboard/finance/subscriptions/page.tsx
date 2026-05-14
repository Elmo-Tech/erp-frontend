import type { Metadata } from "next";
import SubscriptionsPage from "@/views/finance/SubscriptionsPage";

export const metadata: Metadata = { title: "Subscriptions | Finance" };

export default function Page() {
	return <SubscriptionsPage />;
}
