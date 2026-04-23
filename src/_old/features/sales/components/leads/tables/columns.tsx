"use client";

import { Column } from "@/shared/ui/data-display/DataTable";
import { LeadStatusBadge, LeadPriorityBadge } from "@/shared/ui/StatusBadge";
import { Lead } from "../../../types/lead";
import { Phone, Mail } from "lucide-react";
import { LeadActions } from "./actions";

interface LeadsColumnsOptions {
	onView: (lead: Lead) => void;
	onDelete?: (lead: Lead) => void;
}

const formatDate = (dateString?: string) => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const formatCurrency = (amount?: number) => {
	if (!amount) return "-";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(amount);
};

export function getLeadsColumns({ onView, onDelete }: LeadsColumnsOptions): Column<Lead>[] {
	return [
		{
			key: "name",
			header: "Lead",
			render: (lead) => (
				<div>
					<span className="font-medium">{lead.name}</span>
					{lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
				</div>
			),
		},
		{
			key: "contact",
			header: "Contact",
			render: (lead) => (
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-1 text-sm">
						<Mail className="h-3 w-3 text-muted-foreground" />
						<span className="truncate max-w-[150px]">{lead.email}</span>
					</div>
					{lead.phone && (
						<div className="flex items-center gap-1 text-sm text-muted-foreground">
							<Phone className="h-3 w-3" />
							<span>{lead.phone}</span>
						</div>
					)}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (lead) => <LeadStatusBadge status={lead.status} />,
		},
		{
			key: "priority",
			header: "Priority",
			render: (lead) => <LeadPriorityBadge priority={lead.priority} />,
		},
		{
			key: "expectedBudget",
			header: "Budget",
			render: (lead) => <span className="font-medium">{formatCurrency(lead.expectedBudget)}</span>,
		},
		{
			key: "source",
			header: "Source",
			render: (lead) => <span className="capitalize">{lead.source?.replace("_", " ") || "-"}</span>,
		},
		{
			key: "nextFollowUp",
			header: "Next Follow-up",
			render: (lead) => formatDate(lead.nextFollowUpAt),
		},
		...(onDelete
			? [
					{
						key: "actions" as const,
						header: "",
						className: "w-[70px]",
						render: (lead: Lead) => (
							<LeadActions
								lead={lead}
								onView={onView}
								onDelete={onDelete}
							/>
						),
					},
			  ]
			: []),
	];
}
