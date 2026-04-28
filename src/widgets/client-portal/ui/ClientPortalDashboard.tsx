"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, FolderKanban, Receipt } from "lucide-react";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { useClientPortalInvoices, useClientPortalProjects } from "../model/use-client-portal";

export function ClientPortalDashboard() {
	const user = useAuthStore((state) => state.user);
	const projectsQuery = useClientPortalProjects({ perPage: 6 });
	const invoicesQuery = useClientPortalInvoices({ perPage: 5 });
	const projects = projectsQuery.data?.projects ?? [];
	const invoices = invoicesQuery.data?.invoices ?? [];
	const outstandingAmount = invoices.filter((invoice) => invoice.isPayable).reduce((sum, invoice) => sum + invoice.amount, 0);

	return (
		<div className="space-y-5">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Welcome, {user?.name || "Client"}</h1>
				<p className="text-sm text-muted-foreground">Your scoped portal for projects and invoices.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<Metric title="Active projects" value={projectsQuery.data?.pagination.total ?? projects.length} icon={FolderKanban} loading={projectsQuery.isLoading} />
				<Metric title="Invoices" value={invoicesQuery.data?.pagination.total ?? invoices.length} icon={Receipt} loading={invoicesQuery.isLoading} />
				<Metric title="Outstanding" value={formatCurrency(outstandingAmount, invoices[0]?.currency)} icon={AlertCircle} loading={invoicesQuery.isLoading} />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-sm">Projects</CardTitle>
						<Button asChild variant="ghost" size="sm">
							<Link href="/client/projects">
								View all
								<ArrowRight data-icon="inline-end" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="space-y-3">
						{projectsQuery.isLoading ? (
							<Skeleton className="h-28 w-full" />
						) : projects.length ? (
							projects.slice(0, 4).map((project) => (
								<Link key={project.projectId} href={`/client/projects/${project.projectId}`} className="block rounded-md border p-3 hover:bg-muted/40">
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<div className="truncate text-sm font-medium">{project.title}</div>
											<div className="text-xs text-muted-foreground">{project.statusLabel || project.status}</div>
										</div>
										<div className="text-xs tabular-nums text-muted-foreground">{project.progressPercentage ?? 0}%</div>
									</div>
									<Progress value={project.progressPercentage ?? 0} className="mt-2 h-1.5" />
								</Link>
							))
						) : (
							<div className="py-8 text-center text-sm text-muted-foreground">No projects available.</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-sm">Recent invoices</CardTitle>
						<Button asChild variant="ghost" size="sm">
							<Link href="/client/invoices">
								View all
								<ArrowRight data-icon="inline-end" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="space-y-2">
						{invoicesQuery.isLoading ? (
							<Skeleton className="h-28 w-full" />
						) : invoices.length ? (
							invoices.map((invoice) => (
								<div key={invoice.invoiceId} className="flex items-center justify-between rounded-md border px-3 py-2">
									<div>
										<div className="text-sm font-medium">{invoice.invoiceNumber}</div>
										<div className="text-xs text-muted-foreground">{invoice.statusLabel || invoice.status}</div>
									</div>
									<div className="text-sm font-medium">{formatCurrency(invoice.amount, invoice.currency)}</div>
								</div>
							))
						) : (
							<div className="py-8 text-center text-sm text-muted-foreground">No invoices available.</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function Metric({ title, value, icon: Icon, loading }: { title: string; value: React.ReactNode; icon: React.ElementType; loading?: boolean }) {
	return (
		<Card>
			<CardContent className="flex items-center justify-between p-4">
				<div>
					<div className="text-xs text-muted-foreground">{title}</div>
					<div className="mt-1 text-2xl font-semibold tabular-nums">{loading ? <Skeleton className="h-7 w-20" /> : value}</div>
				</div>
				<Icon className="size-4 text-muted-foreground" />
			</CardContent>
		</Card>
	);
}

function formatCurrency(amount: number, currency = "USD") {
	return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
