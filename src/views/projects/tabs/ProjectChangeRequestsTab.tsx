"use client";

/**
 * ProjectChangeRequestsTab
 *
 * Displays all change requests for a project in a DataTable.
 * Columns: Title · Description snippet · Price · Status · Created At
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
import { Plus, GitPullRequestArrow } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { StatusBadge, getStatusVariant } from "@/shared/ui/data-display/StatusBadge";
import { FormInput } from "@/shared/ui/forms/FormInput";
import { FormTextarea } from "@/shared/ui/forms/FormTextarea";
import { formatCurrency } from "@/shared/lib/formatters";
import { formatDateDisplay } from "@/shared/lib/dateUtils";
import { useChangeRequests, useCreateChangeRequest } from "@/features/projects/api/execution.api";
import type { ChangeRequest } from "@/features/projects/api/execution.api";

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema — mirrors StoreChangeRequestRequest validation rules
// ─────────────────────────────────────────────────────────────────────────────

const createChangeRequestSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
	description: z.string().trim().min(1, "Description is required"),
	price: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price must be at least 0"),
});

type CreateChangeRequestFormData = z.infer<typeof createChangeRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(currency: string): Column<ChangeRequest>[] {
	return [
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
	];
}

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

	const changeRequestsQuery = useChangeRequests(projectId);
	const createMutation = useCreateChangeRequest();

	const form = useForm<CreateChangeRequestFormData>({
		resolver: zodResolver(createChangeRequestSchema),
		defaultValues: { title: "", description: "", price: 0 },
	});

	const handleOpenDialog = useCallback(() => {
		form.reset({ title: "", description: "", price: 0 });
		setDialogOpen(true);
	}, [form]);

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

	const columns = buildColumns(currency);

	return (
		<>
			<DataTable
				title="Change Requests"
				titleBadge={changeRequestsQuery.data ? String(changeRequestsQuery.data.length) : undefined}
				columns={columns}
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
					<Button
						size="sm"
						onClick={handleOpenDialog}
					>
						<Plus />
						New Change Request
					</Button>
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
		</>
	);
}
