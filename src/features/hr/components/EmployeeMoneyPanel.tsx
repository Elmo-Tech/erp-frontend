"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { handleApiError, notifyApiError } from "@/lib/errorHandling";
import { useAuthStore } from "@/store/authStore";
import { employeeAdvancesApi } from "../api/employee-advances";
import { directEmployeeDeductionsApi } from "../api/direct-employee-deductions";
import { employeeAdvanceKeys, useEmployeeAdvances } from "../hooks/useEmployeeAdvances";
import { directEmployeeDeductionKeys, useEmployeeDirectDeductions } from "../hooks/useDirectEmployeeDeductions";
import { refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import { useHrAccess } from "../hooks/useHrAccess";
import { getCurrentPermissionMonth, isValidPermissionMonth } from "../lib/short-permissions";
import { isValidEmployeeAdvanceAmount } from "../lib/employee-advances";

export interface EmployeeMoneyPanelProps {
	employeeId: number;
	employeeName: string;
	canManage: boolean;
	isActive: boolean;
	period?: string;
}

function localDateTime() {
	const now = new Date();
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
const money = (value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`;
const time = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function EmployeeMoneyPanel({ employeeId, employeeName, isActive, period, mode }: EmployeeMoneyPanelProps & { mode: "withdrawal" | "deduction" }) {
	const access = useHrAccess();
	const resource = mode === "withdrawal" ? "employee_advances" : "deductions";
	const [ownPeriod, setPeriod] = useState(getCurrentPermissionMonth);
	const month = period ?? ownPeriod;
	const [year, monthNumber] = month.split("-").map(Number);
	const enabled = isActive && access.view(resource) && isValidPermissionMonth(month);
	const advances = useEmployeeAdvances(employeeId, year, monthNumber, enabled && mode === "withdrawal");
	const deductions = useEmployeeDirectDeductions(employeeId, year, monthNumber, enabled && mode === "deduction");
	const query = mode === "withdrawal" ? advances : deductions;
	const client = useQueryClient();
	const role = useAuthStore((state) => state.role);
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const autoApprove = (role === "admin" || role === "super-admin") && access.action(resource, "approve");
	const canReview = employeeId !== currentUserId;
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [occurredAt, setOccurredAt] = useState(localDateTime);
	const [reason, setReason] = useState("");
	const [formError, setError] = useState<string | null>(null);
	const [review, setReview] = useState<{ id: number; action: "approve" | "reject" | "disburse" | "settle" } | null>(null);
	const [reviewNote, setReviewNote] = useState("");
	const refresh = () => Promise.all([
		client.invalidateQueries({ queryKey: mode === "withdrawal" ? employeeAdvanceKeys.employee(employeeId) : directEmployeeDeductionKeys.employee(employeeId) }),
		refreshEmployeeHr(client, employeeId),
	]);
	const create = useMutation({
		mutationFn: async () => {
			const date = new Date(occurredAt).toISOString();
			return mode === "withdrawal"
				? employeeAdvancesApi.createEmployeeAdvance(employeeId, { requestedAmount: Number(amount), reason: reason.trim(), installmentCount: 1, withdrawalDate: date })
				: directEmployeeDeductionsApi.createEmployeeDirectDeduction(employeeId, { amount: Number(amount), reason: reason.trim(), deductionDate: occurredAt.slice(0, 10), occurredAt: date });
		},
		// These financial endpoints return bare data, without an interceptor success message.
		onSuccess: async (record) => { await refresh(); setOpen(false); setAmount(""); setReason(""); toast.success(record.status === "pending" ? "Submitted for review" : "Saved and deducted from salary"); },
		onError: (error) => setError(handleApiError(error)),
	});
	const action = useMutation({
		mutationFn: async () => {
			if (!review) return;
			if (mode === "withdrawal") {
				if (review.action === "approve") return employeeAdvancesApi.approveEmployeeAdvance(review.id, { reviewNote });
				if (review.action === "reject") return employeeAdvancesApi.rejectEmployeeAdvance(review.id, { reviewNote });
				if (review.action === "disburse") return employeeAdvancesApi.disburseEmployeeAdvance(review.id);
				return employeeAdvancesApi.settleEmployeeAdvanceSettlement(review.id);
			}
			if (review.action === "approve") return directEmployeeDeductionsApi.approveEmployeeDirectDeduction(review.id, { reviewNote });
			return directEmployeeDeductionsApi.rejectEmployeeDirectDeduction(review.id, { reviewNote });
		},
		onSuccess: async () => { await refresh(); setReview(null); setReviewNote(""); toast.success("Record updated"); },
		onError: notifyApiError,
	});
	const rows = mode === "withdrawal"
		? (advances.data?.advances ?? []).map((record) => ({ id: record.id, at: record.disbursedAt ?? record.createdAt, amount: record.disbursedAmount ?? record.requestedAmount, reason: record.reason, status: record.status, approvedAt: record.approvedAt, isWithdrawal: record.isSalaryWithdrawal, settlements: record.settlements }))
		: (deductions.data?.deductions ?? []).map((record) => ({ id: record.id, at: record.occurredAt ?? `${record.deductionDate}T00:00:00`, amount: record.amount, reason: record.reason, status: record.status, approvedAt: record.approvedAt, isWithdrawal: false, settlements: [] }));
	if (!access.view(resource)) return null;
	const title = mode === "withdrawal" ? "Salary withdrawals & advances" : "Direct deductions";
	const label = mode === "withdrawal" ? "Record withdrawal" : "Add deduction";
	return <section className="min-w-0 space-y-4 rounded-xl border bg-card p-4 sm:p-5">
		<div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">A complete record of amounts, exact dates, reasons and decisions.</p></div><div className="flex flex-wrap gap-2">
			{!period && <Input aria-label={`${title} month`} type="month" value={month} onChange={(event) => setPeriod(event.target.value)} className="w-40" />}
			{access.action(resource, "create") && <Button size="sm" onClick={() => { setOccurredAt(localDateTime()); setError(null); setOpen(true); }}>{label}</Button>}
		</div></div>
		{query.isLoading ? <p>Loading records…</p> : query.isError ? <div role="alert"><p>{handleApiError(query.error)}</p><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></div> : !rows.length ? <p className="py-6 text-sm text-muted-foreground">No {mode === "withdrawal" ? "withdrawals" : "deductions"} in this month.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Exact date & time", "Amount", "Reason", "Status", "Actions"].map((text) => <th key={text} className="px-3 py-2">{text}</th>)}</tr></thead><tbody>
			{rows.map((row) => <tr key={row.id} className="border-t">
				<td className="whitespace-nowrap px-3 py-4">{time(row.at)}{row.approvedAt && <p className="text-xs text-muted-foreground">Approved {time(row.approvedAt)}</p>}</td>
				<td className="whitespace-nowrap px-3 py-4 font-semibold">−{money(row.amount)}</td><td className="px-3 py-4">{row.reason}</td><td className="px-3 py-4"><Badge variant={row.status === "pending" ? "secondary" : row.status === "rejected" ? "destructive" : "outline"}>{row.isWithdrawal && row.status === "settled" ? "Deducted from salary" : row.status}</Badge></td>
				<td className="px-3 py-4"><div className="flex flex-wrap gap-2">
					{canReview && row.status === "pending" && access.action(resource, "approve") && <Button size="sm" variant="outline" onClick={() => { setReviewNote(""); setReview({ id: row.id, action: "approve" }); }}>Approve</Button>}
					{canReview && row.status === "pending" && access.action(resource, "reject") && <Button size="sm" variant="ghost" onClick={() => { setReviewNote(""); setReview({ id: row.id, action: "reject" }); }}>Reject</Button>}
					{canReview && mode === "withdrawal" && row.status === "approved" && access.action(resource, "disburse") && <Button size="sm" variant="outline" onClick={() => setReview({ id: row.id, action: "disburse" })}>Disburse</Button>}
					{canReview && mode === "withdrawal" && access.action(resource, "settle") && row.settlements.filter((settlement) => settlement.status === "scheduled").map((settlement) => <Button key={settlement.id} size="sm" variant="outline" onClick={() => setReview({ id: settlement.id, action: "settle" })}>Settle {money(settlement.scheduledAmount)}</Button>)}
				</div></td>
			</tr>)}
		</tbody></table></div>}
		<Dialog open={open && access.action(resource, "create")} onOpenChange={(next) => { if (!create.isPending) setOpen(next); }}><DialogContent><DialogHeader><DialogTitle>{label}</DialogTitle><DialogDescription>{employeeName} · Amount, exact date and a short reason.</DialogDescription></DialogHeader>
			<form onSubmit={(event) => { event.preventDefault(); setError(null); const date = new Date(occurredAt); if (!isValidEmployeeAdvanceAmount(Number(amount)) || !reason.trim() || Number.isNaN(date.getTime()) || date > new Date()) { setError("Enter a positive amount (up to two decimals), a reason and a valid date that is not in the future."); return; } create.mutate(); }} className="space-y-4">
				{formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
				<Label htmlFor={`${mode}-amount`}>Amount (EGP)</Label><Input id={`${mode}-amount`} type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required disabled={create.isPending} />
				<Label htmlFor={`${mode}-date`}>Exact date &amp; time</Label><Input id={`${mode}-date`} type="datetime-local" max={localDateTime()} value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} required disabled={create.isPending} />
				<Label htmlFor={`${mode}-reason`}>Reason</Label><Textarea id={`${mode}-reason`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={2000} required disabled={create.isPending} />
				<p className="text-xs text-muted-foreground">{autoApprove ? "Approved automatically on save and deducted once from this month’s salary." : "Submitted for review; approval applies one salary deduction."}</p>
				<DialogFooter><Button type="button" variant="outline" disabled={create.isPending} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={create.isPending}>{autoApprove ? label : "Submit for review"}</Button></DialogFooter>
			</form>
		</DialogContent></Dialog>
		<Dialog open={Boolean(review) && !!review && access.action(resource, review.action)} onOpenChange={(next) => { if (!next && !action.isPending) setReview(null); }}><DialogContent><DialogHeader><DialogTitle>{review?.action === "reject" ? "Reject entry" : review?.action === "approve" ? "Approve entry" : "Apply historical advance action"}</DialogTitle><DialogDescription>{employeeName} · Update this record and retain its history.</DialogDescription></DialogHeader>
			<form className="space-y-4" onSubmit={(event) => { event.preventDefault(); action.mutate(); }}><Label htmlFor={`${mode}-review`}>Review note{review?.action === "reject" ? " (required)" : " (optional)"}</Label><Textarea id={`${mode}-review`} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} required={review?.action === "reject"} /><DialogFooter><Button type="button" variant="outline" onClick={() => setReview(null)} disabled={action.isPending}>Cancel</Button><Button type="submit" disabled={action.isPending}>Save decision</Button></DialogFooter></form>
		</DialogContent></Dialog>
	</section>;
}
