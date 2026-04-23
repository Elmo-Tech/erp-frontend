/**
 * Profile Types
 * Type definitions for user profile management
 */

export interface UserProfile {
	userId: number;
	name: string;
	email: string;
	avatar: string;
	emailVerifiedAt: string | null;
	skills: string[];
	createdAt: string;
	updatedAt: string;
}

export interface UpdateProfilePayload {
	name: string;
}

export interface UpdateAvatarResponse {
	avatar: string;
}

export interface ProfileResponse {
	success: boolean;
	message: string;
	data: {
		profile: UserProfile;
		role: string;
		permissions: Array<{
			permissionName: string;
			access: boolean;
		}>;
	};
}

export interface UpdateProfileResponse {
	success: boolean;
	message: string;
	data: {
		profile: UserProfile;
	};
}

export interface UpdateAvatarApiResponse {
	success: boolean;
	message: string;
	data: UpdateAvatarResponse;
}
