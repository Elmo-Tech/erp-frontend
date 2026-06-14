"use client";

import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormCombobox, type ComboboxOption } from "@/shared/ui/forms/FormCombobox";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { projectMemberRoleOptions, type AddProjectMemberFormData } from "../model/project-team";

interface ProjectTeamAddMemberDialogProps {
	open: boolean;
	form: UseFormReturn<AddProjectMemberFormData>;
	userOptions: ComboboxOption[];
	isAddingMember: boolean;
	isLoadingUsers: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
}

export function ProjectTeamAddMemberDialog({
	open,
	form,
	userOptions,
	isAddingMember,
	isLoadingUsers,
	onOpenChange,
	onSubmit,
}: ProjectTeamAddMemberDialogProps) {
	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Add Team Member"
			description="Assign an internal user to this project with a specific role."
			submitLabel="Add Member"
			isLoading={isAddingMember}
			isSubmitDisabled={isLoadingUsers}
			onSubmit={onSubmit}
			size="sm"
		>
			<Form {...form}>
				<div className="flex flex-col gap-4">
					<FormCombobox
						control={form.control}
						name="userId"
						label="User"
						placeholder={isLoadingUsers ? "Loading users…" : "Select a user…"}
						searchPlaceholder="Search by name…"
						emptyText="No users found."
						options={userOptions}
						disabled={isLoadingUsers}
					/>
					<FormSelect
						control={form.control}
						name="role"
						label="Project role"
						placeholder="Select a role"
						options={projectMemberRoleOptions}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
