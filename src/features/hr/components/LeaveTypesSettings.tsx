"use client";

import { useState } from "react";
import { AlertCircle, FileText, Info, Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { handleApiError, notifyApiError } from "@/lib/errorHandling";
import { useAllLeaveTypes, useUpdateLeaveType } from "../hooks/useEmployeeLeaves";
import type { LeaveType } from "../types/leave-management";
import { LeaveTypeFormDialog } from "./LeaveTypeFormDialog";

export function LeaveTypesSettings() {
	const [formOpen, setFormOpen] = useState(false);
	const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType>();
	const leaveTypesQuery = useAllLeaveTypes();
	const updateLeaveType = useUpdateLeaveType();
	const leaveTypes = [...(leaveTypesQuery.data ?? [])].sort((left, right) => left.displayOrder - right.displayOrder || left.name.localeCompare(right.name));

	const openCreateForm = () => {
		setSelectedLeaveType(undefined);
		setFormOpen(true);
	};

	const openEditForm = (leaveType: LeaveType) => {
		setSelectedLeaveType(leaveType);
		setFormOpen(true);
	};

	const toggleActiveStatus = async (leaveType: LeaveType) => {
		try {
			await updateLeaveType.mutateAsync({ id: leaveType.id, payload: { isActive: !leaveType.isActive } });
			// Success toast comes from the backend message via the axios interceptor.
		} catch (error) {
			notifyApiError(error);
		}
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<CardTitle>Leave Types</CardTitle>
						<CardDescription>Manage the leave categories available to employees. Inactive types remain visible here but cannot be selected for new requests.</CardDescription>
					</div>
					<Button type="button" onClick={openCreateForm} className="w-full sm:w-auto">
						<Plus />
						Add leave type
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert>
						<Info />
						<AlertTitle>Current-year allowance</AlertTitle>
						<AlertDescription>Changes update the current year for employees using the default. Used days, custom employee allocations, and previous years are preserved. Reducing an allowance below used days leaves no remaining balance.</AlertDescription>
					</Alert>

					{leaveTypesQuery.isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
						</div>
					) : leaveTypesQuery.isError ? (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>Unable to load leave types</AlertTitle>
							<AlertDescription className="flex flex-wrap items-center gap-2">
								<span>{handleApiError(leaveTypesQuery.error)}</span>
								<Button type="button" variant="outline" size="sm" onClick={() => leaveTypesQuery.refetch()}>
									<RefreshCw />
									Try again
								</Button>
							</AlertDescription>
						</Alert>
					) : leaveTypes.length === 0 ? (
						<div className="rounded-lg border border-dashed px-4 py-10 text-center">
							<FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
							<p className="font-medium">No leave types configured</p>
							<p className="mt-1 text-sm text-muted-foreground">Add a leave type before employees can submit leave requests.</p>
							<Button type="button" variant="outline" className="mt-4" onClick={openCreateForm}>
								<Plus />
								Add leave type
							</Button>
						</div>
					) : (
						<div className="space-y-3">
							{leaveTypes.map((leaveType) => (
								<div className="rounded-lg border p-4" key={leaveType.id}>
									<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0 space-y-3">
											<div className="flex flex-wrap items-center gap-2">
												<h3 className="font-medium">{leaveType.name}</h3>
												<Badge variant={leaveType.isPaid ? "default" : "outline"}>{leaveType.isPaid ? "Paid" : "Unpaid"}</Badge>
												<Badge variant={leaveType.isActive ? "secondary" : "outline"}>{leaveType.isActive ? "Active" : "Inactive"}</Badge>
											</div>
											<p className="font-mono text-sm text-muted-foreground">{leaveType.slug}</p>
											<dl className="grid gap-3 text-sm sm:grid-cols-3">
												<div>
													<dt className="text-muted-foreground">Annual allowance</dt>
													<dd className="font-medium">{leaveType.annualAllowanceDays} days</dd>
												</div>
												<div>
													<dt className="text-muted-foreground">Display order</dt>
													<dd className="font-medium">{leaveType.displayOrder}</dd>
												</div>
												<div>
													<dt className="text-muted-foreground">Availability</dt>
													<dd className="font-medium">{leaveType.isActive ? "Available for requests" : "Not available for requests"}</dd>
												</div>
											</dl>
										</div>
										<div className="flex flex-wrap gap-2 sm:justify-end">
											<Button type="button" size="sm" variant="outline" disabled={updateLeaveType.isPending} onClick={() => void toggleActiveStatus(leaveType)}>
												{updateLeaveType.isPending && <Loader2 className="animate-spin" />}
												{leaveType.isActive ? "Deactivate" : "Reactivate"}
											</Button>
											<Button type="button" size="sm" variant="outline" disabled={updateLeaveType.isPending} onClick={() => openEditForm(leaveType)}>
												<Pencil />
												Edit
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<LeaveTypeFormDialog leaveType={selectedLeaveType} open={formOpen} onOpenChange={setFormOpen} />
		</div>
	);
}
