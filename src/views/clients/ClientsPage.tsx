"use client";

import { ClientStatsWidget } from "@/widgets/client-management/ui/ClientStatsWidget";
import { ClientListWidget } from "@/widgets/client-management/ui/ClientListWidget";

export default function ClientsPage() {
	return (
		<div className="mx-auto flex w-full flex-col gap-6">
			<ClientStatsWidget />
			<ClientListWidget />
		</div>
	);
}
