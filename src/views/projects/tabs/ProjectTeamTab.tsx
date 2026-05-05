"use client";

/**
 * ProjectTeamTab
 *
 * Renders a responsive grid of team member cards.
 * Each card shows: Avatar · Name · Email · Role badge.
 *
 * Role values come from the backend ProjectRole enum:
 *   manager | tech_lead | developer | qa | designer
 */

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/data-display/EmptyState";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { FormCombobox } from "@/shared/ui/forms/FormCombobox";
import { FormSelect } from "@/shared/ui/forms/FormSelect";
import { cn } from "@/shared/lib/utils";
import { useProjectMembers, useAddProjectMember } from "@/features/projects/api/execution.api";
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
// Member card
// ─────────────────────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: ProjectMemberResource }) {
	const user = member.user;
	const name = user?.name ?? `User #${member.userId}`;
	const email = user?.email ?? "";
	const roleConfig = getRoleConfig(member.role);

	return (
		<Card className="gap-0 py-0 transition-shadow hover:shadow-md">
			<CardContent className="flex items-center gap-4 px-4 py-4">
				<Avatar className="size-10 shrink-0">
					{user?.avatar && (
						<AvatarImage
							src={user.avatar}
							alt={name}
						/>
					)}
					<AvatarFallback className="text-sm font-medium">{getInitials(name)}</AvatarFallback>
				</Avatar>

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="truncate text-sm font-semibold">{name}</p>
						<Badge
							variant="outline"
							className={cn("shrink-0 rounded-sm border px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide", roleConfig.className)}
						>
							{roleConfig.label}
						</Badge>
					</div>
					{email && <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>}
				</div>
			</CardContent>
		</Card>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function TeamSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card
					key={i}
					className="gap-0 py-0"
				>
					<CardContent className="flex items-center gap-4 px-4 py-4">
						<Skeleton className="size-10 shrink-0 rounded-full" />
						<div className="flex flex-1 flex-col gap-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

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
	const [dialogOpen, setDialogOpen] = useState(false);
	const membersQuery = useProjectMembers(projectId);
	const addMember = useAddProjectMember();
	const usersQuery = useGetInternalUsers(dialogOpen);

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

	if (membersQuery.isLoading) {
		return <TeamSkeleton />;
	}

	if (membersQuery.error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{membersQuery.error.message ?? "Failed to load team members."}</AlertDescription>
			</Alert>
		);
	}

	const members = membersQuery.data ?? [];

	return (
		<>
			{/* ── Tab action header ──────────────────────────────────────────── */}
			<div className="mb-4 flex items-center justify-between gap-3">
				<p className="text-sm text-muted-foreground">
					{members.length} {members.length === 1 ? "member" : "members"}
				</p>
				<Button
					size="sm"
					onClick={handleOpenDialog}
				>
					<UserPlus className="size-4" />
					Add Member
				</Button>
			</div>

			{members.length === 0 ? (
				<EmptyState
					icon={Users}
					title="No team members yet"
					description="Assign team members to this project to track who is working on it."
					action={{ label: "Add Member", onClick: handleOpenDialog }}
				/>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{members.map((member) => (
						<MemberCard
							key={member.memberId}
							member={member}
						/>
					))}
				</div>
			)}

			{/* ── Add Member dialog ──────────────────────────────────────────── */}
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
		</>
	);
}
