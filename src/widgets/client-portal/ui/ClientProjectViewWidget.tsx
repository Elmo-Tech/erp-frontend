"use client";

import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { useApproveClientProjectUi, useClientPortalProject } from "../model/use-client-portal";

interface ClientProjectViewWidgetProps {
	projectId: number;
}

export function ClientProjectViewWidget({ projectId }: ClientProjectViewWidgetProps) {
	const projectQuery = useClientPortalProject(projectId);
	const approveUi = useApproveClientProjectUi();
	const project = projectQuery.data;

	const handleApprove = async () => {
		try {
			await approveUi.mutateAsync(projectId);
			toast.success("UI approved");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to approve UI");
		}
	};

	if (projectQuery.isLoading) {
		return <Skeleton className="h-96 w-full" />;
	}

	if (!project) {
		return (
			<div className="space-y-4">
				<Button asChild variant="ghost">
					<Link href="/client/projects">
						<ArrowLeft data-icon="inline-start" />
						Projects
					</Link>
				</Button>
				<div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Project not found.</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Button asChild variant="ghost" size="sm">
				<Link href="/client/projects">
					<ArrowLeft data-icon="inline-start" />
					Projects
				</Link>
			</Button>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
					<p className="text-sm text-muted-foreground">Client-safe project progress view.</p>
				</div>
				<Badge variant="outline" className="w-fit rounded-sm">
					{project.statusLabel || project.status}
				</Badge>
			</div>

			<Card>
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-4 md:grid-cols-3">
						<ProjectStat label="Budget" value={formatCurrency(project.budget ?? 0, project.currency)} />
						<ProjectStat label="Deadline" value={project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"} />
						<ProjectStat label="Progress" value={`${project.progressPercentage ?? 0}%`} />
					</div>
					<Progress value={project.progressPercentage ?? 0} className="h-2" />
					{project.canApproveUI && (
						<Button onClick={handleApprove} disabled={approveUi.isPending}>
							<CheckCircle2 data-icon="inline-start" />
							Approve UI
						</Button>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Project invoices</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{project.invoices?.length ? (
						project.invoices.map((invoice) => (
							<div key={invoice.invoiceId} className="flex items-center justify-between rounded-md border px-3 py-2">
								<span className="text-sm font-medium">{invoice.invoiceNumber}</span>
								<span className="text-sm">{formatCurrency(invoice.amount, invoice.currency)}</span>
							</div>
						))
					) : (
						<div className="py-6 text-center text-sm text-muted-foreground">No invoices attached.</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function ProjectStat({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="rounded-md border p-3">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="mt-1 text-sm font-medium">{value}</div>
		</div>
	);
}

function formatCurrency(amount: number, currency = "USD") {
	return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
