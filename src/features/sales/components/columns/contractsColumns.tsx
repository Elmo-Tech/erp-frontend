"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Column } from "@/components/shared/data-display/DataTable";
import { Contract, ContractStatus } from "../../types/contract";
import { MoreHorizontal, Pencil, Trash2, Eye, FileSignature } from "lucide-react";

interface ContractsColumnsOptions {
	onView: (contract: Contract) => void;
	onEdit?: (contract: Contract) => void;
	onDelete?: (contract: Contract) => void;
	onSign?: (contract: Contract) => void;
}

const STATUS_VARIANTS: Record<ContractStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[ContractStatus.DRAFT]: "secondary",
	[ContractStatus.PENDING_SIGNATURE]: "outline",
	[ContractStatus.SIGNED]: "default",
	[ContractStatus.ACTIVE]: "default",
	[ContractStatus.COMPLETED]: "default",
	[ContractStatus.TERMINATED]: "destructive",
};

const STATUS_COLORS: Record<ContractStatus, string> = {
	[ContractStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
	[ContractStatus.PENDING_SIGNATURE]: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
	[ContractStatus.SIGNED]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
	[ContractStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
	[ContractStatus.COMPLETED]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
	[ContractStatus.TERMINATED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

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

const formatStatus = (status: ContractStatus) => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
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
			render: (contract) => (
				<Badge
					className={STATUS_COLORS[contract.status]}
					variant={STATUS_VARIANTS[contract.status]}
				>
					{formatStatus(contract.status)}
				</Badge>
			),
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
