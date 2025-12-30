"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientInvoicesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Invoices</h1>
				<p className="text-muted-foreground">View and pay invoices</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Invoice List</CardTitle>
					<CardDescription>All your invoices</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Invoice list will be displayed here...</p>
				</CardContent>
			</Card>
		</div>
	);
}
