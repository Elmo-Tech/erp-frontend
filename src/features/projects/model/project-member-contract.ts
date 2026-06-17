export interface ProjectMemberResource {
	memberId: number;
	projectId: number;
	userId: number;
	role: string;
	user?: {
		userId: number;
		name: string;
		email: string;
		avatar?: string | null;
	} | null;
	createdAt: string;
}

export type RawProjectMemberResource = ProjectMemberResource & {
	internalCostRate?: unknown;
	permissions?: unknown;
};

export interface ProjectMemberListData {
	members: RawProjectMemberResource[];
}

export interface AddMemberPayload {
	userId: number;
	role: string;
}

export function mapProjectMemberResource(resource: RawProjectMemberResource): ProjectMemberResource {
	return {
		memberId: resource.memberId,
		projectId: resource.projectId,
		userId: resource.userId,
		role: resource.role,
		user: resource.user,
		createdAt: resource.createdAt,
	};
}

export function mapProjectMemberListData(memberListData: ProjectMemberListData): ProjectMemberResource[] {
	return memberListData.members.map(mapProjectMemberResource);
}
