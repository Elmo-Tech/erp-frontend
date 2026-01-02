/**
 * Profile API
 * API functions for user profile management
 */

import api from "@/lib/axios";
import { ProfileResponse, UpdateProfilePayload, UpdateProfileResponse, UpdateAvatarApiResponse } from "../types";

export const profileApi = {
	/**
	 * Get current user profile
	 * GET /api/v1/auth/profile
	 */
	getProfile: async (): Promise<ProfileResponse> => {
		const response = await api.get<ProfileResponse>("/auth/profile");
		return response.data;
	},

	/**
	 * Update user profile
	 * PUT /api/v1/auth/profile
	 */
	updateProfile: async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
		const response = await api.put<UpdateProfileResponse>("/auth/profile", payload);
		return response.data;
	},

	/**
	 * Upload user avatar
	 * POST /api/v1/auth/profile/avatar
	 */
	updateAvatar: async (file: File): Promise<UpdateAvatarApiResponse> => {
		const formData = new FormData();
		formData.append("avatar", file);

		const response = await api.post<UpdateAvatarApiResponse>("/auth/profile/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	},
};
