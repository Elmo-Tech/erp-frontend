"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserWithPoints } from "../../../types/userPoints";
import { MoreHorizontal, Plus, Minus, Settings, History } from "lucide-react";

interface UserPointsActionsProps {
	user: UserWithPoints;
	onAddPoints: (user: UserWithPoints) => void;
	onDeductPoints: (user: UserWithPoints) => void;
	onSetPoints: (user: UserWithPoints) => void;
	onViewHistory: (user: UserWithPoints) => void;
}

export function UserPointsActions({ user, onAddPoints, onDeductPoints, onSetPoints, onViewHistory }: UserPointsActionsProps) {
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
				<DropdownMenuItem onClick={() => onAddPoints(user)}>
					<Plus className="h-4 w-4 mr-2 text-green-600" />
					Add Points
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onDeductPoints(user)}>
					<Minus className="h-4 w-4 mr-2 text-red-600" />
					Deduct Points
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onSetPoints(user)}>
					<Settings className="h-4 w-4 mr-2 text-blue-600" />
					Set Points
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onViewHistory(user)}>
					<History className="h-4 w-4 mr-2 text-gray-600" />
					View History
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
