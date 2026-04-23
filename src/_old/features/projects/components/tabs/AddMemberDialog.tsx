"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/shared/ui/form";
import { FormDialog, FormSelect } from "@/shared/ui";
import { useUsers } from "@/_old/features/admin/hooks/useUsers";
import { useAddProjectMember } from "../../hooks/useProjectMembers";
import { MemberRole, MEMBER_ROLES } from "../../types/projectMember";
import { toast } from "sonner";

const addMemberSchema = z.object({
	userId: z.string().min(1, "Please select a user"),
	role: z.enum(["lead", "member", "reviewer"]),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	existingMemberIds: number[];
}

export function AddMemberDialog({ projectId, open, onOpenChange, existingMemberIds }: AddMemberDialogProps) {
	const { data: usersData, isLoading: usersLoading } = useUsers({ perPage: 100 });
	const addMember = useAddProjectMember();

	const form = useForm<AddMemberFormData>({
		resolver: zodResolver(addMemberSchema),
		defaultValues: {
			userId: "",
			role: "member",
		},
	});

	// Filter out users who are already members
	const availableUsers = usersData?.users?.filter((user) => !existingMemberIds.includes(user.userId)) || [];

	const userOptions = usersLoading
		? [{ value: "loading", label: "Loading users...", disabled: true }]
		: availableUsers.length === 0
		? [{ value: "unavailable", label: "No available users", disabled: true }]
		: availableUsers.map((user) => ({
				value: user.userId.toString(),
				label: `${user.name} (${user.email})`,
		  }));

	const roleOptions = MEMBER_ROLES.map((role) => ({
		value: role.value,
		label: role.label,
	}));

	const handleSubmit = async (data: AddMemberFormData) => {
		try {
			await addMember.mutateAsync({
				projectId,
				payload: {
					userId: parseInt(data.userId),
					role: data.role as MemberRole,
				},
			});
			toast.success("Member added successfully");
			form.reset();
			onOpenChange(false);
		} catch {
			toast.error("Failed to add member");
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Add Team Member"
			description="Select a user to add to this project"
			submitLabel="Add Member"
			onSubmit={form.handleSubmit(handleSubmit)}
			isLoading={addMember.isPending}
			isSubmitDisabled={!form.formState.isValid}
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormSelect
						control={form.control}
						name="userId"
						label="User"
						placeholder="Select a user..."
						options={userOptions}
					/>
					<FormSelect
						control={form.control}
						name="role"
						label="Role"
						placeholder="Select a role..."
						options={roleOptions}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
