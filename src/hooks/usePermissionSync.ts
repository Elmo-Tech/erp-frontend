"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore, type Permission } from "@/store/authStore";

export function usePermissionSync() {
	const userId = useAuthStore((state) => state.user?.userId);
	const authenticated = useAuthStore((state) => state.isAuthenticated);
	const query = useQuery({
		queryKey: ["auth-permissions", userId],
		queryFn: async () => (await api.get<{ data: { profile: { userId: number }; role: string; permissions: Permission[] } }>("/auth/profile", { skipErrorToast: true })).data.data,
		enabled: authenticated && !!userId,
		staleTime: 30_000, refetchInterval: 60_000, refetchOnWindowFocus: true,
	});
	useEffect(() => {
		if (query.data && query.data.profile.userId === useAuthStore.getState().user?.userId) {
			useAuthStore.setState({ permissions: query.data.permissions, role: query.data.role });
		}
	}, [query.data]);
}
