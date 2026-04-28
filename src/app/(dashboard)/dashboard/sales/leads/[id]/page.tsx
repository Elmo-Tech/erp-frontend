"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Calendar, DollarSign, Mail, Pencil, Phone, UserCircle } from "lucide-react";
import { leadApi } from "@/entities/lead/api/lead.api";
import { leadKeys } from "@/entities/lead/model/query-keys";
import type { Lead } from "@/entities/lead/model/types";
import { LeadStatusBadge } from "@/entities/lead/ui/LeadStatusBadge";
import { useSalesPermissions } from "@/entities/user/model/permissions";
import { useUpdateLead, useUpdateLeadStatus } from "@/features/leads/model/use-lead-actions";
import { ConvertLeadToClientButton } from "@/features/leads/ui/ConvertLeadToClientButton";
import { ClientContractsWidget } from "@/widgets/sales-management/ui/ClientContractsWidget";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

interface LeadDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function LeadDetailsPage({ params }: LeadDetailsPageProps) {
	const { id } = use(params);
	const leadId = parseInt(id, 10);

	return <LeadDetailsComposite leadId={leadId} />;
}

interface LeadDetailsCompositeProps {
	leadId: number;
	className?: string;
}

function LeadDetailsComposite({ leadId, className }: LeadDetailsCompositeProps) {
	const router = useRouter();
	const { canEditLeads, canDeleteLeads, canConvertLeads } = useSalesPermissions();

	const leadQuery = useQuery({
		queryKey: leadKeys.detail(leadId),
		queryFn: () => leadApi.getLeadById(leadId),
		enabled: Number.isFinite(leadId) && leadId > 0,
		staleTime: 5 * 60 * 1000,
	});

	if (leadQuery.isLoading) {
		return <LeadDetailsSkeleton />;
	}

	if (leadQuery.error || !leadQuery.data) {
		return (
			<section className={cn("flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Lead not found</div>
				<div className="text-sm text-muted-foreground">{leadQuery.error?.message || "This lead record is unavailable."}</div>
				<Button variant="outline" size="sm" onClick={() => router.push("/dashboard/sales")}>
					<ArrowLeft data-icon="inline-start" />
					Back to pipeline
				</Button>
			</section>
		);
	}

	const lead = leadQuery.data;

	return (
		<section className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div className="flex min-w-0 items-start gap-3">
					<Button type="button" variant="ghost" size="icon-sm" onClick={() => router.push("/dashboard/sales")} aria-label="Back to pipeline">
						<ArrowLeft />
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="truncate text-2xl font-semibold tracking-tight">{lead.name}</h1>
							<LeadStatusBadge status={lead.status} />
						</div>
						<p className="truncate text-sm text-muted-foreground">{lead.company || lead.email} / Created {formatDateDisplay(lead.createdAt)}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{canConvertLeads && !lead.isConverted && (
						<ConvertLeadToClientButton leadId={lead.leadId} leadName={lead.name} />
					)}
					{lead.isConverted && lead.client && (
						<Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/clients/${lead.client!.clientId}`)}>
							View client
						</Button>
					)}
				</div>
			</div>

			<LeadStats lead={lead} />

			<Tabs defaultValue="info" className="flex flex-col gap-4">
				<TabsList className="w-fit">
					<TabsTrigger value="info">Information</TabsTrigger>
					<TabsTrigger value="contracts">Contracts</TabsTrigger>
				</TabsList>

				<TabsContent value="info">
					<LeadInfoPanel lead={lead} />
				</TabsContent>

				<TabsContent value="contracts">
					<ClientContractsWidget clientId={leadId} clientName={lead.name} />
				</TabsContent>
			</Tabs>
		</section>
	);
}

function LeadStats({ lead }: { lead: Lead }) {
	const stats = [
		{ label: "Budget", value: lead.expectedBudget ? formatCurrency(lead.expectedBudget) : "Not set", icon: DollarSign },
		{ label: "Close date", value: formatDateDisplay(lead.expectedCloseDate), icon: Calendar },
		{ label: "Activities", value: String(lead.activitiesCount ?? 0), icon: UserCircle },
		{ label: "Meetings", value: String(lead.meetingsCount ?? 0), icon: Building2 },
	];

	return (
		<div className="grid gap-3 border-y py-3 md:grid-cols-4">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div key={stat.label} className="min-w-0">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Icon />
							{stat.label}
						</div>
						<div className="truncate text-lg font-semibold tracking-tight tabular-nums">{stat.value}</div>
					</div>
				);
			})}
		</div>
	);
}

function LeadInfoPanel({ lead }: { lead: Lead }) {
	const details = [
		{ label: "Email", value: lead.email, icon: Mail },
		{ label: "Phone", value: lead.phone || "Not set", icon: Phone },
		{ label: "Company", value: lead.company || "Not set", icon: Building2 },
		{ label: "Project", value: lead.projectName || "Not set", icon: UserCircle },
	];

	return (
		<div className="overflow-hidden rounded-md border bg-background">
			<div className="border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">Lead profile</div>
			<div className="grid grid-cols-1 md:grid-cols-2">
				{details.map((detail) => {
					const Icon = detail.icon;
					return (
						<div key={detail.label} className="flex min-h-14 items-center gap-3 border-b px-3 py-2.5 last:border-b-0 md:border-r md:even:border-r-0">
							<Icon className="text-muted-foreground" />
							<div className="min-w-0">
								<div className="text-xs text-muted-foreground">{detail.label}</div>
								<div className="truncate text-sm font-medium">{detail.value}</div>
							</div>
						</div>
					);
				})}
				<div className="min-h-14 border-b px-3 py-2.5 md:col-span-2">
					<div className="text-xs text-muted-foreground">Notes</div>
					<div className="text-sm font-medium">{lead.notes || "No notes"}</div>
				</div>
			</div>
		</div>
	);
}

function LeadDetailsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<Skeleton className="size-8" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-7 w-56" />
					<Skeleton className="h-4 w-40" />
				</div>
			</div>
			<div className="grid gap-3 md:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-20" />
				))}
			</div>
			<Skeleton className="h-10 w-80" />
			<Skeleton className="h-72 w-full" />
		</div>
	);
}
