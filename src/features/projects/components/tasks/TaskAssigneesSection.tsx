"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormDialog, FormSelect, FormSwitch } from "@/components/shared";
import { Task, AssigneeRole, AssigneeRoleLabels, TaskAssignee } from "@/features/dashboard/types/task";
import { useAddAssignee, useRemoveAssignee } from "@/features/dashboard/hooks/useTasks";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import { Plus, X, Crown, Code, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const addAssigneeSchema = z.object({
	userId: z.string().min(1, "Please select a member"),
	role: z.nativeEnum(AssigneeRole),
	isPrimary: z.boolean(),
});

type AddAssigneeFormData = z.infer<typeof addAssigneeSchema>;

interface TaskAssigneesSectionProps {
	task: Task;
}

const roleIcons = {
	[AssigneeRole.DEVELOPER]: Code,
	[AssigneeRole.REVIEWER]: Eye,
	[AssigneeRole.LEAD]: Crown,
};

const roleColors = {
	[AssigneeRole.DEVELOPER]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	[AssigneeRole.REVIEWER]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	[AssigneeRole.LEAD]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const ROLE_OPTIONS = Object.values(AssigneeRole).map((role) => ({
	value: role,
	label: AssigneeRoleLabels[role],
}));

export function TaskAssigneesSection({ task }: TaskAssigneesSectionProps) {
	const [showAddDialog, setShowAddDialog] = useState(false);

	const { data: membersData } = useProjectMembers(task.projectId);
	const addAssignee = useAddAssignee();
	const removeAssignee = useRemoveAssignee();

	const form = useForm<AddAssigneeFormData>({
		resolver: zodResolver(addAssigneeSchema),
		defaultValues: {
			userId: "",
			role: AssigneeRole.DEVELOPER,
			isPrimary: false,
		},
	});

	const assignees = task.assignees || [];

	// Filter out already assigned users
	const availableMembers = membersData?.members?.filter((member) => !assignees.some((a) => a.userId === member.userId)) || [];

	const memberOptions = availableMembers.map((member) => ({
		value: member.userId.toString(),
		label: member.user?.name || "Unknown",
	}));

	const handleAddAssignee = async (data: AddAssigneeFormData) => {
		try {
			await addAssignee.mutateAsync({
				taskId: task.taskId,
				payload: {
					userId: parseInt(data.userId),
					role: data.role,
					isPrimary: data.isPrimary,
				},
			});
			toast.success("Assignee added successfully");
			setShowAddDialog(false);
			form.reset();
		} catch {
			toast.error("Failed to add assignee");
		}
	};

	const handleRemoveAssignee = async (userId: number) => {
		try {
			await removeAssignee.mutateAsync({ taskId: task.taskId, userId });
			toast.success("Assignee removed successfully");
		} catch {
			toast.error("Failed to remove assignee");
		}
	};

	const handleOpenChange = (open: boolean) => {
		setShowAddDialog(open);
		if (!open) {
			form.reset();
		}
	};

	const groupedAssignees = {
		[AssigneeRole.LEAD]: assignees.filter((a) => a.role === AssigneeRole.LEAD),
		[AssigneeRole.DEVELOPER]: assignees.filter((a) => a.role === AssigneeRole.DEVELOPER),
		[AssigneeRole.REVIEWER]: assignees.filter((a) => a.role === AssigneeRole.REVIEWER),
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium">Team Members</h4>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowAddDialog(true)}
				>
					<Plus className="h-4 w-4 mr-1" />
					Add
				</Button>
			</div>

			{assignees.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p className="text-sm">No team members assigned yet</p>
				</div>
			) : (
				<div className="space-y-4">
					{Object.entries(groupedAssignees).map(([role, members]) => {
						if (members.length === 0) return null;
						const RoleIcon = roleIcons[role as AssigneeRole];

						return (
							<div key={role}>
								<div className="flex items-center gap-2 mb-2">
									<RoleIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-xs font-medium text-muted-foreground uppercase">{AssigneeRoleLabels[role as AssigneeRole]}s</span>
								</div>
								<div className="space-y-2">
									{members.map((assignee) => (
										<AssigneeCard
											key={assignee.assigneeId}
											assignee={assignee}
											onRemove={() => handleRemoveAssignee(assignee.userId)}
											isRemoving={removeAssignee.isPending}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Add Assignee Dialog */}
			<FormDialog
				open={showAddDialog}
				onOpenChange={handleOpenChange}
				title="Add Team Member"
				submitLabel="Add Member"
				onSubmit={form.handleSubmit(handleAddAssignee)}
				isLoading={addAssignee.isPending}
				isSubmitDisabled={!form.formState.isValid}
			>
				<Form {...form}>
					<div className="space-y-4 py-4">
						<FormSelect
							control={form.control}
							name="userId"
							label="Member"
							placeholder="Select a member"
							options={memberOptions}
						/>

						<FormSelect
							control={form.control}
							name="role"
							label="Role"
							options={ROLE_OPTIONS}
						/>

						<FormSwitch
							control={form.control}
							name="isPrimary"
							label="Primary Assignee"
							description="Mark this member as the primary assignee"
						/>
					</div>
				</Form>
			</FormDialog>
		</div>
	);
}

function AssigneeCard({ assignee, onRemove, isRemoving }: { assignee: TaskAssignee; onRemove: () => void; isRemoving: boolean }) {
	const RoleIcon = roleIcons[assignee.role];

	return (
		<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
			<div className="flex items-center gap-3">
				<Avatar className="h-8 w-8">
					<AvatarFallback className="text-xs">{assignee.user?.name?.charAt(0) || "?"}</AvatarFallback>
				</Avatar>
				<div>
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">{assignee.user?.name || "Unknown"}</span>
						{assignee.isPrimary && (
							<Badge
								variant="secondary"
								className="text-xs"
							>
								Primary
							</Badge>
						)}
					</div>
					<div className="flex items-center gap-2 mt-0.5">
						<Badge
							variant="outline"
							className={cn("text-xs", roleColors[assignee.role])}
						>
							<RoleIcon className="h-3 w-3 mr-1" />
							{AssigneeRoleLabels[assignee.role]}
						</Badge>
						{assignee.pointsEarned !== 0 && (
							<span className={cn("text-xs", assignee.pointsEarned > 0 ? "text-green-600" : "text-red-600")}>
								{assignee.pointsEarned > 0 ? "+" : ""}
								{assignee.pointsEarned} pts
							</span>
						)}
					</div>
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onClick={onRemove}
				disabled={isRemoving}
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
}
