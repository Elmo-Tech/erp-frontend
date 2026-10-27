"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEmployeeOverview, refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import { useEmployeeLeaves } from "../hooks/useEmployeeLeaves";
import { useEmployeeShortPermissions } from "../hooks/useEmployeeShortPermissions";
import { useHrAccess } from "../hooks/useHrAccess";
import { formatPermissionDuration, getCurrentPermissionMonth, isValidPermissionMonth } from "../lib/short-permissions";
import { EmployeeAttendancePanel } from "./EmployeeAttendancePanel";
import { EmployeeLeavesPanel } from "./EmployeeLeavesDialog";
import { EmployeeShortPermissionsPanel } from "./EmployeeShortPermissionsDialog";
import { EmployeeHrStats, EmployeeTimeOffBalances } from "./EmployeeHrSummary";
import type { EmployeeMoneyPanelProps } from "./EmployeeMoneyPanel";

export function EmployeeTimeOffPanel(props: EmployeeMoneyPanelProps) {
	const access = useHrAccess();
	const [month, setMonth] = useState(getCurrentPermissionMonth);
	const [dialog, setDialog] = useState<"attendance" | "leave" | "permission" | null>(null);
	const query = useEmployeeOverview(props.employeeId, month, props.isActive && access.overview && isValidPermissionMonth(month));
	const leaves = useEmployeeLeaves(props.employeeId, Number(month.slice(0, 4)), props.isActive && access.leaves && isValidPermissionMonth(month));
	const permissions = useEmployeeShortPermissions(props.employeeId, month, props.isActive && access.permissions && isValidPermissionMonth(month));
	const client = useQueryClient();
	const data = query.data;
	const monthEnd = `${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate()}`;
	const history = [
		...(leaves.data?.leaves ?? []).filter((leave) => leave.status !== null && leave.startDate <= monthEnd && leave.endDate >= `${month}-01`).map((leave) => ({ id: `leave-${leave.id}`, date: leave.startDate, label: leave.leaveType.name, duration: `${leave.workingDays} days`, status: leave.status })),
		...(permissions.data?.permissions ?? []).map((permission) => ({ id: `permission-${permission.id}`, date: permission.permissionDate, label: "Short permission", duration: formatPermissionDuration(permission.durationMinutes), status: permission.status })),
	].sort((a, b) => b.date.localeCompare(a.date));
	return <div className="min-w-0 space-y-5">
		<div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-xl font-semibold">Attendance &amp; time off</h2><Input type="month" aria-label="Attendance summary month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-44" /></div>
		{access.overview && <EmployeeHrStats loading={query.isLoading} cards={data ? [
			{ label: "Attendance days", value: `${data.attendance.days} days`, detail: `${data.attendance.lateDays} late days` },
			{ label: data.workCommitment?.hasPartTimeTarget ? "Monthly work target" : "Tracked work", value: `${formatPermissionDuration(data.workCommitment?.workedMinutes ?? data.attendance.workedMinutes)}${data.workCommitment?.hasPartTimeTarget ? ` / ${formatPermissionDuration(data.workCommitment.requiredMinutes)}` : ""}`, detail: data.workCommitment?.requiredMonthlyHours ? `${data.workCommitment.completionPercentage}% of the period target · ${data.workCommitment.requiredMonthlyHours} hours per full month` : "Recorded work sessions this month", progress: data.workCommitment?.hasPartTimeTarget ? data.workCommitment.completionPercentage : undefined },
			{ label: "Approved leave", value: `${data.leaveDays} days`, detail: "Approved time off this month" },
			{ label: "Paid permissions", value: formatPermissionDuration(data.permissions.remainingMinutes), detail: `${formatPermissionDuration(data.permissions.paidUsedMinutes)} used this month` },
		] : []} />}
		<div className="flex flex-wrap gap-2 rounded-xl border bg-muted/20 p-4">
			{access.attendance && <Button variant="outline" onClick={() => setDialog("attendance")}>Attendance</Button>}
			{access.leaves && <Button variant="outline" onClick={() => setDialog("leave")}>Leave</Button>}
			{access.permissions && <Button variant="outline" onClick={() => setDialog("permission")}>Short permissions</Button>}
		</div>
		{access.attendance && <section className="rounded-xl border p-4"><h3 className="mb-3 font-semibold">Attendance records</h3><EmployeeAttendancePanel {...props} month={month} /></section>}
		{(access.leaves || access.permissions) && <section className="rounded-xl border p-4"><h3 className="mb-3 font-semibold">Leave &amp; permission history</h3>
			{leaves.isError || permissions.isError ? <Button variant="outline" onClick={() => { if (access.leaves) void leaves.refetch(); if (access.permissions) void permissions.refetch(); }}>Retry history</Button> : history.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Date", "Record", "Duration", "Status"].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>{history.map((row) => <tr key={row.id} className="border-t"><td className="p-2">{row.date}</td><td className="p-2">{row.label}</td><td className="p-2">{row.duration}</td><td className="p-2"><Badge variant="outline">{row.status}</Badge></td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground">No records in this month.</p>}
		</section>}
		{data && <EmployeeTimeOffBalances data={data} />}
		<Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) { setDialog(null); void refreshEmployeeHr(client, props.employeeId); } }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{dialog === "attendance" ? "Attendance details" : dialog === "leave" ? "Leave management" : "Short permissions"}</DialogTitle><DialogDescription>{props.employeeName}</DialogDescription></DialogHeader>
			{dialog === "attendance" && access.attendance && <EmployeeAttendancePanel {...props} isActive month={month} />}
			{dialog === "leave" && access.leaves && <EmployeeLeavesPanel {...props} canManage isActive />}
			{dialog === "permission" && access.permissions && <EmployeeShortPermissionsPanel {...props} canManage isActive initialMonth={month} />}
		</DialogContent></Dialog>
	</div>;
}
