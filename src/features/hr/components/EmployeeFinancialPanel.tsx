"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock3, TimerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleApiError } from "@/lib/errorHandling";
import { useEmployeeOverview, refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import { getCurrentPermissionMonth } from "../lib/short-permissions";
import { EmployeeAdvancesPanel } from "./EmployeeAdvancesDialog";
import { EmployeeDirectDeductionsPanel } from "./EmployeeDirectDeductionsDialog";
import { EmployeeLateDeductionsPanel } from "./EmployeeLateDeductionsDialog";
import { EmployeeOvertimeRequestsPanel } from "./EmployeeOvertimeRequestsDialog";
import { EmployeeHrStats, formatHrMoney } from "./EmployeeHrSummary";
import type { EmployeeMoneyPanelProps } from "./EmployeeMoneyPanel";

export function EmployeeFinancialPanel(props: EmployeeMoneyPanelProps) {
	const [month, setMonth] = useState(getCurrentPermissionMonth);
	const [dialog, setDialog] = useState<"late" | "overtime" | null>(null);
	const query = useEmployeeOverview(props.employeeId, month, props.isActive && props.canManage);
	const client = useQueryClient();
	const data = query.data;
	const salary = data?.salaryPeriod;
	return <div className="min-w-0 space-y-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight">Salary &amp; advances</h2><p className="mt-1 text-sm text-muted-foreground">Clear salary totals and a complete record of withdrawals and deductions.</p></div><Input type="month" aria-label="Salary summary month" className="w-44" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
		{query.isError && <div role="alert" className="rounded-xl border border-destructive p-4 text-sm"><p>{handleApiError(query.error)}</p><Button variant="outline" size="sm" className="mt-2" onClick={() => query.refetch()}>Try again</Button></div>}
		<EmployeeHrStats loading={query.isLoading} cards={data ? [{ label: "Gross salary", value: formatHrMoney(salary?.grossSalary ?? data.salary), detail: salary ? `${salary.serviceDays} of ${salary.calendarDays} calendar days this month` : "From the employment contract" }, { label: "Salary additions", value: formatHrMoney(salary?.additions ?? data.additions), detail: "Approved overtime and other additions" }, { label: "Total salary deductions", value: formatHrMoney(salary?.totalDeductions ?? data.deductions + data.advanceRecovery), detail: "Withdrawals, direct deductions, lateness and unpaid leave" }, { label: "Net salary", value: formatHrMoney(salary?.netSalary), detail: "Gross salary + additions − deductions" }] : []} />
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4"><div><h3 className="text-sm font-medium">One amount. One clear record.</h3><p className="mt-1 text-xs text-muted-foreground">Administrative withdrawals and deductions are approved and applied immediately.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setDialog("late")}><TimerOff />Late deductions</Button><Button size="sm" variant="outline" onClick={() => setDialog("overtime")}><Clock3 />Overtime</Button></div></div>
		<EmployeeAdvancesPanel {...props} period={month} /><EmployeeDirectDeductionsPanel {...props} period={month} />
		<Dialog open={Boolean(dialog)} onOpenChange={(open) => { if (!open) { setDialog(null); void refreshEmployeeHr(client, props.employeeId); } }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{dialog === "late" ? "Late deductions" : "Overtime"}</DialogTitle><DialogDescription>{props.employeeName} · Review and manage salary adjustments.</DialogDescription></DialogHeader>{dialog === "late" && <EmployeeLateDeductionsPanel {...props} isActive />}{dialog === "overtime" && <EmployeeOvertimeRequestsPanel {...props} isActive />}</DialogContent></Dialog>
	</div>;
}
