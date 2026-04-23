"use client";

import { ClientInvoiceList } from "@/_old/features/client-portal/components/ClientInvoiceList";

/**
 * Client Invoices Page
 * Route: /client/invoices
 * Uses ClientInvoiceList component to display invoices with filtering and payment options.
 *
 * Requirements: 15.1 - Display client invoices with filtering and outstanding amount
 */
export default function ClientInvoicesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Invoices</h1>
				<p className="text-muted-foreground">View and pay your invoices</p>
			</div>

			<ClientInvoiceList />
		</div>
	);
}
