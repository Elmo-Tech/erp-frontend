"use client";

import { ClientsWrapper } from "@/features/clients/components";

export default function ClientsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Clients</h1>
				<p className="text-muted-foreground">Manage your clients and their information</p>
			</div>
			<ClientsWrapper />
		</div>
	);
}
