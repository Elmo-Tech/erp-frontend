/**
 * Profile Hooks
 * React Query hooks for profile management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api";
import { UpdateProfilePayload } from "../types";
import { useAuthStore } from "@/_old/store/authStore";
import { toast } from "sonner";

const PROFILE_QUERY_KEY = "profile";

/**
 * Hook to fetch current user profile
 */
export const useProfile = () => {
	return useQuery({
		queryKey: [PROFILE_QUERY_KEY],
		queryFn: profileApi.getProfile,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	const updateUser = useAuthStore((state) => state.updateUser);

	return useMutation({
		mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
		onSuccess: (response) => {
			// Update auth store
			updateUser({ name: response.data.profile.name });
			// Invalidate profile query
			queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
			toast.success("Profile updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to update profile", {
				description: error.message,
			});
		},
	});
};

/**
 * Hook to upload user avatar
 */
export const useUpdateAvatar = () => {
	const queryClient = useQueryClient();
	const updateUser = useAuthStore((state) => state.updateUser);

	return useMutation({
		mutationFn: (file: File) => profileApi.updateAvatar(file),
		onSuccess: (response) => {
			// Update auth store
			updateUser({ avatar: response.data.avatar });
			// Invalidate profile query
			queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
			toast.success("Avatar updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to upload avatar", {
				description: error.message,
			});
		},
	});
};
