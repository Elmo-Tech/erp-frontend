"use client";

import { Button } from "@/shared/ui/button";
import { Contract } from "../../../types/contract";
import { Trash2 } from "lucide-react";

interface ContractActionsProps {
	contract: Contract;
	onView: (contract: Contract) => void;
	onDelete?: (contract: Contract) => void;
}

export function ContractActions({ contract, onDelete }: ContractActionsProps) {
	if (!onDelete) return null;

	return (
		<Button
			variant="ghost"
			size="icon"
			className="text-destructive hover:text-destructive"
			onClick={(e) => {
				e.stopPropagation();
				onDelete(contract);
			}}
		>
			<Trash2 className="h-4 w-4" />
		</Button>
	);
}
