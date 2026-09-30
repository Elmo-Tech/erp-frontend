"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Clock, MoreVertical, Calendar, Edit, UserX, UserCheck } from "lucide-react";
import type { Employee } from "../types";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/config/simplification";

interface EmployeeCardProps {
	employee: Employee;
	onOpen: (employee: Employee) => void;
	onEdit?: (employee: Employee) => void;
	onToggleStatus?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onOpen, onEdit, onToggleStatus }: EmployeeCardProps) {
	const hasActions = Boolean(onEdit || onToggleStatus);

	const formatTime = (time: string | null) => {
		if (!time) return "-";
		const hours = parseInt(time.slice(0, 2));
		const minutes = parseInt(time.slice(3, 5));
		const isPm = hours >= 12;
		const displayHours = isPm ? hours - 12 : hours;
		return `${displayHours < 10 ? `0${displayHours}` : displayHours}:${minutes < 10 ? `0${minutes}` : minutes}`.padStart(5, "0") + ` ${isPm ? "PM" : "AM"}`;
	};

	return (
		<Card
			className={cn("cursor-pointer transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", !employee.isActive && "opacity-60")}
			tabIndex={0}
			role="button"
			aria-label={`Open employee workspace for ${employee.name}`}
			onClick={(event) => {
				if (!(event.target instanceof Element) || !event.target.closest("[data-employee-card-action]")) onOpen(employee);
			}}
			onKeyDown={(event) => {
				if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
				event.preventDefault();
				onOpen(employee);
			}}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<Avatar className="h-12 w-12">
							<AvatarImage
								src={employee.avatar}
								alt={employee.name}
							/>
							<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="font-semibold">{employee.name}</h3>
							<p className="text-sm text-muted-foreground">{employee.email}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={employee.isActive ? "default" : "secondary"}>{employee.isActive ? "Active" : "Inactive"}</Badge>
						{hasActions && <DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									aria-label="Employee actions"
									data-employee-card-action
									onClick={(event) => event.stopPropagation()}
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{onEdit && (
									<DropdownMenuItem onClick={(event) => { event.stopPropagation(); onEdit(employee); }}>
										<Edit className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
								)}
								{onToggleStatus && (
									<DropdownMenuItem onClick={(event) => { event.stopPropagation(); onToggleStatus(employee); }}>
										{employee.isActive ? (
											<>
												<UserX className="h-4 w-4 mr-2" />
												Deactivate
											</>
										) : (
											<>
												<UserCheck className="h-4 w-4 mr-2" />
												Activate
											</>
										)}
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{employee.role && <Badge variant="outline">{getRoleLabel(employee.role)}</Badge>}

				<div className="flex flex-wrap items-center justify-between gap-3 text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Clock className="h-4 w-4" />
						<span>
							{formatTime(employee.workStartTime)} - {formatTime(employee.expectedClockOut)}
						</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>{employee.workHoursPerDay}h/day</span>
					</div>
				</div>

				<div className="text-sm text-muted-foreground pt-2 border-t">
					Grace: {employee.graceDaysRemaining}/{employee.graceDaysAllowed} days
				</div>

				{employee.skills && employee.skills.length > 0 && (
					<div className="flex flex-wrap gap-1 pt-2">
						{employee.skills.slice(0, 3).map((skill) => (
							<Badge
								key={skill}
								variant="secondary"
								className="text-xs"
							>
								{skill}
							</Badge>
						))}
						{employee.skills.length > 3 && (
							<Badge
								variant="secondary"
								className="text-xs"
							>
								+{employee.skills.length - 3}
							</Badge>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
