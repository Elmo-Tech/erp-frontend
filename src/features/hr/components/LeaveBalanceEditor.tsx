"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { leaveManagementApi } from "../api/leave-management";
import { employeeLeaveKeys } from "../hooks/useEmployeeLeaves";
import { refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import type { LeaveBalance } from "../types/leave-management";

export function LeaveBalanceEditor({ employeeId, year, balance }: { employeeId: number; year: number; balance: LeaveBalance }) {
	const [editing, setEditing] = useState(false);
	const [days, setDays] = useState(String(balance.allocatedDays));
	const client = useQueryClient();
	const save = useMutation({
		mutationFn: (useDefault: boolean) => leaveManagementApi.updateBalance(employeeId, balance.leaveTypeId, { year, useDefault, allocatedDays: Number(days) }),
		onSuccess: async () => {
			await Promise.all([client.invalidateQueries({ queryKey: employeeLeaveKeys.employee(employeeId) }), refreshEmployeeHr(client, employeeId)]);
			setEditing(false);
		},
	});
	return <div className="mt-3 space-y-2">
		<p className="text-xs text-muted-foreground">{balance.isCustom ? "Custom employee allocation" : "Company default"}{balance.overdrawnDays ? ` · ${balance.overdrawnDays} days above allocation` : ""}</p>
		{editing ? <div className="space-y-2"><label className="text-sm">Total allocation (used days stay unchanged)<Input type="number" min="0" max="366" step="0.5" value={days} onChange={(event) => setDays(event.target.value)} /></label><div className="flex flex-wrap gap-2"><Button size="sm" disabled={save.isPending || days === "" || !Number.isFinite(Number(days)) || Number(days) < 0 || Number(days) > 366} onClick={() => save.mutate(false)}>Save allocation</Button><Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Close</Button></div></div> : <Button size="sm" variant="outline" onClick={() => { setDays(String(balance.allocatedDays)); setEditing(true); }}>Edit allocation</Button>}
		{balance.isCustom && <Button size="sm" variant="ghost" disabled={save.isPending} onClick={() => save.mutate(true)}>Use company default</Button>}
		{save.isError && <p role="alert" className="text-sm text-destructive">Unable to save allocation. Please try again.</p>}
	</div>;
}
