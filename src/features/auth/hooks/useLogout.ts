"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { useAuthStore } from "@/store/authStore";
import { useTimerStore } from "@/store/timerStore";

export function useLogout() {
	const router = useRouter();
	const logout = useAuthStore((state) => state.logout);

	const guardedLogout = async () => {
		const activeTimer = useTimerStore.getState().activeTimer;
		if (activeTimer && typeof window !== "undefined") {
			const confirmed = window.confirm(
				`You have an active timer on "${activeTimer.trackableDisplayName}". Signing out will orphan it. Stop the timer first or confirm to sign out anyway?`
			);
			if (!confirmed) return;
		}
		return authApi.logout();
	};

	return useMutation({
		mutationFn: guardedLogout,
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
