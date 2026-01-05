"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { Lead, LeadStatus, LeadPriority } from "../../types/lead";
import { MoreHorizontal, Pencil, Trash2, Eye, Phone, Mail } from "lucide-react";

interface LeadsColumnsOptions {
	onView: (lead: Lead) => void;
	onEdit?: (lead: Lead) => void;
	onDelete?: (lead: Lead) => void;
}

const STATUS_VARIANTS: Record<LeadStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[LeadStatus.NEW]: "secondary",
	[LeadStatus.CONTACTED]: "default",
	[LeadStatus.QUALIFIED]: "default",
	[LeadStatus.PROPOSAL]: "default",
	[LeadStatus.NEGOTIATION]: "default",
	[LeadStatus.WON]: "default",
	[LeadStatus.LOST]: "destructive",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
	[LeadStatus.NEW]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	[LeadStatus.CONTACTED]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
	[LeadStatus.QUALIFIED]: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
	[LeadStatus.PROPOSAL]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
	[LeadStatus.NEGOTIATION]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
	[LeadStatus.WON]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	[LeadStatus.LOST]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const PRIORITY_COLORS: Record<LeadPriority, string> = {
	[LeadPriority.LOW]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
	[LeadPriority.MEDIUM]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	[LeadPriority.HIGH]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
	[LeadPriority.URGENT]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

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

export function getLeadsColumns({ onView, onEdit, onDelete }: LeadsColumnsOptions): Column<Lead>[] {
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
			render: (lead) => (
				<Badge
					className={STATUS_COLORS[lead.status]}
					variant={STATUS_VARIANTS[lead.status]}
				>
					{lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
				</Badge>
			),
		},
		{
			key: "priority",
			header: "Priority",
			render: (lead) => (
				<Badge
					className={PRIORITY_COLORS[lead.priority]}
					variant="outline"
				>
					{lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
				</Badge>
			),
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
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (lead) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => e.stopPropagation()}
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onView(lead)}>
							<Eye className="h-4 w-4 mr-2" />
							View
						</DropdownMenuItem>
						{onEdit && (
							<DropdownMenuItem onClick={() => onEdit(lead)}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
						)}
						{onDelete && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(lead)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
