"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEmployeeLeaves } from "../hooks/useEmployeeLeaves";
import { LeaveBalanceEditor } from "./LeaveBalanceEditor";

export function LeaveBalanceDialog({ employeeId, employeeName, open, onOpenChange }: { employeeId: number; employeeName: string; open: boolean; onOpenChange: (open: boolean) => void }) {
	const [year, setYear] = useState(String(new Date().getFullYear()));
	const validYear = /^\d{4}$/.test(year) && Number(year) >= 2000 && Number(year) <= 2100;
	const query = useEmployeeLeaves(employeeId, Number(year), open && validYear);

	return <Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
			<DialogHeader><DialogTitle>Adjust leave balances</DialogTitle><DialogDescription>{employeeName} · Set the total allowance for each leave type. Used days remain unchanged.</DialogDescription></DialogHeader>
			<label className="block max-w-40 space-y-1 text-sm font-medium">Balance year<Input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} /></label>
			{!validYear ? <p role="alert" className="text-sm text-destructive">Enter a year between 2000 and 2100.</p> : query.isLoading ? <p className="text-sm text-muted-foreground">Loading balances…</p> : query.isError ? <div role="alert" className="space-y-2 text-sm text-destructive"><p>Could not load leave balances.</p><Button variant="outline" size="sm" onClick={() => query.refetch()}>Try again</Button></div> : query.data?.balances.length ? <div className="space-y-3">{query.data.balances.map((balance) => <section key={`${year}-${balance.leaveTypeId}`} className="rounded-lg border p-4"><h3 className="font-semibold">{balance.leaveType.name}</h3><p className="mt-1 text-sm text-muted-foreground">{balance.remainingDays} remaining · {balance.usedDays} used · {balance.allocatedDays} total days</p><LeaveBalanceEditor employeeId={employeeId} year={Number(year)} balance={balance} /></section>)}</div> : <p className="text-sm text-muted-foreground">No leave types available for this year.</p>}
		</DialogContent>
	</Dialog>;
}
