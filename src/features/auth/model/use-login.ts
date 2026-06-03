"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type { ApiError, LoginRequest, LoginResponse } from "./types";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { AxiosError } from "axios";

export function useLogin() {
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
				expiresIn: tokenDetails.expiresIn,
				role,
				permissions,
			});

			window.location.href = "/dashboard/my-workspace";
		},
		onError: (error: AxiosError<ApiError>) => {
			console.error("Login failed:", error.response?.data?.message);
		},
	});
}
