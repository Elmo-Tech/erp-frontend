"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { handleApiError } from "@/lib/errorHandling";
import { useEmployeeOverview, refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import { useHrAccess } from "../hooks/useHrAccess";
import { getCurrentPermissionMonth } from "../lib/short-permissions";
import { EmployeeAdvancesPanel } from "./EmployeeAdvancesDialog";
import { EmployeeDirectDeductionsPanel } from "./EmployeeDirectDeductionsDialog";
import { EmployeeLateDeductionsPanel } from "./EmployeeLateDeductionsDialog";
import { EmployeeOvertimeRequestsPanel } from "./EmployeeOvertimeRequestsDialog";
import { EmployeeHrStats, formatHrMoney } from "./EmployeeHrSummary";
import type { EmployeeMoneyPanelProps } from "./EmployeeMoneyPanel";
import { EmployeeSalaryEditor } from "./EmployeeSalaryEditor";

export function EmployeeFinancialPanel(props: EmployeeMoneyPanelProps) {
	const access = useHrAccess();
	const [month, setMonth] = useState(getCurrentPermissionMonth);
	const [dialog, setDialog] = useState<"late" | "overtime" | null>(null);
	const query = useEmployeeOverview(props.employeeId, month, props.isActive && access.overview);
	const client = useQueryClient();
	const data = query.data;
	const salary = data?.salaryPeriod;
	return <div className="min-w-0 space-y-5">
		<div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-xl font-semibold">Salary &amp; advances</h2><Input type="month" aria-label="Salary summary month" className="w-44" value={month} onChange={(event) => setMonth(event.target.value)} /></div>
		{query.isError && <p role="alert" className="text-sm text-destructive">{handleApiError(query.error)}</p>}
		{access.can("manage_employee_salary") && data && <EmployeeSalaryEditor employeeId={props.employeeId} salary={data.salary} />}
		{access.overview && <EmployeeHrStats loading={query.isLoading} cards={data ? [{ label: "Gross salary", value: formatHrMoney(salary?.grossSalary ?? data.salary), detail: "From the employment contract" }, { label: "Salary additions", value: formatHrMoney(salary?.additions ?? data.additions), detail: "Approved additions" }, { label: "Total salary deductions", value: formatHrMoney(salary?.totalDeductions ?? data.deductions + data.advanceRecovery), detail: "Withdrawals and deductions" }, { label: "Net salary", value: formatHrMoney(salary?.netSalary), detail: "Gross salary + additions − deductions" }] : []} />}
		<div className="flex flex-wrap gap-2">{access.deductions && <Button variant="outline" onClick={() => setDialog("late")}>Late deductions</Button>}{access.overtime && <Button variant="outline" onClick={() => setDialog("overtime")}>Overtime</Button>}</div>
		{access.advances && <EmployeeAdvancesPanel {...props} canManage period={month} />}
		{access.deductions && <EmployeeDirectDeductionsPanel {...props} canManage period={month} />}
		<Dialog open={Boolean(dialog)} onOpenChange={(open) => { if (!open) { setDialog(null); void refreshEmployeeHr(client, props.employeeId); } }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{dialog === "late" ? "Late deductions" : "Overtime"}</DialogTitle><DialogDescription>{props.employeeName}</DialogDescription></DialogHeader>{dialog === "late" && access.deductions && <EmployeeLateDeductionsPanel {...props} canManage isActive />}{dialog === "overtime" && access.overtime && <EmployeeOvertimeRequestsPanel {...props} canManage isActive />}</DialogContent></Dialog>
	</div>;
}
