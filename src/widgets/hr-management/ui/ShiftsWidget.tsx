"use client";

import { useState } from "react";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Can } from "@/shared/ui/Can";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { ShiftFormModal } from "@/features/hr/ui/ShiftFormModal";
import { DeleteShiftDialog } from "@/features/hr/ui/DeleteShiftDialog";
import { useShifts } from "@/features/hr/model/use-hr-actions";
import type { Shift } from "@/entities/hr/model/types";

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(onEdit: (shift: Shift) => void, onDelete: (shift: Shift) => void): Column<Shift>[] {
	return [
		{
			key: "name",
			header: "Name",
			render: (s) => <span className="text-sm font-medium">{s.name}</span>,
		},
		{
			key: "schedule",
			header: "Schedule",
			render: (s) => (
				<span className="text-sm tabular-nums text-muted-foreground">
					{s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
				</span>
			),
		},
		{
			key: "working_days",
			header: "Working Days",
			render: (s) => (
				<div className="flex flex-wrap gap-1">
					{s.workingDays.map((d) => (
						<Badge
							key={d}
							variant="secondary"
							className="px-1.5 py-0 text-xs"
						>
							{d}
						</Badge>
					))}
				</div>
			),
		},
		{
			key: "grace",
			header: "Grace Period",
			render: (s) => <span className="text-sm text-muted-foreground">{s.gracePeriodMinutes} min</span>,
		},
		{
			key: "employees",
			header: "Employees",
			render: (s) => <span className="text-sm tabular-nums">{s.employeeProfilesCount ?? 0}</span>,
		},
		{
			key: "actions",
			header: "",
			className: "text-right",
			render: (s) => (
				<Can permission="manage_shifts">
					<div className="flex items-center justify-end gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(s);
							}}
						>
							<Pencil className="h-3.5 w-3.5" />
							<span className="sr-only">Edit {s.name}</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(s);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
							<span className="sr-only">Delete {s.name}</span>
						</Button>
					</div>
				</Can>
			),
		},
	];
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────────────────────

export function ShiftsWidget() {
	const { data: shifts, isLoading, error } = useShifts();

	// Modal state
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<Shift | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);

	const handleCreate = () => {
		setEditTarget(null);
		setFormOpen(true);
	};

	const handleEdit = (shift: Shift) => {
		setEditTarget(shift);
		setFormOpen(true);
	};

	const handleCloseForm = () => {
		setFormOpen(false);
		setEditTarget(null);
	};

	const columns = buildColumns(handleEdit, setDeleteTarget);

	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">Shifts</h1>
					<p className="text-sm text-muted-foreground">Manage work shifts, schedules, and grace periods for attendance tracking.</p>
				</div>
				<Can permission="manage_shifts">
					<Button
						size="sm"
						className="gap-2 shrink-0"
						onClick={handleCreate}
					>
						<Plus className="h-4 w-4" />
						New Shift
					</Button>
				</Can>
			</div>

			<DataTable<Shift>
				title="All Shifts"
				titleBadge={shifts ? String(shifts.length) : undefined}
				columns={columns}
				data={shifts ?? []}
				keyExtractor={(s) => s.id}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Clock,
					title: "No shifts defined yet",
					description: "Create your first shift to start tracking employee attendance.",
					action: { label: "Create Shift", onClick: handleCreate },
				}}
			/>

			<ShiftFormModal
				open={formOpen}
				onClose={handleCloseForm}
				editTarget={editTarget}
			/>

			<DeleteShiftDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				shift={deleteTarget}
			/>
		</section>
	);
}
