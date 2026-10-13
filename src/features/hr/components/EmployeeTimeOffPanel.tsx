"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleApiError } from "@/lib/errorHandling";
import { useEmployeeOverview, refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import { useEmployeeLeaves } from "../hooks/useEmployeeLeaves";
import { useEmployeeShortPermissions } from "../hooks/useEmployeeShortPermissions";
import { formatPermissionDuration, getCurrentPermissionMonth, isValidPermissionMonth } from "../lib/short-permissions";
import { EmployeeAttendancePanel } from "./EmployeeAttendancePanel";
import { EmployeeLeavesPanel } from "./EmployeeLeavesDialog";
import { EmployeeShortPermissionsPanel } from "./EmployeeShortPermissionsDialog";
import { EmployeeHrStats, EmployeeTimeOffBalances } from "./EmployeeHrSummary";
import type { EmployeeMoneyPanelProps } from "./EmployeeMoneyPanel";

export function EmployeeTimeOffPanel(props: EmployeeMoneyPanelProps) {
	const [month, setMonth] = useState(getCurrentPermissionMonth);
	const [dialog, setDialog] = useState<"attendance" | "leave" | "permission" | null>(null);
	const query = useEmployeeOverview(props.employeeId, month, props.isActive && props.canManage);
	const leaves = useEmployeeLeaves(props.employeeId, Number(month.slice(0, 4)), props.isActive && props.canManage && isValidPermissionMonth(month));
	const permissions = useEmployeeShortPermissions(props.employeeId, month, props.isActive && props.canManage && isValidPermissionMonth(month));
	const client = useQueryClient();
	const data = query.data;
	const monthEnd = `${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate()}`;
	const history = [
		...(leaves.data?.leaves ?? []).filter((leave) => leave.startDate <= monthEnd && leave.endDate >= `${month}-01`).map((leave) => ({ id: `leave-${leave.id}`, date: leave.startDate, label: leave.leaveType.name, duration: `${leave.workingDays} days`, pay: leave.isPaid ? "Paid" : "Unpaid", status: leave.status })),
		...(permissions.data?.permissions ?? []).map((permission) => ({ id: `permission-${permission.id}`, date: permission.permissionDate, label: "Short permission", duration: formatPermissionDuration(permission.durationMinutes), pay: permission.isPaid === null ? "Pending" : permission.isPaid ? "Paid" : "Unpaid", status: permission.status })),
	].sort((a, b) => b.date.localeCompare(a.date));
	return <div className="min-w-0 space-y-5">
		<div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight">Attendance &amp; time off</h2><p className="mt-1 text-sm text-muted-foreground">Monthly statistics, balances and a clean daily log.</p></div><Input type="month" aria-label="Attendance summary month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" /></div>
		{query.isError && <div role="alert" className="rounded-xl border border-destructive p-4 text-sm"><p>{handleApiError(query.error)}</p><Button variant="outline" size="sm" className="mt-2" onClick={() => query.refetch()}>Try again</Button></div>}
		<EmployeeHrStats loading={query.isLoading} cards={data ? [{ label: "Attendance days", value: `${data.attendance.days} days`, detail: `${data.attendance.lateDays} late days` }, { label: data.workCommitment?.hasPartTimeTarget ? "Monthly work target" : "Tracked work", value: `${formatPermissionDuration(data.workCommitment?.workedMinutes ?? data.attendance.workedMinutes)}${data.workCommitment?.hasPartTimeTarget ? ` / ${formatPermissionDuration(data.workCommitment.requiredMinutes)}` : ""}`, detail: data.workCommitment?.requiredMonthlyHours ? `${data.workCommitment.completionPercentage}% of the period target · ${data.workCommitment.requiredMonthlyHours} hours per full month` : "Recorded work sessions this month", progress: data.workCommitment?.hasPartTimeTarget ? data.workCommitment.completionPercentage : undefined }, { label: "Approved leave", value: `${data.leaveDays} days`, detail: "Approved time off in the selected month" }, { label: "Paid permissions", value: formatPermissionDuration(data.permissions.remainingMinutes), detail: `${formatPermissionDuration(data.permissions.paidUsedMinutes)} used this month` }] : []} />
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4"><div><h3 className="text-sm font-medium">Everything in its place.</h3><p className="mt-1 text-xs text-muted-foreground">Open a dialog to add or manage a record.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setDialog("attendance")}><CalendarDays />Attendance</Button><Button size="sm" variant="outline" onClick={() => setDialog("leave")}><Plus />Leave</Button><Button size="sm" variant="outline" onClick={() => setDialog("permission")}><Clock3 />Short permissions</Button></div></div>
		<div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]"><div className="min-w-0 space-y-5"><section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"><h3 className="mb-4 font-semibold">Attendance records</h3><EmployeeAttendancePanel {...props} month={month} /></section><section className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"><h3 className="mb-4 font-semibold">Leave &amp; permission history</h3>{leaves.isLoading || permissions.isLoading ? <p className="text-sm text-muted-foreground">Loading time off…</p> : leaves.isError || permissions.isError ? <div role="alert"><p className="text-sm text-destructive">{handleApiError(leaves.error ?? permissions.error)}</p><Button size="sm" variant="outline" className="mt-2" onClick={() => { void leaves.refetch(); void permissions.refetch(); }}>Try again</Button></div> : history.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr>{["Date", "Record", "Duration", "Payment", "Status"].map((label) => <th className="px-3 py-2 font-medium" key={label}>{label}</th>)}</tr></thead><tbody>{history.map((row) => <tr key={row.id} className="border-t"><td className="whitespace-nowrap px-3 py-3">{row.date}</td><td className="px-3 py-3">{row.label}</td><td className="whitespace-nowrap px-3 py-3">{row.duration}</td><td className="px-3 py-3">{row.pay}</td><td className="px-3 py-3"><Badge variant={row.status === "approved" ? "outline" : "secondary"}>{row.status}</Badge></td></tr>)}</tbody></table></div> : <p className="py-5 text-sm text-muted-foreground">No leave or permissions for this month.</p>}</section></div><EmployeeTimeOffBalances data={data} /></div>
		<Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) { setDialog(null); void refreshEmployeeHr(client, props.employeeId); } }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{dialog === "attendance" ? "Attendance details" : dialog === "leave" ? "Leave management" : "Short permissions"}</DialogTitle><DialogDescription>{props.employeeName} · Manage records while keeping the monthly overview in view.</DialogDescription></DialogHeader>{dialog === "attendance" && <EmployeeAttendancePanel {...props} isActive month={month} />}{dialog === "leave" && <EmployeeLeavesPanel {...props} isActive />}{dialog === "permission" && <EmployeeShortPermissionsPanel {...props} isActive initialMonth={month} />}</DialogContent></Dialog>
	</div>;
}
