"use client";

import { Button } from "@/shared/ui/button";
import { Lead } from "../../../types/lead";
import { Trash2 } from "lucide-react";

interface LeadActionsProps {
	lead: Lead;
	onView: (lead: Lead) => void;
	onDelete?: (lead: Lead) => void;
}

export function LeadActions({ lead, onDelete }: LeadActionsProps) {
	if (!onDelete) return null;

	return (
		<Button
			variant="ghost"
			size="icon"
			className="text-destructive hover:text-destructive"
			onClick={(e) => {
				e.stopPropagation();
				onDelete(lead);
			}}
		>
			<Trash2 className="h-4 w-4" />
		</Button>
	);
}
