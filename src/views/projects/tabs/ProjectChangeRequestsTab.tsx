"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
	useChangeRequests,
	useCreateChangeRequest,
	useDeleteChangeRequest,
	useUpdateChangeRequestStatus,
	type ChangeRequest,
	type ChangeRequestStatusValue,
} from "@/features/projects/api/execution.api";
import {
	createChangeRequestFormDefaults,
	createChangeRequestSchema,
	mapCreateChangeRequestFormToPayload,
	type CreateChangeRequestFormData,
} from "./model/project-change-requests";
import { ProjectChangeRequestCreateDialog } from "./ui/ProjectChangeRequestCreateDialog";
import { ProjectChangeRequestDeleteDialog } from "./ui/ProjectChangeRequestDeleteDialog";
import { ProjectChangeRequestsTable } from "./ui/ProjectChangeRequestsTable";

interface ProjectChangeRequestsTabProps {
	projectId: number;
	currency?: string;
}

export function ProjectChangeRequestsTab({ projectId, currency = "USD" }: ProjectChangeRequestsTabProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<ChangeRequest | null>(null);

	const changeRequestsQuery = useChangeRequests(projectId);
	const createMutation = useCreateChangeRequest();
	const updateStatusMutation = useUpdateChangeRequestStatus();
	const deleteMutation = useDeleteChangeRequest();

	const form = useForm<CreateChangeRequestFormData>({
		resolver: zodResolver(createChangeRequestSchema),
		defaultValues: createChangeRequestFormDefaults,
	});

	const openCreateDialog = useCallback(() => {
		form.reset(createChangeRequestFormDefaults);
		setCreateDialogOpen(true);
	}, [form]);

	const updateChangeRequestStatus = useCallback(
		async (changeRequest: ChangeRequest, status: ChangeRequestStatusValue) => {
			try {
				await updateStatusMutation.mutateAsync({ projectId, changeRequestId: changeRequest.changeRequestId, status });
				toast.success("Status updated.");
			} catch {
				toast.error("Failed to update status.");
			}
		},
		[projectId, updateStatusMutation],
	);

	const deleteChangeRequest = useCallback(async () => {
		if (!deleteTarget) return;

		try {
			await deleteMutation.mutateAsync({ projectId, changeRequestId: deleteTarget.changeRequestId });
			toast.success("Change request deleted.");
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to delete change request.");
		}
	}, [deleteMutation, deleteTarget, projectId]);

	const submitCreateChangeRequest = form.handleSubmit(async (formData) => {
		try {
			await createMutation.mutateAsync({
				projectId,
				payload: mapCreateChangeRequestFormToPayload(formData),
			});
			toast.success("Change request created.");
			setCreateDialogOpen(false);
			form.reset(createChangeRequestFormDefaults);
		} catch {
			toast.error("Failed to create change request.");
		}
	});

	return (
		<>
			<ProjectChangeRequestsTable
				changeRequests={changeRequestsQuery.data ?? []}
				currency={currency}
				isLoading={changeRequestsQuery.isLoading}
				error={changeRequestsQuery.error}
				isUpdatingStatus={updateStatusMutation.isPending}
				onCreateClick={openCreateDialog}
				onStatusChange={updateChangeRequestStatus}
				onDeleteClick={setDeleteTarget}
			/>

			<ProjectChangeRequestCreateDialog
				open={createDialogOpen}
				form={form}
				isLoading={createMutation.isPending}
				onOpenChange={setCreateDialogOpen}
				onSubmit={submitCreateChangeRequest}
			/>

			<ProjectChangeRequestDeleteDialog
				changeRequest={deleteTarget}
				isLoading={deleteMutation.isPending}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				onConfirm={deleteChangeRequest}
			/>
		</>
	);
}
