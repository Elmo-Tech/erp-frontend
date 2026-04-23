"use client";

import { Column } from "@/shared/ui/data-display/DataTable";
import { QuotationStatusBadge } from "@/shared/ui/StatusBadge";
import { Quotation } from "../../../types/quotation";
import { QuotationActions } from "./actions";

interface QuotationsColumnsOptions {
	onView?: (quotation: Quotation) => void;
	onEdit?: (quotation: Quotation) => void;
	onDelete?: (quotation: Quotation) => void;
}

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
			render: (item) => <QuotationStatusBadge status={item.status} />,
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
				<QuotationActions
					quotation={item}
					onView={onView}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			),
		},
	];
}
