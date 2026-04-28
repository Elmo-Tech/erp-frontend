"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import type { ApiError, LoginRequest, LoginResponse } from "./types";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { AxiosError } from "axios";

export function useLogin() {
	const router = useRouter();
	const setAuth = useAuthStore((state) => state.setAuth);

	return useMutation<LoginResponse, AxiosError<ApiError>, LoginRequest>({
		mutationFn: (data: LoginRequest) => authApi.login(data),
		onSuccess: (response) => {
			const { tokenDetails, profile, role, permissions } = response.data;

			setAuth({
				user: {
					userId: profile.userId,
					name: profile.name,
					email: profile.email,
					avatar: profile.avatar,
					role: role,
				},
				token: tokenDetails.token,
				expiresIn: tokenDetails.expiresIn,
				role,
				permissions,
			});

			// Redirect based on role
			if (role === "client") {
				router.push("/client");
			} else {
				router.push("/dashboard");
			}
		},
		onError: (error: AxiosError<ApiError>) => {
			console.error("Login failed:", error.response?.data?.message);
		},
	});
}
