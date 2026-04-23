"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { FolderKanban, Receipt, AlertCircle, ArrowRight, DollarSign } from "lucide-react";
import { useClientProjects } from "../hooks/useClientProjects";
import { useClientInvoices, usePayInvoice } from "../hooks/useClientInvoices";
import { ClientProjectCard } from "./ClientProjectCard";
import { ClientInvoiceCard } from "./ClientInvoiceCard";
import { ClientInvoice } from "../types/clientInvoice";
import { toast } from "sonner";

/**
 * Format currency amount
 */
const formatCurrency = (amount: number, currency: string = "USD"): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

/**
 * Loading skeleton for project cards
 */
const ProjectCardSkeleton: React.FC = () => (
	<Card>
		<CardHeader className="pb-2">
			<div className="flex items-start justify-between">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-5 w-20" />
			</div>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-2 w-full" />
			</div>
			<div className="flex justify-between">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-4 w-20" />
			</div>
		</CardContent>
	</Card>
);

/**
 * Loading skeleton for invoice cards
 */
const InvoiceCardSkeleton: React.FC = () => (
	<Card>
		<CardHeader className="pb-2">
			<div className="flex items-start justify-between">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-5 w-16" />
			</div>
		</CardHeader>
		<CardContent className="space-y-3">
			<Skeleton className="h-8 w-28" />
			<Skeleton className="h-4 w-36" />
		</CardContent>
	</Card>
);

/**
 * ClientDashboard component for displaying client's projects and invoices overview.
 * Shows list of projects with progress bars, recent invoices, and total outstanding amount.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6 - Display projects, invoices, and outstanding amount
 */
export const ClientDashboard: React.FC = () => {
	const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useClientProjects({ perPage: 6 });
	const { data: invoicesData, isLoading: isLoadingInvoices, error: invoicesError } = useClientInvoices({ perPage: 4 });
	const payInvoiceMutation = usePayInvoice();

	// Calculate total outstanding amount (sent + overdue invoices)
	const invoices = invoicesData?.invoices;
	const outstandingAmount = React.useMemo(() => {
		if (!invoices) return 0;
		return invoices.filter((inv) => inv.isPayable).reduce((sum, inv) => sum + inv.amount, 0);
	}, [invoices]);

	// Count overdue invoices
	const overdueCount = React.useMemo(() => {
		if (!invoices) return 0;
		return invoices.filter((inv) => inv.isOverdue).length;
	}, [invoices]);

	const handlePayInvoice = async (invoice: ClientInvoice) => {
		try {
			await payInvoiceMutation.mutateAsync(invoice.invoiceId);
			toast.success("Payment successful!", {
				description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
			});
		} catch (error) {
			toast.error("Payment failed", {
				description: error instanceof Error ? error.message : "Please try again later.",
			});
		}
	};

	return (
		<div className="space-y-8">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				{/* Projects Count */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Projects</CardTitle>
						<FolderKanban className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>{isLoadingProjects ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{projectsData?.pagination.total || 0}</div>}</CardContent>
				</Card>

				{/* Outstanding Amount */}
				<Card className={overdueCount > 0 ? "border-red-200" : ""}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoadingInvoices ? (
							<Skeleton className="h-8 w-24" />
						) : (
							<>
								<div className="text-2xl font-bold">{formatCurrency(outstandingAmount)}</div>
								{overdueCount > 0 && (
									<p className="text-xs text-red-600 flex items-center gap-1 mt-1">
										<AlertCircle className="h-3 w-3" />
										{overdueCount} overdue invoice{overdueCount > 1 ? "s" : ""}
									</p>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Total Invoices */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>{isLoadingInvoices ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{invoicesData?.pagination.total || 0}</div>}</CardContent>
				</Card>
			</div>

			{/* Projects Section */}
			<section>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-xl font-semibold">Your Projects</h2>
						<p className="text-sm text-muted-foreground">Track progress on your active projects</p>
					</div>
					<Link href="/client/projects">
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
						>
							View All
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>

				{projectsError ? (
					<Card className="border-red-200">
						<CardContent className="flex items-center gap-2 py-6 text-red-600">
							<AlertCircle className="h-5 w-5" />
							<span>Failed to load projects. Please try again later.</span>
						</CardContent>
					</Card>
				) : isLoadingProjects ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<ProjectCardSkeleton key={i} />
						))}
					</div>
				) : projectsData?.projects.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
							<CardTitle className="text-lg mb-2">No Projects Yet</CardTitle>
							<CardDescription>You don&apos;t have any projects at the moment.</CardDescription>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{projectsData?.projects.map((project) => (
							<ClientProjectCard
								key={project.projectId}
								project={project}
							/>
						))}
					</div>
				)}
			</section>

			{/* Invoices Section */}
			<section>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-xl font-semibold">Recent Invoices</h2>
						<p className="text-sm text-muted-foreground">Your latest billing activity</p>
					</div>
					<Link href="/client/invoices">
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
						>
							View All
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>

				{invoicesError ? (
					<Card className="border-red-200">
						<CardContent className="flex items-center gap-2 py-6 text-red-600">
							<AlertCircle className="h-5 w-5" />
							<span>Failed to load invoices. Please try again later.</span>
						</CardContent>
					</Card>
				) : isLoadingInvoices ? (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
							<InvoiceCardSkeleton key={i} />
						))}
					</div>
				) : invoicesData?.invoices.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Receipt className="h-12 w-12 text-muted-foreground mb-4" />
							<CardTitle className="text-lg mb-2">No Invoices Yet</CardTitle>
							<CardDescription>You don&apos;t have any invoices at the moment.</CardDescription>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{invoicesData?.invoices.map((invoice) => (
							<ClientInvoiceCard
								key={invoice.invoiceId}
								invoice={invoice}
								onPayClick={handlePayInvoice}
								isPaymentLoading={payInvoiceMutation.isPending}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
};

export default ClientDashboard;
