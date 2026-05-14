"use client";

/**
 * ProjectChangeRequestsTab
 *
 * Displays all change requests for a project in a DataTable.
 * Columns: Title · Description snippet · Price · Status · Created At · Actions
 *
 * Actions (guarded by <Can>):
 *  - Update Status dropdown  → useUpdateChangeRequestStatus
 *  - Delete button           → useDeleteChangeRequest
 *
 * A "New Change Request" button opens a FormDialog backed by React Hook
 * Form + Zod. On submit it calls useCreateChangeRequest().
 *
 * Payload mirrors StoreChangeRequestRequest:
 *   title       required string max:255
 *   description required string
 *   price       required numeric min:0
 */

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, GitPullRequestArrow, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { StatusBadge, getStatusVariant } from "@/shared/ui/data-display/StatusBadge";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { Can } from "@/shared/ui/Can";
import { formatCurrency } from "@/shared/lib/formatters";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { requiredNumberInput } from "@/shared/lib/zod-number";
import { useChangeRequests, useCreateChangeRequest, useUpdateChangeRequestStatus, useDeleteChangeRequest } from "@/features/projects/api/execution.api";
import type { ChangeRequest } from "@/features/projects/api/execution.api";

// ─────────────────────────────────────────────────────────────────────────────
// Change Request status options — mirrors backend ChangeRequestStatus enum
// ─────────────────────────────────────────────────────────────────────────────

const CHANGE_REQUEST_STATUS_OPTIONS = [
	{ value: "draft", label: "Draft" },
	{ value: "pending_approval", label: "Pending Approval" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "completed", label: "Completed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema — mirrors StoreChangeRequestRequest validation rules
// ─────────────────────────────────────────────────────────────────────────────

const createChangeRequestSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
	description: z.string().trim().min(1, "Description is required"),
	price: requiredNumberInput("Price is required", "Price must be a number").pipe(z.number().min(0, "Price must be at least 0")),
});

type CreateChangeRequestFormData = z.infer<typeof createChangeRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectChangeRequestsTabProps {
	projectId: number;
	/** Currency code from the parent project — used for price formatting */
	currency?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectChangeRequestsTab({ projectId, currency = "USD" }: ProjectChangeRequestsTabProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<ChangeRequest | null>(null);

	const changeRequestsQuery = useChangeRequests(projectId);
	const createMutation = useCreateChangeRequest();
	const updateStatusMutation = useUpdateChangeRequestStatus();
	const deleteMutation = useDeleteChangeRequest();

	const form = useForm<CreateChangeRequestFormData>({
		resolver: zodResolver(createChangeRequestSchema),
		defaultValues: { title: "", description: "", price: 0 },
	});

	const handleOpenDialog = useCallback(() => {
		form.reset({ title: "", description: "", price: 0 });
		setDialogOpen(true);
	}, [form]);

	const handleStatusChange = useCallback(
		async (cr: ChangeRequest, status: string) => {
			try {
				await updateStatusMutation.mutateAsync({ projectId, changeRequestId: cr.changeRequestId, status });
				toast.success("Status updated.");
			} catch {
				toast.error("Failed to update status.");
			}
		},
		[projectId, updateStatusMutation],
	);

	const handleDeleteConfirm = async () => {
		if (!deleteTarget) return;
		try {
			await deleteMutation.mutateAsync({ projectId, changeRequestId: deleteTarget.changeRequestId });
			toast.success("Change request deleted.");
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete change request.");
		}
	};

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			await createMutation.mutateAsync({
				projectId,
				payload: {
					title: data.title,
					description: data.description,
					price: data.price,
				},
			});
			toast.success("Change request created.");
			setDialogOpen(false);
			form.reset();
		} catch {
			toast.error("Failed to create change request.");
		}
	});

	// ── Table columns ──────────────────────────────────────────────────────────
	const tableColumns: Column<ChangeRequest>[] = [
		{
			key: "title",
			header: "Title",
			render: (cr) => <span className="font-medium">{cr.title}</span>,
		},
		{
			key: "description",
			header: "Description",
			className: "max-w-xs",
			render: (cr) => <span className="line-clamp-2 text-sm text-muted-foreground">{cr.description ?? "—"}</span>,
		},
		{
			key: "price",
			header: "Price",
			render: (cr) => <span className="tabular-nums font-medium">{formatCurrency(cr.price, currency)}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (cr) => (
				<StatusBadge
					label={cr.statusLabel ?? cr.status ?? "Draft"}
					variant={getStatusVariant(cr.status ?? "draft")}
				/>
			),
		},
		{
			key: "createdAt",
			header: "Created",
			render: (cr) => <span className="text-sm text-muted-foreground">{formatDateDisplay(cr.createdAt)}</span>,
		},
		{
			key: "actions",
			header: "",
			render: (cr) => (
				<div className="flex items-center justify-end gap-1">
					<Can permission="manage_change_requests">
						<StatusSelector
							currentStatus={cr.status ?? "draft"}
							options={CHANGE_REQUEST_STATUS_OPTIONS}
							onChange={(status) => handleStatusChange(cr, status)}
							disabled={updateStatusMutation.isPending}
						/>
					</Can>
					<Can permission="delete_change_requests">
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-muted-foreground hover:text-destructive"
							onClick={() => setDeleteTarget(cr)}
							aria-label="Delete change request"
						>
							<Trash2 className="size-4" />
						</Button>
					</Can>
				</div>
			),
		},
	];

	return (
		<>
			<DataTable
				title="Change Requests"
				titleBadge={changeRequestsQuery.data ? String(changeRequestsQuery.data.length) : undefined}
				columns={tableColumns}
				data={changeRequestsQuery.data ?? []}
				keyExtractor={(cr) => cr.changeRequestId}
				isLoading={changeRequestsQuery.isLoading}
				error={changeRequestsQuery.error}
				emptyState={{
					icon: GitPullRequestArrow,
					title: "No change requests yet",
					description: "Scope changes and additional work items will appear here once created.",
					action: { label: "New Change Request", onClick: handleOpenDialog },
				}}
				headerActions={
					<Can permission="manage_change_requests">
						<Button
							size="sm"
							onClick={handleOpenDialog}
						>
							<Plus />
							New Change Request
						</Button>
					</Can>
				}
			/>

			{/* ── Create dialog ──────────────────────────────────────────────── */}
			<FormDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				title="New Change Request"
				description="Document a scope change or additional work item. It will be created in Draft status."
				submitLabel="Create"
				isLoading={createMutation.isPending}
				onSubmit={handleSubmit}
				size="md"
			>
				<FormProvider {...form}>
					<div className="flex flex-col gap-4">
						<FormInput
							control={form.control}
							name="title"
							label="Title"
							placeholder="e.g. Add dark mode support"
						/>
						<FormTextarea
							control={form.control}
							name="description"
							label="Description"
							placeholder="Describe the change in detail…"
							rows={4}
						/>
						<FormInput
							control={form.control}
							name="price"
							label="Price"
							type="number"
							placeholder="0"
							min={0}
							step={0.01}
						/>
					</div>
				</FormProvider>
			</FormDialog>

			{/* ── Delete confirmation dialog ─────────────────────────────────── */}
			<ConfirmDialog
				open={Boolean(deleteTarget)}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Delete change request"
				description={
					<span>
						Delete <span className="font-medium text-foreground">{deleteTarget?.title}</span>? This action cannot be undone.
					</span>
				}
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleDeleteConfirm}
				isLoading={deleteMutation.isPending}
			/>
		</>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusSelector — inline native select for row-level status updates
// ─────────────────────────────────────────────────────────────────────────────

interface StatusSelectorProps {
	currentStatus: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
	disabled?: boolean;
}

function StatusSelector({ currentStatus, options, onChange, disabled }: StatusSelectorProps) {
	return (
		<select
			value={currentStatus}
			onChange={(e) => onChange(e.target.value)}
			disabled={disabled}
			className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="Update status"
		>
			{options.map((opt) => (
				<option
					key={opt.value}
					value={opt.value}
				>
					{opt.label}
				</option>
			))}
		</select>
	);
}
