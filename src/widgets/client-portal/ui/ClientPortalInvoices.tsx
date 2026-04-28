"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { useClientPortalInvoices, usePayClientInvoice } from "../model/use-client-portal";

export function ClientPortalInvoices() {
	const [search, setSearch] = useState("");
	const invoicesQuery = useClientPortalInvoices({ search: search || undefined, perPage: 20 });
	const payInvoice = usePayClientInvoice();
	const invoices = invoicesQuery.data?.invoices ?? [];

	const handlePay = async (invoiceId: number) => {
		try {
			await payInvoice.mutateAsync(invoiceId);
			toast.success("Invoice paid");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Payment failed");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
					<p className="text-sm text-muted-foreground">Client-scoped invoice history and payment status.</p>
				</div>
				<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoices" className="h-9 sm:w-72" />
			</div>

			<Card>
				<CardContent className="p-0">
					{invoicesQuery.isLoading ? (
						<div className="space-y-2 p-3">
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
							<Skeleton className="h-12 w-full" />
						</div>
					) : invoices.length ? (
						<div className="divide-y">
							{invoices.map((invoice) => (
								<div key={invoice.invoiceId} className="grid gap-3 px-3 py-2 text-sm md:grid-cols-[1fr_140px_120px_120px] md:items-center">
									<div>
										<div className="font-medium">{invoice.invoiceNumber}</div>
										<div className="text-xs text-muted-foreground">Due {new Date(invoice.dueDate).toLocaleDateString()}</div>
									</div>
									<div className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</div>
									<Badge variant={invoice.isOverdue ? "destructive" : "outline"} className="w-fit rounded-sm">
										{invoice.statusLabel || invoice.status}
									</Badge>
									{invoice.isPayable ? (
										<Button size="sm" onClick={() => handlePay(invoice.invoiceId)} disabled={payInvoice.isPending}>
											Pay
										</Button>
									) : (
										<span className="text-xs text-muted-foreground">No action</span>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="flex h-48 flex-col items-center justify-center text-sm text-muted-foreground">
							<Receipt className="mb-2 size-5" />
							No invoices found.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function formatCurrency(amount: number, currency = "USD") {
	return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
