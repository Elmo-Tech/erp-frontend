export type MemberRole = "lead" | "member" | "reviewer";

export interface ProjectMember {
	memberId: number;
	projectId: number;
	userId: number;
	role: MemberRole;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string;
	};
	createdAt: string;
}

export interface CreateProjectMemberPayload {
	userId: number;
	role?: MemberRole;
}

export interface UpdateProjectMemberPayload {
	role: MemberRole;
}

export interface ProjectMemberListResponse {
	members: ProjectMember[];
}

export const MEMBER_ROLES: { value: MemberRole; label: string }[] = [
	{ value: "lead", label: "Lead" },
	{ value: "member", label: "Member" },
	{ value: "reviewer", label: "Reviewer" },
];
