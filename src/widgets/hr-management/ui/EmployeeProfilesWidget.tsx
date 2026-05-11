"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2, AlertTriangle, BarChart2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { AssignHrProfileModal } from "@/features/hr/ui/AssignHrProfileModal";
import { DeleteHrProfileDialog } from "@/features/hr/ui/DeleteHrProfileDialog";
import { useEmployeeProfiles, useShifts } from "@/features/hr/model/use-hr-actions";
import type { EmployeeProfile } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (profile: EmployeeProfile) => void, onDelete: (profile: EmployeeProfile) => void): Column<EmployeeProfile>[] {
	return [
		{
			key: "employee",
			header: "Employee",
			render: (p) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8 shrink-0">
						<AvatarImage src={p.user?.avatar ?? undefined} />
						<AvatarFallback>{p.user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{p.user?.name ?? "—"}</p>
						<p className="truncate text-xs text-muted-foreground">{p.user?.email ?? "—"}</p>
					</div>
				</div>
			),
		},
		{
			key: "shift",
			header: "Shift",
			render: (p) =>
				p.shift ? (
					<Badge
						variant="outline"
						className="text-xs"
					>
						{p.shift.name}
					</Badge>
				) : (
					<span className="text-sm text-muted-foreground">No shift</span>
				),
		},
		{
			key: "base_salary",
			header: "Base Salary",
			className: "text-right",
			render: (p) => <span className="text-sm font-semibold tabular-nums">{formatCurrency(p.baseSalary)}</span>,
		},
		{
			key: "hourly_rate",
			header: "Hourly Rate",
			className: "text-right",
			render: (p) => <span className="text-sm tabular-nums text-muted-foreground">{formatCurrency(p.hourlyRate)}/hr</span>,
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (p) => (
				<div className="flex items-center justify-end gap-1">
					{/* View Performance Report — visible to anyone with manage_employees */}
					<Can permission="manage_employees">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-primary hover:text-primary"
							title="View Performance Report"
							asChild
						>
							<Link href={`/dashboard/hr/admin/reports/${p.userId}`}>
								<BarChart2 className="h-3.5 w-3.5" />
								<span className="sr-only">Performance report for {p.user?.name}</span>
							</Link>
						</Button>
					</Can>
					<Can permission="manage_employees">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(p);
							}}
						>
							<Pencil className="h-3.5 w-3.5" />
							<span className="sr-only">Edit {p.user?.name}</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(p);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Remove {p.user?.name}</span>
						</Button>
					</Can>
				</div>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function EmployeeProfilesWidget() {
	const { data: profiles, isLoading, error } = useEmployeeProfiles();
	// Fetch shifts to detect the "no shifts" condition for the guidance alert
	const { data: shifts, isLoading: shiftsLoading } = useShifts();

	const [modalOpen, setModalOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<EmployeeProfile | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<EmployeeProfile | null>(null);

	const hasNoShifts = !shiftsLoading && (shifts ?? []).length === 0;

	const handleAssign = () => {
		setEditTarget(null);
		setModalOpen(true);
	};

	const handleEdit = (profile: EmployeeProfile) => {
		setEditTarget(profile);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditTarget(null);
	};

	const columns = buildColumns(handleEdit, setDeleteTarget);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Employee HR Profiles</h1>
					<p className="text-sm text-muted-foreground">Assign and manage salary, shift, and HR information for each user.</p>
				</div>
				<Can permission="manage_employees">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleAssign}
					>
						<Plus className="h-4 w-4" />
						Assign Profile
					</Button>
				</Can>
			</div>

			{/* ── Guidance alert: no shifts exist yet ── */}
			{hasNoShifts && (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						No shifts have been created yet. It is recommended to{" "}
						<Link
							href="/dashboard/hr/admin/shifts"
							className="font-medium underline underline-offset-4 hover:no-underline"
						>
							create a shift first
						</Link>{" "}
						before assigning HR profiles, so employees can be linked to a schedule.
					</AlertDescription>
				</Alert>
			)}

			<DataTable<EmployeeProfile>
				title="All HR Profiles"
				titleBadge={profiles ? String(profiles.length) : undefined}
				columns={columns}
				data={profiles ?? []}
				keyExtractor={(p) => p.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Users,
					title: "No HR profiles assigned",
					description: hasNoShifts ? "Create a shift first, then assign HR profiles to users." : "Assign HR profiles to users to manage salaries and shifts.",
					action: { label: "Assign Profile", onClick: handleAssign },
				}}
			/>

			<AssignHrProfileModal
				open={modalOpen}
				onClose={handleCloseModal}
				editTarget={editTarget}
			/>

			<DeleteHrProfileDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				profile={deleteTarget}
			/>
		</section>
	);
}
