"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { ContractStatusBadge } from "@/components/shared/StatusBadge";
import { Contract, ContractStatus } from "../../types/contract";
import { MoreHorizontal, Pencil, Trash2, Eye, FileSignature } from "lucide-react";

interface ContractsColumnsOptions {
	onView: (contract: Contract) => void;
	onEdit?: (contract: Contract) => void;
	onDelete?: (contract: Contract) => void;
	onSign?: (contract: Contract) => void;
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

export function getContractsColumns({ onView, onEdit, onDelete, onSign }: ContractsColumnsOptions): Column<Contract>[] {
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
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (contract) => (
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
						<DropdownMenuItem onClick={() => onView(contract)}>
							<Eye className="h-4 w-4 mr-2" />
							View
						</DropdownMenuItem>
						{onSign && contract.status === ContractStatus.PENDING_SIGNATURE && (
							<DropdownMenuItem onClick={() => onSign(contract)}>
								<FileSignature className="h-4 w-4 mr-2" />
								Sign
							</DropdownMenuItem>
						)}
						{onEdit && (
							<DropdownMenuItem onClick={() => onEdit(contract)}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit
							</DropdownMenuItem>
						)}
						{onDelete && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onDelete(contract)}
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
