import { LeadStatus } from "../../../types/lead";

export interface KanbanColumn {
	status: LeadStatus;
	title: string;
	color: string;
	borderColor: string;
	bgColor: string;
}

export const LEAD_STATUS_COLUMNS: KanbanColumn[] = [
	{
		status: LeadStatus.NEW,
		title: "New",
		color: "text-blue-600",
		borderColor: "border-l-blue-500",
		bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
	},
	{
		status: LeadStatus.CONTACTED,
		title: "Contacted",
		color: "text-purple-600",
		borderColor: "border-l-purple-500",
		bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
	},
	{
		status: LeadStatus.QUALIFIED,
		title: "Qualified",
		color: "text-amber-600",
		borderColor: "border-l-amber-500",
		bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
	},
	{
		status: LeadStatus.PROPOSAL,
		title: "Proposal",
		color: "text-orange-600",
		borderColor: "border-l-orange-500",
		bgColor: "bg-orange-50/50 dark:bg-orange-950/20",
	},
	{
		status: LeadStatus.NEGOTIATION,
		title: "Negotiation",
		color: "text-indigo-600",
		borderColor: "border-l-indigo-500",
		bgColor: "bg-indigo-50/50 dark:bg-indigo-950/20",
	},
	{
		status: LeadStatus.WON,
		title: "Won",
		color: "text-green-600",
		borderColor: "border-l-green-500",
		bgColor: "bg-green-50/50 dark:bg-green-950/20",
	},
	{
		status: LeadStatus.LOST,
		title: "Lost",
		color: "text-red-600",
		borderColor: "border-l-red-500",
		bgColor: "bg-red-50/50 dark:bg-red-950/20",
	},
];
