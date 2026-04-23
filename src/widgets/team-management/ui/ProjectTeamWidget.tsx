"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Shield, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { employeeApi } from "@/entities/employee/api/employee.api";
import { employeeKeys } from "@/entities/employee/model/query-keys";
import { PROJECT_MEMBER_ROLES, type ProjectMember, type ProjectMemberRole } from "@/entities/employee/model/types";
import { EmployeeAvatar } from "@/entities/employee/ui/EmployeeAvatar";
import { useEmployeePermissions } from "@/entities/user/model/permissions";
import { useRemoveProjectMember, useUpdateProjectMember } from "@/features/employees/model/use-employee-actions";
import { AddProjectMemberForm } from "@/features/employees/ui/AddProjectMemberForm";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ProjectTeamWidgetProps {
	projectId: number;
	className?: string;
}

function getRoleLabel(role: ProjectMemberRole | string) {
	return PROJECT_MEMBER_ROLES.find((item) => item.value === role)?.label ?? role;
}

export function ProjectTeamWidget({ projectId, className }: ProjectTeamWidgetProps) {
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
	const { canManageProjectMembers, canViewProjectMembers, canAddProjectMembers, canRemoveProjectMembers } = useEmployeePermissions();
	const canView = canManageProjectMembers || canViewProjectMembers;
	const canAdd = canManageProjectMembers || canAddProjectMembers;
	const canRemove = canManageProjectMembers || canRemoveProjectMembers;
	const updateProjectMember = useUpdateProjectMember();
	const removeProjectMember = useRemoveProjectMember();

	const membersQuery = useQuery({
		queryKey: employeeKeys.projectMembers(projectId),
		queryFn: () => employeeApi.getProjectMembers(projectId),
		enabled: canView && Boolean(projectId),
		staleTime: 5 * 60 * 1000,
	});

	const members = membersQuery.data?.members ?? [];

	const handleUpdateRole = async (member: ProjectMember, role: ProjectMemberRole) => {
		if (member.role === role || updateProjectMember.isPending) {
			return;
		}

		try {
			await updateProjectMember.mutateAsync({
				projectId,
				memberId: member.memberId,
				payload: { role },
			});
			toast.success("Project role updated");
		} catch {
			toast.error("Failed to update project role");
		}
	};

	const handleConfirmRemove = async () => {
		if (!memberToRemove) {
			return;
		}

		try {
			await removeProjectMember.mutateAsync({ projectId, memberId: memberToRemove.memberId });
			toast.success("Team member removed");
			setMemberToRemove(null);
		} catch {
			toast.error("Failed to remove team member");
		}
	};

	if (!canView) {
		return (
			<section className={cn("flex min-h-48 flex-col items-center justify-center rounded-md border px-4 text-center", className)}>
				<div className="text-sm font-medium">Team is restricted</div>
				<div className="text-sm text-muted-foreground">Your account cannot view project members.</div>
			</section>
		);
	}

	return (
		<section className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<h2 className="text-lg font-semibold tracking-tight">Team</h2>
					<p className="text-sm text-muted-foreground">{membersQuery.data ? `${members.length} employees assigned to this project` : "Project members and roles"}</p>
				</div>

				{canAdd && (
					<Button
						size="sm"
						onClick={() => setAddDialogOpen(true)}
					>
						<Plus data-icon="inline-start" />
						Add member
					</Button>
				)}
			</div>

			<div className="overflow-hidden rounded-md border bg-background">
				<div className="hidden border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(180px,1.4fr)_120px_120px_40px] md:items-center md:gap-3">
					<span>Member</span>
					<span>Project role</span>
					<span>Joined</span>
					<span className="sr-only">Actions</span>
				</div>

				{membersQuery.isLoading ? (
					<ProjectMemberRowsSkeleton />
				) : membersQuery.error ? (
					<div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 text-center">
						<div className="text-sm font-medium">Unable to load team</div>
						<div className="text-sm text-muted-foreground">{membersQuery.error.message}</div>
					</div>
				) : members.length === 0 ? (
					<div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
						<Users className="size-6 text-muted-foreground" />
						<div className="flex flex-col gap-1">
							<div className="text-sm font-medium">No team members</div>
							<div className="text-sm text-muted-foreground">Assign employees to start project collaboration.</div>
						</div>
						{canAdd && (
							<Button
								size="sm"
								variant="outline"
								onClick={() => setAddDialogOpen(true)}
							>
								<Plus data-icon="inline-start" />
								Add member
							</Button>
						)}
					</div>
				) : (
					members.map((member) => (
						<ProjectMemberRow
							key={member.memberId}
							member={member}
							canManageRole={canManageProjectMembers}
							canRemove={canRemove}
							onUpdateRole={handleUpdateRole}
							onRemove={setMemberToRemove}
						/>
					))
				)}
			</div>

			<AddProjectMemberForm
				projectId={projectId}
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				existingMemberIds={members.map((member) => member.userId)}
			/>

			<ConfirmDialog
				open={Boolean(memberToRemove)}
				onOpenChange={(open) => {
					if (!open) {
						setMemberToRemove(null);
					}
				}}
				title="Remove team member"
				description={
					<span>
						Remove <span className="font-medium text-foreground">{memberToRemove?.user?.name || "this employee"}</span> from this project?
					</span>
				}
				confirmLabel="Remove"
				variant="destructive"
				onConfirm={handleConfirmRemove}
				isLoading={removeProjectMember.isPending}
			/>
		</section>
	);
}

function ProjectMemberRow({
	member,
	canManageRole,
	canRemove,
	onUpdateRole,
	onRemove,
}: {
	member: ProjectMember;
	canManageRole: boolean;
	canRemove: boolean;
	onUpdateRole: (member: ProjectMember, role: ProjectMemberRole) => void;
	onRemove: (member: ProjectMember) => void;
}) {
	const memberName = member.user?.name || `Employee #${member.userId}`;

	return (
		<article className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 text-sm last:border-b-0 md:grid-cols-[minmax(180px,1.4fr)_120px_120px_40px] md:items-center md:gap-3">
			<div className="flex min-w-0 items-center gap-3">
				<EmployeeAvatar
					name={memberName}
					src={member.user?.avatar}
				/>
				<div className="min-w-0">
					<div className="truncate font-medium leading-5">{memberName}</div>
					<div className="truncate text-xs text-muted-foreground">{member.user?.email || "No email"}</div>
				</div>
			</div>

			<div>
				{canManageRole ? (
					<ProjectMemberRoleMenu
						member={member}
						onUpdateRole={onUpdateRole}
					/>
				) : (
					<RoleBadge role={member.role} />
				)}
			</div>

			<div className="text-xs tabular-nums text-muted-foreground">{new Date(member.createdAt).toLocaleDateString()}</div>

			<div className="flex justify-end">
				{canRemove && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={`Open actions for ${memberName}`}
							>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuGroup>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => onRemove(member)}
								>
									<UserMinus data-icon="inline-start" />
									Remove
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</article>
	);
}

function ProjectMemberRoleMenu({ member, onUpdateRole }: { member: ProjectMember; onUpdateRole: (member: ProjectMember, role: ProjectMemberRole) => void }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-auto justify-start p-0"
				>
					<RoleBadge role={member.role} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuGroup>
					{PROJECT_MEMBER_ROLES.map((role) => (
						<DropdownMenuItem
							key={role.value}
							disabled={role.value === member.role}
							onClick={() => onUpdateRole(member, role.value)}
						>
							<Shield data-icon="inline-start" />
							{role.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function RoleBadge({ role }: { role: ProjectMemberRole | string }) {
	return (
		<Badge
			variant="outline"
			className="rounded-sm px-1.5 py-0 font-mono text-[11px] uppercase"
		>
			{getRoleLabel(role)}
		</Badge>
	);
}

function ProjectMemberRowsSkeleton() {
	return (
		<div className="flex flex-col">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="grid min-h-14 grid-cols-1 gap-2 border-b px-3 py-2.5 last:border-b-0 md:grid-cols-[minmax(180px,1.4fr)_120px_120px_40px] md:items-center md:gap-3"
				>
					<div className="flex items-center gap-3">
						<Skeleton className="size-8 rounded-full" />
						<div className="flex flex-col gap-1">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-3 w-44" />
						</div>
					</div>
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="size-8" />
				</div>
			))}
		</div>
	);
}
