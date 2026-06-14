"use client";

import { Trash2, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { cn } from "@/shared/lib/utils";
import type { ProjectMemberResource } from "@/features/projects/api/execution.api";
import { getProjectMemberInitials, getProjectMemberRoleConfig } from "../model/project-team";

interface ProjectTeamTableProps {
	members: ProjectMemberResource[];
	isLoading: boolean;
	error: Error | null;
	canAddProjectMembers: boolean;
	canRemoveProjectMembers: boolean;
	isRemovingMember: boolean;
	onAddMember: () => void;
	onRemoveMember: (member: ProjectMemberResource) => void;
}

function getProjectMemberName(member: ProjectMemberResource): string {
	return member.user?.name ?? `User #${member.userId}`;
}

const projectTeamColumns: Column<ProjectMemberResource>[] = [
	{
		key: "member",
		header: "Member",
		render: (member) => {
			const memberName = getProjectMemberName(member);

			return (
				<div className="flex min-w-0 items-center gap-3">
					<Avatar className="size-8 shrink-0">
						{member.user?.avatar && (
							<AvatarImage
								src={member.user.avatar}
								alt={memberName}
							/>
						)}
						<AvatarFallback className="text-xs font-medium">{getProjectMemberInitials(memberName)}</AvatarFallback>
					</Avatar>
					<span className="truncate font-medium">{memberName}</span>
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
			const roleConfig = getProjectMemberRoleConfig(member.role);

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

export function ProjectTeamTable({
	members,
	isLoading,
	error,
	canAddProjectMembers,
	canRemoveProjectMembers,
	isRemovingMember,
	onAddMember,
	onRemoveMember,
}: ProjectTeamTableProps) {
	return (
		<DataTable
			title="Team Members"
			titleBadge={!isLoading && !error ? String(members.length) : undefined}
			columns={projectTeamColumns}
			data={members}
			keyExtractor={(member) => member.memberId}
			isLoading={isLoading}
			error={error}
			emptyState={{
				icon: Users,
				title: "No team members yet",
				description: "Assign team members to this project to track who is working on it.",
				action: canAddProjectMembers ? { label: "Add Member", onClick: onAddMember } : undefined,
			}}
			headerActions={
				canAddProjectMembers ? (
					<Button
						size="sm"
						onClick={onAddMember}
					>
						<UserPlus className="size-4" />
						Add Member
					</Button>
				) : null
			}
			rowActions={
				canRemoveProjectMembers
					? (member) => (
							<Button
								variant="ghost"
								size="icon-sm"
								className="text-muted-foreground hover:text-destructive"
								onClick={() => onRemoveMember(member)}
								disabled={isRemovingMember}
								aria-label={`Remove ${getProjectMemberName(member)} from project`}
							>
								<Trash2 className="size-4" />
							</Button>
						)
					: undefined
			}
		/>
	);
}
