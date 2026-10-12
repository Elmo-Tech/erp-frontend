"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/lib/errorHandling";
import api from "@/lib/axios";
import type { Employee } from "../types";
import type { EmployeeOverview } from "../types/employee-overview";
import { formatPermissionDuration, getCurrentPermissionMonth, isValidPermissionMonth } from "../lib/short-permissions";
import { EmployeeSupervisionPanel } from "./EmployeeSupervisionPanel";

const money = (value: number | null) => value === null ? "Not set" : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function EmployeeOverviewPanel({ employee, canManage, isActive }: { employee: Employee; canManage: boolean; isActive: boolean }) {
	const [month, setMonth] = useState(getCurrentPermissionMonth);
	const query = useQuery({
		queryKey: ["employee-overview", employee.userId, month],
		queryFn: async () => (await api.get<{ data: EmployeeOverview }>(`/employees/${employee.userId}/overview`, { params: { month } })).data.data,
		enabled: isActive && canManage && isValidPermissionMonth(month),
		staleTime: 0,
	});
	const data = query.data;
	const cards = data ? [
		{ label: "Base salary", value: money(data.salary), detail: "Current employment terms" },
		{ label: "Advances paid", value: money(data.advancesDisbursed), detail: "Disbursed in the selected month" },
		{ label: "Outstanding advances", value: money(data.advancesOutstanding), detail: "All unpaid recoveries across months" },
		{ label: "Deductions", value: money(data.deductions), detail: "Direct, late, and unpaid-leave deductions" },
		{ label: "Salary additions", value: money(data.additions), detail: "Overtime and other recorded additions" },
		{ label: "Advance recovery", value: money(data.advanceRecovery), detail: `${money(data.scheduledRecovery)} still scheduled this month` },
		{ label: "Attendance days", value: String(data.attendance.days), detail: "Recorded in the selected month" },
		{ label: "Worked time", value: formatPermissionDuration(data.attendance.workedMinutes), detail: "Recorded attendance working time" },
		{ label: "Lateness", value: formatPermissionDuration(data.attendance.lateMinutes), detail: `${data.attendance.lateDays} late days` },
		{ label: "Leave days", value: String(data.leaveDays), detail: "Approved leaves starting this month" },
		{ label: "Short permissions", value: formatPermissionDuration(data.permissions.totalMinutes), detail: `${data.permissions.count} approved permissions` },
		{ label: "Paid permission balance", value: formatPermissionDuration(data.permissions.remainingMinutes), detail: `${formatPermissionDuration(data.permissions.paidUsedMinutes)} used of ${formatPermissionDuration(data.permissions.allocatedMinutes)}${data.permissions.overageMinutes ? ` · ${formatPermissionDuration(data.permissions.overageMinutes)} over allowance` : ""}` },
		{ label: "Overtime authorized", value: formatPermissionDuration(data.overtime.requestedMinutes), detail: "Registered overtime windows" },
		{ label: "Actual overtime", value: formatPermissionDuration(data.overtime.actualMinutes), detail: "All recorded time beyond scheduled clock-out" },
		{ label: "Payable overtime", value: formatPermissionDuration(data.overtime.approvedMinutes), detail: `${money(data.overtime.payableAmount)} payable` },
		{ label: "Unapproved overtime", value: formatPermissionDuration(data.overtime.unapprovedMinutes), detail: "Recorded extra time outside authorization" },
	] : [];

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold">Employee overview</h2>
					<p className="text-sm text-muted-foreground">Salary, advances, deductions, attendance, leave, and permissions at a glance.</p>
				</div>
				{canManage && (
					<div className="space-y-1">
						<label htmlFor="employee-overview-month" className="text-sm font-medium">Summary month</label>
						<Input id="employee-overview-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-44" />
					</div>
				)}
			</div>
			{canManage && (query.isLoading ? (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-28" />)}
				</div>
			) : query.isError ? (
				<div role="alert" className="rounded-lg border border-destructive p-4">
					<p>{handleApiError(query.error)}</p>
					<Button variant="outline" size="sm" onClick={() => query.refetch()}>Try again</Button>
				</div>
			) : (
				<>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{cards.map((card) => (
							<div key={card.label} className="rounded-lg border p-4">
								<p className="text-sm text-muted-foreground">{card.label}</p>
								<p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
								<p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
							</div>
						))}
					</div>
					<section className="space-y-3">
						<h3 className="font-semibold">Paid leave balances · {month.slice(0, 4)}</h3>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{data?.leaveBalances.map((balance) => (
								<div key={balance.name} className="rounded-lg border p-4">
									<p className="font-medium">{balance.name}</p>
									<p className="mt-2 text-xl font-semibold">{balance.remainingDays} days remaining</p>
									<p className="text-sm text-muted-foreground">{balance.usedDays} used of {balance.allocatedDays}</p>
								</div>
							))}
						</div>
					</section>
				</>
			))}
			<section className="space-y-3">
				<h3 className="font-semibold">Work schedule</h3>
				<p className="text-sm text-muted-foreground">{employee.workStartTime?.slice(0, 5) ?? "Not set"} – {employee.expectedClockOut?.slice(0, 5) ?? "Not set"} · {employee.workHoursPerDay} hours/day</p>
			</section>
			<section className="space-y-3">
				<h3 className="font-semibold">Skills</h3>
				{employee.skills.length ? (
					<div className="flex flex-wrap gap-2">{employee.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>
				) : <p className="text-sm text-muted-foreground">No skills recorded.</p>}
			</section>
			{canManage && (
				<section className="space-y-3 border-t pt-5">
					<h3 className="font-semibold">Supervision</h3>
					<EmployeeSupervisionPanel employeeId={employee.userId} employeeName={employee.name} canManage={canManage} isActive={isActive} />
				</section>
			)}
		</div>
	);
}
