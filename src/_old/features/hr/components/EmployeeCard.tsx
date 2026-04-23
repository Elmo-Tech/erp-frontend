"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Clock, MoreVertical, Star, Calendar, DollarSign, Edit, UserX, UserCheck, BarChart3 } from "lucide-react";
import type { Employee } from "../types";
import { cn } from "@/shared/lib/utils";

interface EmployeeCardProps {
	employee: Employee;
	onEdit?: (employee: Employee) => void;
	onToggleStatus?: (employee: Employee) => void;
	onViewPerformance?: (employee: Employee) => void;
	showSalary?: boolean;
}

export function EmployeeCard({ employee, onEdit, onToggleStatus, onViewPerformance, showSalary = false }: EmployeeCardProps) {
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
						<DropdownMenu>
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
								{onViewPerformance && (
									<DropdownMenuItem onClick={() => onViewPerformance(employee)}>
										<BarChart3 className="h-4 w-4 mr-2" />
										Performance
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
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{employee.role && <Badge variant="outline">{employee.role}</Badge>}

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

				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2">
						<Star className="h-4 w-4 text-yellow-500" />
						<span className="font-medium">{employee.totalPoints} pts</span>
					</div>
					<div className="text-sm text-muted-foreground">
						Grace: {employee.graceDaysRemaining}/{employee.graceDaysAllowed} days
					</div>
				</div>

				{showSalary && employee.salary !== null && (
					<div className="flex items-center justify-between pt-2 border-t">
						<div className="flex items-center gap-2 text-muted-foreground">
							<DollarSign className="h-4 w-4" />
							<span>Salary: {employee.salary.toLocaleString()}</span>
						</div>
						{employee.totalDeductions !== null && employee.totalDeductions > 0 && <span className="text-sm text-red-500">-{employee.totalDeductions.toLocaleString()} deductions</span>}
					</div>
				)}

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
