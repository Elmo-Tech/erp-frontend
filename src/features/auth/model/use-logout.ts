"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/entities/user/model/auth.store";

export function useLogout() {
	const router = useRouter();
	const logout = useAuthStore((state) => state.logout);

	return useMutation({
		mutationFn: () => authApi.logout(),
		onSuccess: () => {
			logout();
			router.push("/login");
		},
		onError: () => {
			// Even if API fails, clear local state
			logout();
			router.push("/login");
		},
	});
}
