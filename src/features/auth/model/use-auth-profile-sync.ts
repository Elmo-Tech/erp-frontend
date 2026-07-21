"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user.api";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { userKeys } from "@/entities/user/model/query-keys";

const PROFILE_STALE_TIME_MS = 60 * 1000;

export function useAuthProfileSync(enabled: boolean) {
	const currentUserId = useAuthStore((state) => state.user?.userId);
	const syncProfile = useAuthStore((state) => state.syncProfile);
	const profileQuery = useQuery({
		queryKey: userKeys.profile(currentUserId),
		queryFn: userApi.getProfile,
		enabled: enabled && currentUserId !== undefined,
		staleTime: PROFILE_STALE_TIME_MS,
		refetchOnWindowFocus: "always",
	});

	useEffect(() => {
		const profileData = profileQuery.data?.data;
		if (!profileData) return;

		syncProfile({
			user: {
				userId: profileData.profile.userId,
				name: profileData.profile.name,
				email: profileData.profile.email,
				avatar: profileData.profile.avatar,
				role: profileData.role,
			},
			role: profileData.role,
			permissions: profileData.permissions,
		});
	}, [profileQuery.data, syncProfile]);

	return profileQuery;
}
