"use client";

import type { ReactNode } from "react";
import { Badge } from "@/shared/ui/badge";
import { formatCurrency } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";
import type { Employee } from "../model/types";
import { EmployeeAvatar } from "./EmployeeAvatar";

interface EmployeeCardProps {
	employee: Employee;
	roleControl?: ReactNode;
	actions?: ReactNode;
	showCompensation?: boolean;
	className?: string;
}

function formatTime(time: string | null | undefined) {
	if (!time) {
		return "--";
	}

	const [hourValue, minuteValue] = time.split(":");
	const hour = Number(hourValue);
	const minute = Number(minuteValue);

	if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
		return "--";
	}

	const displayHour = hour % 12 || 12;
	const period = hour >= 12 ? "PM" : "AM";

	return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function EmployeeCard({ employee, roleControl, actions, showCompensation = false, className }: EmployeeCardProps) {
	const workWindow = `${formatTime(employee.workStartTime)} - ${formatTime(employee.expectedClockOut)}`;
	const statusLabel = employee.isActive ? "Active" : "Inactive";

	return (
		<article
			className={cn(
				"grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm last:border-b-0 md:grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.8fr)_minmax(130px,0.9fr)_90px_100px_120px_40px] md:items-center md:gap-3",
				!employee.isActive && "opacity-60",
				className
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<EmployeeAvatar
					name={employee.name}
					src={employee.avatar}
				/>
				<div className="min-w-0">
					<div className="truncate font-medium leading-5">{employee.name}</div>
					<div className="truncate text-xs text-muted-foreground">{employee.email}</div>
				</div>
			</div>

			<div>{roleControl ?? <Badge variant="outline">{employee.role || "No role"}</Badge>}</div>

			<div className="min-w-0">
				<div className="truncate text-xs text-muted-foreground">{employee.specialization || "General"}</div>
				<div className="truncate text-xs tabular-nums text-muted-foreground">{workWindow}</div>
			</div>

			<div>
				<Badge
					variant={employee.isActive ? "outline" : "secondary"}
					className="rounded-sm px-1.5 py-0 font-mono text-[11px] uppercase"
				>
					{statusLabel}
				</Badge>
			</div>

			<div className="text-xs tabular-nums text-muted-foreground">{employee.totalPoints ?? 0} pts</div>

			<div className="text-xs tabular-nums text-muted-foreground">
				{showCompensation && employee.salary !== null && employee.salary !== undefined ? formatCurrency(employee.salary, "USD") : `${employee.graceDaysRemaining ?? 0}/${employee.graceDaysAllowed ?? 0} grace`}
			</div>

			<div className="flex justify-end">{actions}</div>
		</article>
	);
}
