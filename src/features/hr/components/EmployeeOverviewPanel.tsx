"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError } from "@/lib/errorHandling";
import type { Employee } from "../types";
import { formatPermissionDuration, getCurrentPermissionMonth } from "../lib/short-permissions";
import { useEmployeeOverview } from "../hooks/useEmployeeOverview";
import { EmployeeWorkTarget, EmployeeTimeOffBalances } from "./EmployeeHrSummary";
import { EmployeeSupervisionPanel } from "./EmployeeSupervisionPanel";

const money = (value: number | null) => value === null ? "Not set" : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function EmployeeOverviewPanel({ employee, canManage, isActive }: { employee: Employee; canManage: boolean; isActive: boolean }) {
	const [month, setMonth] = useState(getCurrentPermissionMonth);
	const query = useEmployeeOverview(employee.userId, month, isActive && canManage);
	const data = query.data;
	const cards = data ? [
		{ label: "Gross salary", value: money(data.salaryPeriod?.grossSalary ?? data.salary), detail: data.salaryPeriod ? `${data.salaryPeriod.serviceDays} of ${data.salaryPeriod.calendarDays} days this month` : "Current employment terms" },
		{ label: "Net salary", value: data.salaryPeriod ? money(data.salaryPeriod.netSalary) : "Not set", detail: "Salary + additions − all deductions" },
		{ label: "Attendance days", value: String(data.attendance.days), detail: "Recorded in the selected month" },
		{ label: "Worked time", value: formatPermissionDuration(data.attendance.workedMinutes), detail: "Recorded attendance working time" },
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
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						{cards.map((card) => (
							<div key={card.label} className="rounded-xl border bg-card p-5">
								<p className="text-sm text-muted-foreground">{card.label}</p>
								<p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
								<p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
							</div>
						))}
					</div>
					<div className="grid items-start gap-5 xl:grid-cols-2"><div className="space-y-5"><EmployeeWorkTarget commitment={data?.workCommitment} /><section className="rounded-xl border bg-card p-5"><h3 className="font-semibold">Salary activity</h3><dl className="mt-4 grid gap-4 sm:grid-cols-2">{[{ label: "Withdrawals paid", value: money(data?.advancesDisbursed ?? 0) }, { label: "Total deductions", value: money((data?.deductions ?? 0) + (data?.advanceRecovery ?? 0)) }, { label: "Salary additions", value: money(data?.additions ?? 0) }, { label: "Historical advance balance", value: money(data?.advancesOutstanding ?? 0) }].map((item) => <div key={item.label}><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="mt-1 font-medium tabular-nums">{item.value}</dd></div>)}</dl></section><section className="rounded-xl border bg-card p-5"><h3 className="font-semibold">Attendance &amp; overtime</h3><dl className="mt-4 grid gap-4 sm:grid-cols-2">{[{ label: "Lateness", value: formatPermissionDuration(data?.attendance.lateMinutes ?? 0) }, { label: "Approved leave", value: `${data?.leaveDays ?? 0} days` }, { label: "Payable overtime", value: formatPermissionDuration(data?.overtime.approvedMinutes ?? 0) }, { label: "Unapproved overtime", value: formatPermissionDuration(data?.overtime.unapprovedMinutes ?? 0) }].map((item) => <div key={item.label}><dt className="text-xs text-muted-foreground">{item.label}</dt><dd className="mt-1 font-medium">{item.value}</dd></div>)}</dl></section></div><EmployeeTimeOffBalances data={data} /></div>
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
