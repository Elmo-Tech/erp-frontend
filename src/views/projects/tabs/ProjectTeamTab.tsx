"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePermissionGate } from "@/shared/ui/Can";
import { useAddProjectMember, useProjectMembers, useRemoveProjectMember, type ProjectMemberResource } from "@/features/projects/api/execution.api";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import {
	addProjectMemberFormDefaults,
	addProjectMemberSchema,
	buildInternalUserOptions,
	mapAddProjectMemberFormToPayload,
	type AddProjectMemberFormData,
} from "./model/project-team";
import { ProjectTeamAddMemberDialog } from "./ui/ProjectTeamAddMemberDialog";
import { ProjectTeamTable } from "./ui/ProjectTeamTable";

interface ProjectTeamTabProps {
	projectId: number;
}

export function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
	const { canAny } = usePermissionGate();
	const [dialogOpen, setDialogOpen] = useState(false);

	const membersQuery = useProjectMembers(projectId);
	const addMember = useAddProjectMember();
	const removeMember = useRemoveProjectMember();
	const usersQuery = useGetInternalUsers(dialogOpen);
	const canAddProjectMembers = canAny(["add_project_members", "manage_project_members"]);
	const canRemoveProjectMembers = canAny(["remove_project_members", "manage_project_members"]);

	const form = useForm<AddProjectMemberFormData>({
		resolver: zodResolver(addProjectMemberSchema),
		defaultValues: addProjectMemberFormDefaults,
	});

	const userOptions = useMemo(() => buildInternalUserOptions(usersQuery.data?.users ?? []), [usersQuery.data?.users]);

	const openAddMemberDialog = useCallback(() => {
		form.reset(addProjectMemberFormDefaults);
		setDialogOpen(true);
	}, [form]);

	const removeProjectMember = useCallback(
		async (member: ProjectMemberResource) => {
			try {
				await removeMember.mutateAsync({ projectId, memberId: member.memberId });
				toast.success("Team member removed.");
			} catch {
				toast.error("Failed to remove team member.");
			}
		},
		[projectId, removeMember],
	);

	const submitAddMember = form.handleSubmit(async (formData) => {
		try {
			await addMember.mutateAsync({
				projectId,
				payload: mapAddProjectMemberFormToPayload(formData),
			});
			toast.success("Team member added.");
			setDialogOpen(false);
			form.reset(addProjectMemberFormDefaults);
		} catch {
			toast.error("Failed to add team member.");
		}
	});

	return (
		<>
			<ProjectTeamTable
				members={membersQuery.data ?? []}
				isLoading={membersQuery.isLoading}
				error={membersQuery.error}
				canAddProjectMembers={canAddProjectMembers}
				canRemoveProjectMembers={canRemoveProjectMembers}
				isRemovingMember={removeMember.isPending}
				onAddMember={openAddMemberDialog}
				onRemoveMember={removeProjectMember}
			/>

			{canAddProjectMembers && (
				<ProjectTeamAddMemberDialog
					open={dialogOpen}
					form={form}
					userOptions={userOptions}
					isAddingMember={addMember.isPending}
					isLoadingUsers={usersQuery.isLoading}
					onOpenChange={setDialogOpen}
					onSubmit={submitAddMember}
				/>
			)}
		</>
	);
}
