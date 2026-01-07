"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Quotation } from "../../../types/quotation";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

interface QuotationActionsProps {
	quotation: Quotation;
	onView?: (quotation: Quotation) => void;
	onEdit?: (quotation: Quotation) => void;
	onDelete?: (quotation: Quotation) => void;
}

export function QuotationActions({ quotation, onView, onEdit, onDelete }: QuotationActionsProps) {
	if (!onView && !onEdit && !onDelete) return null;

	return (
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
					<DropdownMenuItem onClick={() => onView(quotation)}>
						<Eye className="h-4 w-4 mr-2" />
						View
					</DropdownMenuItem>
				)}
				{onEdit && (
					<DropdownMenuItem onClick={() => onEdit(quotation)}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</DropdownMenuItem>
				)}
				{onDelete && (
					<DropdownMenuItem
						className="text-destructive"
						onClick={() => onDelete(quotation)}
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
