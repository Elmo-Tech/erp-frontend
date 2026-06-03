import api, { clearClientAuthState } from "@/shared/api/base";
import type { LoginRequest, LoginResponse } from "../model/types";

export const authApi = {
	login: async (data: LoginRequest): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>("/auth/login", data);
		return response.data;
	},

	logout: async (): Promise<void> => {
		try {
			await api.post("/auth/logout");
		} finally {
			clearClientAuthState();
		}
	},

	getProfile: async () => {
		const response = await api.get("/auth/profile");
		return response.data;
	},
};
