"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BanknoteArrowDown, Clock, Clock3, MoreVertical, Calendar, CalendarDays, CircleDollarSign, Edit, FileText, Timer, UserX, UserCheck, WalletCards } from "lucide-react";
import type { Employee } from "../types";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/config/simplification";

interface EmployeeCardProps {
	employee: Employee;
	onEdit?: (employee: Employee) => void;
	onToggleStatus?: (employee: Employee) => void;
	onManageContracts?: (employee: Employee) => void;
	onManageLeaves?: (employee: Employee) => void;
	onManageShortPermissions?: (employee: Employee) => void;
	onManageOvertimeRequests?: (employee: Employee) => void;
	onManageDirectDeductions?: (employee: Employee) => void;
	onManageAdvances?: (employee: Employee) => void;
	onManagePartialPays?: (employee: Employee) => void;
	onManageLateDeductions?: (employee: Employee) => void;
	onManageDocuments?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onEdit, onToggleStatus, onManageContracts, onManageLeaves, onManageShortPermissions, onManageOvertimeRequests, onManageDirectDeductions, onManageAdvances, onManagePartialPays, onManageLateDeductions, onManageDocuments }: EmployeeCardProps) {
	const hasActions = Boolean(
		onEdit ||
			onToggleStatus ||
			onManageContracts ||
			onManageLeaves ||
			onManageShortPermissions ||
			onManageOvertimeRequests ||
			onManageDirectDeductions ||
			onManageAdvances ||
			onManagePartialPays ||
			onManageLateDeductions ||
			onManageDocuments
	);

	const formatTime = (time: string | null) => {
		if (!time) return "-";
		const hours = parseInt(time.slice(0, 2));
		const minutes = parseInt(time.slice(3, 5));
		const isPm = hours >= 12;
		const displayHours = isPm ? hours - 12 : hours;
		return `${displayHours < 10 ? `0${displayHours}` : displayHours}:${minutes < 10 ? `0${minutes}` : minutes}`.padStart(5, "0") + ` ${isPm ? "PM" : "AM"}`;
	};

	return (
		<Card className={cn("transition-all hover:shadow-md", !employee.isActive && "opacity-60")}>
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
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{onEdit && (
									<DropdownMenuItem onClick={() => onEdit(employee)}>
										<Edit className="h-4 w-4 mr-2" />
										Edit
									</DropdownMenuItem>
								)}
								{onManageContracts && (
									<DropdownMenuItem onClick={() => onManageContracts(employee)}>
										<FileText className="h-4 w-4 mr-2" />
										Contracts
									</DropdownMenuItem>
								)}
								{onManageLeaves && (
									<DropdownMenuItem onClick={() => onManageLeaves(employee)}>
									<CalendarDays className="h-4 w-4 mr-2" />
									Leave requests
								</DropdownMenuItem>
							)}
								{onManageShortPermissions && (
									<DropdownMenuItem onClick={() => onManageShortPermissions(employee)}>
										<Clock3 className="h-4 w-4 mr-2" />
										Short permissions
									</DropdownMenuItem>
								)}
								{onManageOvertimeRequests && (
									<DropdownMenuItem onClick={() => onManageOvertimeRequests(employee)}>
										<Timer className="h-4 w-4 mr-2" />
										Overtime
									</DropdownMenuItem>
								)}
								{onManageDirectDeductions && (
									<DropdownMenuItem onClick={() => onManageDirectDeductions(employee)}>
										<BanknoteArrowDown className="h-4 w-4 mr-2" />
										Direct deductions
									</DropdownMenuItem>
								)}
								{onManageAdvances && (
									<DropdownMenuItem onClick={() => onManageAdvances(employee)}>
										<CircleDollarSign className="h-4 w-4 mr-2" />
										Advances
									</DropdownMenuItem>
								)}
								{onManagePartialPays && (
									<DropdownMenuItem onClick={() => onManagePartialPays(employee)}>
										<WalletCards className="h-4 w-4 mr-2" />
										Partial pay
									</DropdownMenuItem>
								)}
								{onManageLateDeductions && (
									<DropdownMenuItem onClick={() => onManageLateDeductions(employee)}>
										<Clock className="h-4 w-4 mr-2" />
										Late deductions
									</DropdownMenuItem>
								)}
								{onManageDocuments && (
									<DropdownMenuItem onClick={() => onManageDocuments(employee)}>
										<FileText className="h-4 w-4 mr-2" />
										Documents
									</DropdownMenuItem>
								)}
								{onToggleStatus && (
									<DropdownMenuItem onClick={() => onToggleStatus(employee)}>
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
