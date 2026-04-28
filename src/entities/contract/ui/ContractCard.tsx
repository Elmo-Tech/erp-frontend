"use client";

import { MoreHorizontal } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { ContractStatusBadge } from "@/shared/ui/StatusBadge";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import type { Contract } from "../model/types";

interface ContractCardProps {
	contract: Contract;
	onView?: (contract: Contract) => void;
	onEdit?: (contract: Contract) => void;
	onDelete?: (contract: Contract) => void;
	className?: string;
}

export function ContractCard({ contract, onView, onEdit, onDelete, className }: ContractCardProps) {
	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (!onView) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onView(contract);
		}
	};

	return (
		<article
			role={onView ? "button" : undefined}
			tabIndex={onView ? 0 : undefined}
			onClick={() => onView?.(contract)}
			onKeyDown={handleKeyDown}
			className={cn(
				"grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0 md:grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_90px_100px_90px_40px] md:items-center md:gap-3",
				onView && "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className
			)}
		>
			<div className="min-w-0">
				<div className="truncate font-medium leading-5">{contract.title}</div>
				<div className="truncate text-xs text-muted-foreground">{contract.contractNumber}</div>
			</div>

			<div className="min-w-0">
				<div className="truncate leading-5">{contract.project?.title || "No project"}</div>
				<div className="truncate text-xs text-muted-foreground">{contract.partyOne.company}</div>
			</div>

			<div className="flex min-w-0 items-center gap-2">
				<ContractStatusBadge status={contract.status} size="sm" className="shrink-0" />
			</div>

			<div className="hidden text-xs tabular-nums text-muted-foreground md:block">
				{formatCurrency(contract.totalAmount, contract.currency)}
			</div>

			<div className="hidden text-xs text-muted-foreground md:block">
				{contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : "Unsigned"}
			</div>

			<div className="flex justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={`Open actions for ${contract.title}`}
							onClick={(event) => event.stopPropagation()}
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
						{onView && <DropdownMenuItem onClick={() => onView(contract)}>View</DropdownMenuItem>}
						{onEdit && <DropdownMenuItem onClick={() => onEdit(contract)}>Edit</DropdownMenuItem>}
						{onDelete && (
							<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(contract)}>
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</article>
	);
}
