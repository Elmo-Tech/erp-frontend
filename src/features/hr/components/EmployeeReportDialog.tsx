"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleApiError, notifyApiError } from "@/lib/errorHandling";
import { employeeHrReportApi } from "../api/employee-hr-report";
import { isValidContractDate } from "../lib/employment-contract";
import { formatPermissionDuration, getCurrentPermissionMonth } from "../lib/short-permissions";

export function EmployeeReportDialog({ employeeId, employeeName, open, onOpenChange }: { employeeId: number; employeeName: string; open: boolean; onOpenChange: (open: boolean) => void }) {
	const month = getCurrentPermissionMonth();
	const [dateFrom, setFrom] = useState(`${month}-01`);
	const [dateTo, setTo] = useState(`${month}-${new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate()}`);
	const [exporting, setExporting] = useState(false);
	const valid = isValidContractDate(dateFrom) && isValidContractDate(dateTo) && dateTo >= dateFrom;
	const query = useQuery({ queryKey: ["employee-hr-report", employeeId, dateFrom, dateTo], queryFn: () => employeeHrReportApi.get(employeeId, dateFrom, dateTo), enabled: open && valid });
	const download = async () => {
		setExporting(true);
		try { await employeeHrReportApi.download(employeeId, dateFrom, dateTo); }
		catch (error) { notifyApiError(error); }
		finally { setExporting(false); }
	};
	return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
		<DialogHeader><DialogTitle>Comprehensive employee report</DialogTitle><DialogDescription>{employeeName} · Contracts, work performance, attendance, time off, salary, documents and supervision.</DialogDescription></DialogHeader>
		<div className="flex flex-wrap items-end gap-3"><div className="space-y-1"><Label htmlFor="hr-report-from">From</Label><Input id="hr-report-from" type="date" value={dateFrom} onChange={(e) => setFrom(e.target.value)} /></div><div className="space-y-1"><Label htmlFor="hr-report-to">To</Label><Input id="hr-report-to" type="date" value={dateTo} onChange={(e) => setTo(e.target.value)} /></div><Button className="sm:ml-auto" disabled={!valid || !query.data || query.isFetching || exporting} onClick={() => void download()}>{exporting ? <Loader2 className="animate-spin" /> : <Download />}Export complete PDF</Button></div>
		{!valid && <p role="alert" className="text-sm text-destructive">Choose a valid date range, with the end on or after the start.</p>}
		{query.isLoading && <p className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading all employee records…</p>}
		{query.isError && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{handleApiError(query.error)}</p><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></div>}
		{valid && query.data && <>
			<div className="rounded-xl border bg-primary/5 p-4 text-sm"><p className="font-medium">Work commitment: {formatPermissionDuration(query.data.workCommitment.workedMinutes)} tracked / {formatPermissionDuration(query.data.workCommitment.requiredMinutes)} required · {query.data.workCommitment.completionPercentage ?? "—"}%</p><p className="mt-1 text-xs text-muted-foreground">Exact timestamps use {query.data.timezone}. Salary totals cover the payroll months in this range; each detail section shows its relevant records.</p></div>
			<section className="overflow-x-auto rounded-xl border"><table className="w-full whitespace-nowrap text-left text-sm"><thead className="bg-muted/50"><tr>{["Payroll month", "Service days", "Gross salary", "Additions", "Deductions", "Net salary"].map((label) => <th key={label} className="p-3 font-medium">{label}</th>)}</tr></thead><tbody>{query.data.salaryPeriods.map((salary) => <tr key={salary.month} className="border-t"><td className="p-3">{salary.month}</td><td className="p-3">{salary.serviceDays} / {salary.calendarDays}</td>{[salary.grossSalary, salary.additions, salary.totalDeductions, salary.netSalary].map((value, i) => <td key={i} className="p-3 tabular-nums">{value.toLocaleString(undefined, { minimumFractionDigits: 2 })} EGP</td>)}</tr>)}</tbody></table></section>
			<div className="space-y-2">{query.data.sections.map((section) => <details key={section.key} className="rounded-xl border"><summary className="cursor-pointer px-4 py-3 text-sm font-medium">{section.title}<span className="ml-2 text-muted-foreground">({section.rows.length})</span></summary>{section.rows.length ? <div className="max-h-96 overflow-auto border-t"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-muted"><tr><th className="p-3">Record</th>{Object.entries(section.columns).map(([key, label]) => <th className="whitespace-nowrap p-3" key={key}>{label}</th>)}</tr></thead><tbody>{section.rows.map((row) => <tr key={row.recordId} className="border-t"><td className="p-3">#{row.recordId}</td>{Object.keys(section.columns).map((key) => <td className="min-w-28 p-3" key={key}>{row[key] ?? "—"}</td>)}</tr>)}</tbody></table></div> : <p className="px-4 pb-4 text-sm text-muted-foreground">No records for this period.</p>}</details>)}</div>
		</>}
	</DialogContent></Dialog>;
}
