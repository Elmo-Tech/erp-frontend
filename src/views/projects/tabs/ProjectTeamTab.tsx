"use client";

/**
 * ProjectTeamTab
 *
 * Renders project members through the shared DataTable.
 *
 * Role values come from the backend ProjectRole enum:
 *   manager | tech_lead | developer | qa | designer
 */

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { usePermissionGate } from "@/shared/ui/Can";
import { cn } from "@/shared/lib/utils";
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember } from "@/features/projects/api/execution.api";
import { useGetInternalUsers } from "@/entities/user/api/user.api";
import type { ProjectMemberResource } from "@/features/projects/api/execution.api";

// ─────────────────────────────────────────────────────────────────────────────
// Add Member form schema
// ─────────────────────────────────────────────────────────────────────────────

const MEMBER_ROLE_OPTIONS = [
	{ value: "manager", label: "Manager" },
	{ value: "tech_lead", label: "Tech Lead" },
	{ value: "developer", label: "Developer" },
	{ value: "qa", label: "QA" },
	{ value: "designer", label: "Designer" },
];

const addMemberSchema = z.object({
	userId: z.string().min(1, "Please select a user"),
	role: z.string().min(1, "Please select a role"),
});
type AddMemberFormData = z.infer<typeof addMemberSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Role label + colour map — mirrors backend ProjectRole enum
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
	manager: {
		label: "Manager",
		className: "bg-violet-50 text-violet-700 border-violet-200",
	},
	tech_lead: {
		label: "Tech Lead",
		className: "bg-blue-50 text-blue-700 border-blue-200",
	},
	developer: {
		label: "Developer",
		className: "bg-emerald-50 text-emerald-700 border-emerald-200",
	},
	qa: {
		label: "QA",
		className: "bg-amber-50 text-amber-700 border-amber-200",
	},
	designer: {
		label: "Designer",
		className: "bg-pink-50 text-pink-700 border-pink-200",
	},
};

function getRoleConfig(role: string) {
	return (
		ROLE_CONFIG[role.toLowerCase()] ?? {
			label: role,
			className: "bg-gray-50 text-gray-700 border-gray-200",
		}
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
	return name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────────────────────────────────────

const projectTeamColumns: Column<ProjectMemberResource>[] = [
	{
		key: "member",
		header: "Member",
		render: (member) => {
			const user = member.user;
			const name = user?.name ?? `User #${member.userId}`;

			return (
				<div className="flex min-w-0 items-center gap-3">
					<Avatar className="size-8 shrink-0">
						{user?.avatar && (
							<AvatarImage
								src={user.avatar}
								alt={name}
							/>
						)}
						<AvatarFallback className="text-xs font-medium">{getInitials(name)}</AvatarFallback>
					</Avatar>
					<span className="truncate font-medium">{name}</span>
				</div>
			);
		},
	},
	{
		key: "email",
		header: "Email",
		render: (member) => <span className="text-sm text-muted-foreground">{member.user?.email ?? "—"}</span>,
	},
	{
		key: "role",
		header: "Role",
		render: (member) => {
			const roleConfig = getRoleConfig(member.role);

			return (
				<Badge
					variant="outline"
					className={cn("rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide", roleConfig.className)}
				>
					{roleConfig.label}
				</Badge>
			);
		},
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectTeamTabProps {
	projectId: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
	const { canAny } = usePermissionGate();
	const [dialogOpen, setDialogOpen] = useState(false);
	const membersQuery = useProjectMembers(projectId);
	const addMember = useAddProjectMember();
	const removeMember = useRemoveProjectMember();
	const usersQuery = useGetInternalUsers(dialogOpen);
	const canAddProjectMembers = canAny(["add_project_members", "manage_project_members"]);
	const canRemoveProjectMembers = canAny(["remove_project_members", "manage_project_members"]);

	const form = useForm<AddMemberFormData>({
		resolver: zodResolver(addMemberSchema),
		defaultValues: { userId: "", role: "developer" },
	});

	const userOptions = useMemo(
		() =>
			(usersQuery.data?.users ?? []).map((u) => ({
				value: String(u.id),
				label: u.name,
			})),
		[usersQuery.data?.users],
	);

	const handleOpenDialog = useCallback(() => {
		form.reset({ userId: "", role: "developer" });
		setDialogOpen(true);
	}, [form]);

	const handleRemoveMember = useCallback(
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

	const handleSubmit = form.handleSubmit(async (data) => {
		try {
			await addMember.mutateAsync({
				projectId,
				payload: { userId: Number(data.userId), role: data.role },
			});
			toast.success("Team member added.");
			setDialogOpen(false);
			form.reset();
		} catch {
			toast.error("Failed to add team member.");
		}
	});

	const members = membersQuery.data ?? [];

	return (
		<>
			<DataTable
				title="Team Members"
				titleBadge={membersQuery.data ? String(members.length) : undefined}
				columns={projectTeamColumns}
				data={members}
				keyExtractor={(member) => member.memberId}
				isLoading={membersQuery.isLoading}
				error={membersQuery.error}
				emptyState={{
					icon: Users,
					title: "No team members yet",
					description: "Assign team members to this project to track who is working on it.",
					action: canAddProjectMembers ? { label: "Add Member", onClick: handleOpenDialog } : undefined,
				}}
				headerActions={
					canAddProjectMembers ? (
						<Button
							size="sm"
							onClick={handleOpenDialog}
						>
							<UserPlus className="size-4" />
							Add Member
						</Button>
					) : null
				}
				rowActions={
					canRemoveProjectMembers
						? (member) => {
								const name = member.user?.name ?? `User #${member.userId}`;

								return (
									<Button
										variant="ghost"
										size="icon-sm"
										className="text-muted-foreground hover:text-destructive"
										onClick={() => void handleRemoveMember(member)}
										disabled={removeMember.isPending}
										aria-label={`Remove ${name} from project`}
									>
										<Trash2 className="size-4" />
									</Button>
								);
							}
						: undefined
				}
			/>

			{canAddProjectMembers && (
				<FormDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					title="Add Team Member"
					description="Assign an internal user to this project with a specific role."
					submitLabel="Add Member"
					isLoading={addMember.isPending}
					isSubmitDisabled={usersQuery.isLoading}
					onSubmit={handleSubmit}
					size="sm"
				>
					<Form {...form}>
						<div className="flex flex-col gap-4">
							<FormCombobox
								control={form.control}
								name="userId"
								label="User"
								placeholder={usersQuery.isLoading ? "Loading users…" : "Select a user…"}
								searchPlaceholder="Search by name…"
								emptyText="No users found."
								options={userOptions}
								disabled={usersQuery.isLoading}
							/>
							<FormSelect
								control={form.control}
								name="role"
								label="Project role"
								placeholder="Select a role"
								options={MEMBER_ROLE_OPTIONS}
							/>
						</div>
					</Form>
				</FormDialog>
			)}
		</>
	);
}
