"use client";

import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/data-display/DataTable";
import { ContractStatusBadge } from "@/components/shared/StatusBadge";
import { Contract } from "../../../types/contract";
import { ContractActions } from "./actions";

interface ContractsColumnsOptions {
	onView: (contract: Contract) => void;
	onDelete?: (contract: Contract) => void;
}

const formatCurrency = (amount: number, currency: string) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	}).format(amount);
};

const formatDate = (dateString?: string) => {
	if (!dateString) return "-";
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export function getContractsColumns({ onView, onDelete }: ContractsColumnsOptions): Column<Contract>[] {
	return [
		{
			key: "contractNumber",
			header: "Contract #",
			render: (contract) => <span className="font-mono text-sm">{contract.contractNumber}</span>,
		},
		{
			key: "title",
			header: "Title",
			render: (contract) => (
				<div>
					<span className="font-medium">{contract.title}</span>
					{contract.project && <p className="text-sm text-muted-foreground">{contract.project.title}</p>}
				</div>
			),
		},
		{
			key: "partyTwo",
			header: "Client",
			render: (contract) => (
				<div>
					<span className="font-medium">{contract.partyTwo.company}</span>
					<p className="text-sm text-muted-foreground">{contract.partyTwo.representative}</p>
				</div>
			),
		},
		{
			key: "totalAmount",
			header: "Amount",
			render: (contract) => <span className="font-semibold">{formatCurrency(contract.totalAmount, contract.currency)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (contract) => <ContractStatusBadge status={contract.status} />,
		},
		{
			key: "startDate",
			header: "Start Date",
			render: (contract) => formatDate(contract.startDate),
		},
		{
			key: "endDate",
			header: "End Date",
			render: (contract) => formatDate(contract.endDate),
		},
		{
			key: "milestones",
			header: "Milestones",
			render: (contract) => <Badge variant="outline">{contract.milestones?.length || 0}</Badge>,
		},
		...(onDelete
			? [
					{
						key: "actions" as const,
						header: "",
						className: "w-[70px]",
						render: (contract: Contract) => (
							<ContractActions
								contract={contract}
								onView={onView}
								onDelete={onDelete}
							/>
						),
					},
			  ]
			: []),
	];
}
