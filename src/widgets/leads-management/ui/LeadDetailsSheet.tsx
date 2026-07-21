"use client";

import { Banknote, Building2, Calendar, Download, FileText, Mail, Phone, UserRound } from "lucide-react";
import { useSalesPermissions } from "@/entities/user/model/permissions";
import { useGetLead, useGetLeadContracts, useGetLeadProposals, useGetLeadQuotations } from "@/features/leads/api/leads.api";
import { STAGE_COLORS, ActivityTimeline, InfoRow, PipelineProgress } from "@/features/leads/ui/LeadInfoRow";
import { STAGE_LABELS } from "@/features/leads/model/pipelineConstants";
import type { Lead } from "@/features/leads/model/types";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

interface LeadDetailsSheetProps {
	lead: Lead | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface DocumentSummary {
	id: number;
	status: string;
	file_path: string | null;
	file_name: string | null;
	creation_type: string;
	created_at: string;
}

function DocumentSummaryRow({ document, title }: { document: DocumentSummary; title: string }) {
	const documentName = document.file_name ?? `${title.replace(/s$/, "")} #${document.id}`;

	return (
		<div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
				<FileText className="size-4" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{documentName}</p>
				<p className="text-xs text-muted-foreground">{new Date(document.created_at).toLocaleDateString()} · {document.creation_type.replaceAll("_", " ")}</p>
			</div>
			<Badge variant="outline" className="shrink-0 capitalize">{document.status}</Badge>
			{document.file_path && (
				<a href={document.file_path} target="_blank" rel="noopener noreferrer" aria-label={`Download ${documentName}`} className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">
					<Download className="size-4" />
				</a>
			)}
		</div>
	);
}

function DocumentList({ title, items, isLoading, restricted = false }: { title: string; items: DocumentSummary[]; isLoading: boolean; restricted?: boolean }) {
	let content: React.ReactNode;
	if (restricted) content = <p className="rounded-lg border border-dashed px-3 py-4 text-xs text-muted-foreground">You do not have permission to view these documents.</p>;
	else if (isLoading) content = <div className="space-y-2"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>;
	else if (items.length === 0) content = <p className="rounded-lg border border-dashed px-3 py-4 text-xs text-muted-foreground">No {title.toLowerCase()} recorded.</p>;
	else content = <div className="space-y-2">{items.map((document) => <DocumentSummaryRow key={document.id} document={document} title={title} />)}</div>;

	return (
		<section className="space-y-2.5">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">{title}</h3>
				<span className="text-xs tabular-nums text-muted-foreground">{restricted ? "Restricted" : items.length}</span>
			</div>
			{content}
		</section>
	);
}

function LeadOverview({ lead }: { lead: Lead }) {
	return (
		<TabsContent value="overview" className="m-0 space-y-6 px-5 py-4">
			<div className="space-y-3">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Information</p>
				<div className="space-y-2.5">
					<InfoRow icon={Building2} label="Company" value={lead.company} />
					<InfoRow icon={Mail} label="Email" value={lead.email} />
					<InfoRow icon={Phone} label="Phone" value={lead.phone} />
					<InfoRow icon={UserRound} label="Assigned To" value={lead.assignee?.name ?? (lead.assignedTo ? `User #${lead.assignedTo}` : null)} />
					<InfoRow icon={Banknote} label="Expected Budget" value={lead.expectedBudget != null ? lead.expectedBudget.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : null} />
					<InfoRow icon={Calendar} label="Created" value={new Date(lead.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} />
				</div>
			</div>
			{(lead.source || lead.notes) && <div className="space-y-3 rounded-lg border bg-muted/20 p-4">{lead.source && <p className="text-sm"><span className="text-muted-foreground">Source:</span> {lead.source}</p>}{lead.notes && <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{lead.notes}</p>}</div>}
			<Separator />
			<PipelineProgress currentStage={lead.stage} />
			<Separator />
			<div className="space-y-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stage path</p><ActivityTimeline currentStage={lead.stage} /></div>
			<p className="pt-2 text-xs text-muted-foreground/60">Lead #{lead.id}</p>
		</TabsContent>
	);
}

function LeadDetailsSheetContent({ lead, open, onOpenChange }: { lead: Lead; open: boolean; onOpenChange: (open: boolean) => void }) {
	const { canViewLeads, canViewQuotations, canViewContracts } = useSalesPermissions();
	const detailsQuery = useGetLead(lead.id, open && canViewLeads);
	const proposalsQuery = useGetLeadProposals(lead.id, open && canViewLeads);
	const quotationsQuery = useGetLeadQuotations(lead.id, open && canViewQuotations);
	const contractsQuery = useGetLeadContracts(lead.id, open && canViewContracts);
	const details = detailsQuery.data ?? lead;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-xl lg:max-w-2xl">
				<SheetHeader className="shrink-0 border-b px-5 pb-4 pt-5">
					<div className="flex items-start justify-between gap-3 pr-6">
						<div className="min-w-0">
							<SheetTitle className="truncate text-base font-semibold leading-tight">{details.name}</SheetTitle>
							<SheetDescription className="mt-0.5 truncate text-sm">{details.company ?? `Lead #${details.id}`}</SheetDescription>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-1.5">
							<Badge variant="outline" className={cn("border text-xs", STAGE_COLORS[details.stage])}>{STAGE_LABELS[details.stage]}</Badge>
							<span className="text-[11px] font-medium text-muted-foreground">View only</span>
						</div>
					</div>
					<p className="pr-6 text-xs text-muted-foreground">Pipeline changes are managed from the Kanban board.</p>
				</SheetHeader>
				<Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
					<div className="shrink-0 border-b px-5 py-2">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="documents">Documents</TabsTrigger>
						</TabsList>
					</div>
					<ScrollArea className="flex-1 overflow-y-auto">
						<LeadOverview lead={details} />
						<TabsContent value="documents" className="m-0 space-y-6 px-5 py-4">
							<DocumentList title="Proposals" items={proposalsQuery.data ?? []} isLoading={proposalsQuery.isLoading} restricted={!canViewLeads} />
							<DocumentList title="Quotations" items={quotationsQuery.data ?? []} isLoading={quotationsQuery.isLoading} restricted={!canViewQuotations} />
							<DocumentList title="Contracts" items={contractsQuery.data ?? []} isLoading={contractsQuery.isLoading} restricted={!canViewContracts} />
						</TabsContent>
					</ScrollArea>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
}

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
	if (!lead) return null;
	return <LeadDetailsSheetContent lead={lead} open={open} onOpenChange={onOpenChange} />;
}
