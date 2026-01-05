"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { Quotation, QuotationStatus } from "../../types/quotation";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

interface QuotationsColumnsOptions {
	onView?: (quotation: Quotation) => void;
	onEdit?: (quotation: Quotation) => void;
	onDelete?: (quotation: Quotation) => void;
}

const STATUS_VARIANTS: Record<QuotationStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[QuotationStatus.DRAFT]: "secondary",
	[QuotationStatus.SENT]: "default",
	[QuotationStatus.VIEWED]: "default",
	[QuotationStatus.NEGOTIATION]: "outline",
	[QuotationStatus.APPROVED]: "default",
	[QuotationStatus.REJECTED]: "destructive",
	[QuotationStatus.EXPIRED]: "outline",
};

const formatCurrency = (amount: number, currency: string) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(amount);
};

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export function getQuotationsColumns({ onView, onEdit, onDelete }: QuotationsColumnsOptions): Column<Quotation>[] {
	return [
		{
			key: "quotationId",
			header: "ID",
			render: (item) => <span className="font-mono text-sm">#{item.quotationId}</span>,
		},
		{
			key: "lead",
			header: "Lead",
			render: (item) => (
				<div>
					<span className="font-medium">{item.lead?.name || "N/A"}</span>
					{item.lead?.company && <p className="text-sm text-muted-foreground">{item.lead.company}</p>}
				</div>
			),
		},
		{
			key: "totalHours",
			header: "Hours",
			render: (item) => <span>{item.pricingBreakdown?.totalHours || 0}h</span>,
		},
		{
			key: "finalPrice",
			header: "Price",
			render: (item) => <span className="font-semibold">{formatCurrency(item.finalPrice, item.currency)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (item) => <Badge variant={STATUS_VARIANTS[item.status]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge>,
		},
		{
			key: "createdAt",
			header: "Created",
			render: (item) => formatDate(item.createdAt),
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (item) => (
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
						{onView && (
							<DropdownMenuItem onClick={() => onView(item)}>
								<Eye className="h-4 w-4 mr-2" />
								View
							</DropdownMenuItem>
						)}
						{onEdit && (
							<DropdownMenuItem onClick={() => onEdit(item)}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
						)}
						{onDelete && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(item)}
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
