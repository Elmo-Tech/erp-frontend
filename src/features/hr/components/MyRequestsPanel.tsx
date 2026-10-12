"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandling";
import {
	useCancelEmployeeLeave,
	useCreateEmployeeLeave,
	useEmployeeLeaves,
	useLeaveTypes,
	useUpdateEmployeeLeave,
} from "@/features/hr/hooks/useEmployeeLeaves";
import {
	useCancelEmployeeShortPermission,
	useCreateEmployeeShortPermission,
	useEmployeeShortPermissions,
	useUpdateEmployeeShortPermission,
} from "@/features/hr/hooks/useEmployeeShortPermissions";
import {
	useCancelEmployeeOvertimeRequest,
	useCreateEmployeeOvertimeRequest,
	useEmployeeOvertimeRequests,
} from "@/features/hr/hooks/useEmployeeOvertimeRequests";
import {
	buildEmployeeLeavePayload,
	getDefaultLeaveRequestFormValues,
	leaveRequestSchema,
} from "@/features/hr/lib/leave-management";
import type { LeaveRequestFormValues } from "@/features/hr/types/leave-management";
import {
	buildEmployeeShortPermissionPayload,
	getDefaultShortPermissionRequestFormValues,
	shortPermissionRequestSchema,
} from "@/features/hr/lib/short-permissions";
import type { ShortPermissionRequestFormValues } from "@/features/hr/types/short-permissions";
import {
	buildEmployeeOvertimeRequestPayload,
	getDefaultOvertimeRequestFormValues,
	overtimeRequestSchema,
} from "@/features/hr/lib/overtime-requests";
import type { OvertimeRequestFormValues } from "@/features/hr/types/overtime-requests";

function useCurrentEmployeeId(): number {
	const user = useAuthStore((s) => s.user);
	const u = user as unknown as { id?: number; userId?: number } | null;
	return Number(u?.id ?? u?.userId ?? 0);
}

export function MyRequestsPanel() {
	const employeeId = useCurrentEmployeeId();
	const year = new Date().getFullYear();
	const month = `${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

	if (!employeeId) return <p className="text-sm text-muted-foreground">Sign in to see your requests.</p>;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">My requests</h1>
				<p className="text-sm text-muted-foreground">Submit leave, short permission, and overtime requests. Approval is done by your manager.</p>
			</div>
			<Tabs defaultValue="leaves" className="gap-6">
				<TabsList>
					<TabsTrigger value="leaves">Leaves</TabsTrigger>
					<TabsTrigger value="permissions">Short permissions</TabsTrigger>
					<TabsTrigger value="overtime">Overtime</TabsTrigger>
				</TabsList>
				<TabsContent value="leaves">
					<MyLeaves employeeId={employeeId} year={year} />
				</TabsContent>
				<TabsContent value="permissions">
					<MyPermissions employeeId={employeeId} month={month} />
				</TabsContent>
				<TabsContent value="overtime">
					<MyOvertime employeeId={employeeId} year={year} month={new Date().getMonth() + 1} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

function MyLeaves({ employeeId, year }: { employeeId: number; year: number }) {
	const leavesQuery = useEmployeeLeaves(employeeId, year, employeeId > 0);
	const leaveTypesQuery = useLeaveTypes(employeeId > 0);
	const createLeave = useCreateEmployeeLeave();
	const updateLeave = useUpdateEmployeeLeave();
	const cancelLeave = useCancelEmployeeLeave();
	const [editingId, setEditingId] = useState<number | null>(null);
	const form = useForm<LeaveRequestFormValues>({ resolver: zodResolver(leaveRequestSchema), mode: "onChange", defaultValues: getDefaultLeaveRequestFormValues() });
	const leaves = useMemo(() => leavesQuery.data?.leaves ?? [], [leavesQuery.data]);
	const balances = leavesQuery.data?.balances ?? [];

	const onSubmit = async (values: LeaveRequestFormValues) => {
		try {
			if (editingId) {
				await updateLeave.mutateAsync({ id: editingId, employeeId, payload: buildEmployeeLeavePayload(values) });
				// Success toast comes from the backend message via the axios interceptor.
			} else {
				await createLeave.mutateAsync({ employeeId, payload: buildEmployeeLeavePayload(values) });
				// Success toast comes from the backend message via the axios interceptor.
			}
			setEditingId(null);
			form.reset(getDefaultLeaveRequestFormValues());
		} catch (e) {
			toast.error(handleApiError(e));
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>My leaves {year}</CardTitle>
				<CardDescription>Pending requests can be edited. Approved requests must be cancelled and recreated.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-2">
					{balances.map((b) => (
						<span key={b.leaveTypeId} className="rounded-full bg-muted px-3 py-1 text-xs">
							{b.leaveType.name}: {b.remainingDays}/{b.allocatedDays} left
							{` · ${leaves.filter((leave) => leave.leaveTypeId === b.leaveTypeId && leave.status === "pending").reduce((days, leave) => days + leave.workingDays, 0)} working days awaiting approval`}
						</span>
					))}
				</div>
				<p className="text-sm text-muted-foreground">Balances deduct approved working days only. Pending requests do not consume leave balance until approval.</p>
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
					<select aria-label="Leave type" {...form.register("leaveTypeId")} className="rounded border px-2 py-2 text-sm">
						<option value="">Select type</option>
						{(leaveTypesQuery.data ?? []).map((t) => (
							<option key={t.id} value={String(t.id)}>{t.name}</option>
						))}
					</select>
					<input aria-label="Leave start date" type="date" {...form.register("startDate")} className="rounded border px-2 py-2 text-sm" />
					<input aria-label="Leave end date" type="date" {...form.register("endDate")} className="rounded border px-2 py-2 text-sm" />
					<input {...form.register("reason")} placeholder="Reason (optional)" className="rounded border px-2 py-2 text-sm" />
					<Button type="submit" disabled={createLeave.isPending || updateLeave.isPending}>{editingId ? "Update" : "Submit"}</Button>
				</form>
				<div className="space-y-2">
					{leaves.map((l) => (
						<div key={l.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
							<span>{l.startDate} → {l.endDate} · {l.status} · {l.workingDays}d</span>
							<span className="flex gap-2">
								{l.status === "pending" && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setEditingId(l.id);
											form.reset({ leaveTypeId: String(l.leaveTypeId), startDate: l.startDate, endDate: l.endDate, reason: l.reason ?? "" });
										}}
									>
										Edit
									</Button>
								)}
								{(l.status === "pending" || l.status === "approved") && (
									<Button
										size="sm"
										variant="ghost"
										onClick={async () => {
											try {
												await cancelLeave.mutateAsync({ id: l.id, employeeId });
												// Success toast comes from the backend message via the axios interceptor.
											} catch (e) {
												toast.error(handleApiError(e));
											}
										}}
									>
										Cancel
									</Button>
								)}
							</span>
						</div>
					))}
					{leaves.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
				</div>
			</CardContent>
		</Card>
	);
}

function MyPermissions({ employeeId, month }: { employeeId: number; month: string }) {
	const [selectedMonth, setSelectedMonth] = useState(month);
	const listQuery = useEmployeeShortPermissions(employeeId, selectedMonth, employeeId > 0);
	const createPerm = useCreateEmployeeShortPermission();
	const updatePerm = useUpdateEmployeeShortPermission();
	const cancelPerm = useCancelEmployeeShortPermission();
	const [editingId, setEditingId] = useState<number | null>(null);
	const form = useForm<ShortPermissionRequestFormValues>({ resolver: zodResolver(shortPermissionRequestSchema), mode: "onChange", defaultValues: getDefaultShortPermissionRequestFormValues() });
	const items = listQuery.data?.permissions ?? [];

	const onSubmit = async (values: ShortPermissionRequestFormValues) => {
		try {
			if (editingId) {
				await updatePerm.mutateAsync({ id: editingId, employeeId, payload: buildEmployeeShortPermissionPayload(values) });
				// Success toast comes from the backend message via the axios interceptor.
			} else {
				await createPerm.mutateAsync({ employeeId, payload: buildEmployeeShortPermissionPayload(values) });
				// Success toast comes from the backend message via the axios interceptor.
			}
			setSelectedMonth(values.permissionDate.slice(0, 7));
			setEditingId(null);
			form.reset(getDefaultShortPermissionRequestFormValues());
		} catch (e) {
			toast.error(handleApiError(e));
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>My short permissions ({selectedMonth})</CardTitle>
				<CardDescription>Used {listQuery.data?.allowance.usedPaidMinutes ?? 0} / {listQuery.data?.allowance.allocatedMinutes ?? 0} paid minutes.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<input aria-label="My short permissions month" type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded border px-2 py-2 text-sm" />
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
					<input aria-label="Permission date" type="date" {...form.register("permissionDate")} className="rounded border px-2 py-2 text-sm" />
					<input aria-label="Start time" type="time" {...form.register("startTime")} className="rounded border px-2 py-2 text-sm" />
					<input aria-label="End time" type="time" {...form.register("endTime")} className="rounded border px-2 py-2 text-sm" />
					<input {...form.register("reason")} placeholder="Reason (optional)" className="rounded border px-2 py-2 text-sm" />
					<Button type="submit">{editingId ? "Update" : "Submit"}</Button>
				</form>
				<div className="space-y-2">
					{items.map((p) => (
						<div key={p.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
							<span>{p.permissionDate} {p.startTime}-{p.endTime} · {p.status}</span>
							<span className="flex gap-2">
								{p.status === "pending" && (
									<Button size="sm" variant="outline" onClick={() => { setEditingId(p.id); form.reset({ permissionDate: p.permissionDate, startTime: p.startTime.slice(0, 5), endTime: p.endTime.slice(0, 5), reason: p.reason ?? "" }); }}>Edit</Button>
								)}
								{(p.status === "pending" || p.status === "approved") && (
									<Button size="sm" variant="ghost" onClick={async () => { try { await cancelPerm.mutateAsync({ id: p.id, employeeId }); /* Success toast via axios interceptor. */ } catch (e) { toast.error(handleApiError(e)); } }}>Cancel</Button>
								)}
							</span>
						</div>
					))}
					{items.length === 0 && <p className="text-sm text-muted-foreground">No permissions yet.</p>}
				</div>
			</CardContent>
		</Card>
	);
}

function MyOvertime({ employeeId, year, month }: { employeeId: number; year: number; month: number }) {
	const listQuery = useEmployeeOvertimeRequests(employeeId, year, month, employeeId > 0);
	const createOt = useCreateEmployeeOvertimeRequest();
	const cancelOt = useCancelEmployeeOvertimeRequest();
	const form = useForm<OvertimeRequestFormValues>({ resolver: zodResolver(overtimeRequestSchema), mode: "onChange", defaultValues: getDefaultOvertimeRequestFormValues() });
	const items = listQuery.data?.requests ?? [];

	const onSubmit = async (values: OvertimeRequestFormValues) => {
		try {
			await createOt.mutateAsync({ employeeId, payload: buildEmployeeOvertimeRequestPayload(values) });
			toast.success("Overtime submitted");
			form.reset(getDefaultOvertimeRequestFormValues());
		} catch (e) {
			toast.error(handleApiError(e));
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>My overtime</CardTitle>
				<CardDescription>Only approved time is payable. Overlapping windows are rejected.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
					<input type="date" {...form.register("overtimeDate")} className="rounded border px-2 py-2 text-sm" />
					<input type="time" {...form.register("startTime")} className="rounded border px-2 py-2 text-sm" />
					<input type="time" {...form.register("endTime")} className="rounded border px-2 py-2 text-sm" />
					<input {...form.register("reason")} placeholder="Reason" className="rounded border px-2 py-2 text-sm" />
					<Button type="submit">Submit</Button>
				</form>
				<div className="space-y-2">
					{items.map((r) => (
						<div key={r.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
							<span>{r.overtimeDate} {r.startTime}-{r.endTime} · {r.status}</span>
							{r.status === "pending" && (
								<Button size="sm" variant="ghost" onClick={async () => { try { await cancelOt.mutateAsync({ id: r.id, employeeId }); toast.success("Overtime cancelled"); } catch (e) { toast.error(handleApiError(e)); } }}>Cancel</Button>
							)}
						</div>
					))}
					{items.length === 0 && <p className="text-sm text-muted-foreground">No overtime yet.</p>}
				</div>
			</CardContent>
		</Card>
	);
}
