"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { refreshEmployeeHr } from "../hooks/useEmployeeOverview";
import { employeeKeys } from "../hooks/useEmployees";
import { employmentContractKeys } from "../hooks/useEmploymentContracts";

export function EmployeeSalaryEditor({ employeeId, salary }: { employeeId: number; salary: number | null }) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState(String(salary ?? 0));
	const client = useQueryClient();
	const mutation = useMutation({
		mutationFn: () => api.put(`/employees/${employeeId}/salary`, { baseSalary: Number(amount) }),
		onSuccess: async () => {
			await Promise.all([refreshEmployeeHr(client, employeeId), client.invalidateQueries({ queryKey: employeeKeys.all }), client.invalidateQueries({ queryKey: employmentContractKeys.list(employeeId) })]);
			setOpen(false);
		},
	});
	return <><Button variant="outline" onClick={() => { setAmount(String(salary ?? 0)); mutation.reset(); setOpen(true); }}>Edit base salary</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Edit current salary</DialogTitle><DialogDescription>Updates the active employment contract and the employee’s operational salary together. Previously approved financial records keep their saved values.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}><label className="text-sm">Monthly base salary (EGP)<Input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>{mutation.isError && <p role="alert" className="text-sm text-destructive">{handleApiError(mutation.error)}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending || amount === ""}>Save salary</Button></DialogFooter></form></DialogContent></Dialog></>;
}
