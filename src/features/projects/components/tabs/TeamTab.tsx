"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable, Column, ConfirmDialog } from "@/components/shared";
import { useProjectMembers, useRemoveProjectMember, useUpdateProjectMember } from "../../hooks/useProjectMembers";
import { ProjectMember, MemberRole, MEMBER_ROLES } from "../../types/projectMember";
import { AddMemberDialog } from "./AddMemberDialog";
import { Users, Plus, MoreHorizontal, UserMinus, Shield } from "lucide-react";
import { toast } from "sonner";

interface TeamTabProps {
	projectId: number;
}

export function TeamTab({ projectId }: TeamTabProps) {
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

	const { data, isLoading, error } = useProjectMembers(projectId);
	const removeMember = useRemoveProjectMember();
	const updateMember = useUpdateProjectMember();

	const handleRemoveMember = async () => {
		if (!memberToRemove) return;

		try {
			await removeMember.mutateAsync({
				projectId,
				memberId: memberToRemove.memberId,
			});
			toast.success("Member removed successfully");
			setMemberToRemove(null);
		} catch {
			toast.error("Failed to remove member");
		}
	};

	const handleUpdateRole = async (memberId: number, role: MemberRole) => {
		try {
			await updateMember.mutateAsync({
				projectId,
				memberId,
				payload: { role },
			});
			toast.success("Role updated successfully");
		} catch {
			toast.error("Failed to update role");
		}
	};

	const getRoleBadgeVariant = (role: MemberRole): "default" | "secondary" | "outline" => {
		switch (role) {
			case "lead":
				return "default";
			case "reviewer":
				return "secondary";
			default:
				return "outline";
		}
	};

	const columns: Column<ProjectMember>[] = [
		{
			key: "user",
			header: "Member",
			render: (member) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-9 w-9">
						<AvatarImage src={member.user?.avatar} />
						<AvatarFallback>{member.user?.name?.charAt(0) || "?"}</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">{member.user?.name || "Unknown"}</p>
						<p className="text-sm text-muted-foreground">{member.user?.email || ""}</p>
					</div>
				</div>
			),
		},
		{
			key: "role",
			header: "Role",
			render: (member) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-0"
						>
							<Badge
								variant={getRoleBadgeVariant(member.role)}
								className="cursor-pointer"
							>
								{MEMBER_ROLES.find((r) => r.value === member.role)?.label || member.role}
							</Badge>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{MEMBER_ROLES.map((role) => (
							<DropdownMenuItem
								key={role.value}
								onClick={() => handleUpdateRole(member.memberId, role.value)}
								disabled={member.role === role.value || updateMember.isPending}
							>
								<Shield className="h-4 w-4 mr-2" />
								{role.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
		{
			key: "createdAt",
			header: "Joined",
			render: (member) => new Date(member.createdAt).toLocaleDateString(),
		},
		{
			key: "actions",
			header: "",
			render: (member) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => setMemberToRemove(member)}
							className="text-destructive"
						>
							<UserMinus className="h-4 w-4 mr-2" />
							Remove from project
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<>
			<DataTable
				title="Team Members"
				titleBadge={data?.members ? `${data.members.length} members` : undefined}
				columns={columns}
				data={data?.members || []}
				keyExtractor={(member) => member.memberId}
				isLoading={isLoading}
				error={error}
				emptyState={{
					icon: Users,
					title: "No team members",
					description: "Add team members to start collaborating on this project.",
					action: { label: "Add Member", onClick: () => setShowAddDialog(true) },
				}}
				headerActions={
					<Button onClick={() => setShowAddDialog(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Member
					</Button>
				}
			/>

			<AddMemberDialog
				projectId={projectId}
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				existingMemberIds={data?.members?.map((m) => m.userId) || []}
			/>

			<ConfirmDialog
				open={!!memberToRemove}
				onOpenChange={() => setMemberToRemove(null)}
				title="Remove Team Member"
				description={`Are you sure you want to remove ${memberToRemove?.user?.name} from this project?`}
				confirmLabel="Remove"
				onConfirm={handleRemoveMember}
				variant="destructive"
				isLoading={removeMember.isPending}
			/>
		</>
	);
}
