"use client";

import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Column } from "@/shared/ui/data-display/DataTable";
import { UserWithPoints } from "../../../types/userPoints";
import { UserPointsActions } from "./actions";

interface UserPointsColumnsOptions {
	onAddPoints: (user: UserWithPoints) => void;
	onDeductPoints: (user: UserWithPoints) => void;
	onSetPoints: (user: UserWithPoints) => void;
	onViewHistory: (user: UserWithPoints) => void;
}

export function getUserPointsColumns({ onAddPoints, onDeductPoints, onSetPoints, onViewHistory }: UserPointsColumnsOptions): Column<UserWithPoints>[] {
	return [
		{
			key: "user",
			header: "Employee",
			render: (user: UserWithPoints) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={user.avatar}
							alt={user.name}
						/>
						<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{user.name}</div>
						<div className="text-sm text-muted-foreground">{user.email}</div>
					</div>
				</div>
			),
		},
		{
			key: "totalPoints",
			header: "Total Points",
			render: (user: UserWithPoints) => (
				<div className="text-center">
					<Badge
						variant={user.totalPoints >= 100 ? "default" : "secondary"}
						className="text-sm"
					>
						{user.totalPoints} pts
					</Badge>
				</div>
			),
		},
		{
			key: "isActive",
			header: "Status",
			render: (user: UserWithPoints) => <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>,
		},
		{
			key: "actions",
			header: "",
			className: "w-[70px]",
			render: (user: UserWithPoints) => (
				<UserPointsActions
					user={user}
					onAddPoints={onAddPoints}
					onDeductPoints={onDeductPoints}
					onSetPoints={onSetPoints}
					onViewHistory={onViewHistory}
				/>
			),
		},
	];
}
