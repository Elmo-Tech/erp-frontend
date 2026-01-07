"use client";

import { SalesWrapper } from "@/features/sales/components";

export default function SalesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Sales</h1>
				<p className="text-muted-foreground">Manage leads and contracts</p>
			</div>
			<SalesWrapper />
		</div>
	);
}
