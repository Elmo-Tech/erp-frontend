"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "@/entities/user/api/user.api";
import { userKeys } from "@/entities/user/model/query-keys";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type { ApiMessageResponse, ChangePasswordPayload, ProfileResponse, UpdateAvatarResponse, UpdateProfilePayload, UpdateProfileResponse } from "@/entities/user/model/types";

export function useProfile() {
	return useQuery<ProfileResponse, Error>({
		queryKey: userKeys.profile(),
		queryFn: userApi.getProfile,
		staleTime: 5 * 60 * 1000,
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	const updateUser = useAuthStore((state) => state.updateUser);

	return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
		mutationFn: userApi.updateProfile,
		onSuccess: (response) => {
			updateUser({ name: response.data.profile.name });
			queryClient.invalidateQueries({ queryKey: userKeys.profile() });
			toast.success("Profile updated");
		},
	});
}

export function useUpdateAvatar() {
	const queryClient = useQueryClient();
	const updateUser = useAuthStore((state) => state.updateUser);

	return useMutation<UpdateAvatarResponse, Error, File>({
		mutationFn: userApi.updateAvatar,
		onSuccess: (response) => {
			updateUser({ avatar: response.data.avatar });
			queryClient.invalidateQueries({ queryKey: userKeys.profile() });
			toast.success("Avatar updated");
		},
	});
}

export function useChangePassword() {
	return useMutation<ApiMessageResponse, Error, ChangePasswordPayload>({
		mutationFn: userApi.changePassword,
		onSuccess: () => {
			toast.success("Password changed");
		},
	});
}
