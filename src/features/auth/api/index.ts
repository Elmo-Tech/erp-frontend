import api from "@/lib/axios";
import { LoginRequest, LoginResponse } from "../types";

export const authApi = {
	login: async (data: LoginRequest): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>("/auth/login", data);
		return response.data;
	},

	logout: async (): Promise<void> => {
		if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
			try {
				const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
				const subscription = await registration?.pushManager.getSubscription();
				if (subscription) {
					try {
						await api.delete("/notifications/push-subscriptions", { data: { endpoint: subscription.endpoint }, skipErrorToast: true });
					} finally {
						await subscription.unsubscribe();
					}
				}
			} catch { /* Sign-out remains available if desktop push is unavailable. */ }
		}
		await api.post("/auth/logout");
	},

	getProfile: async () => {
		const response = await api.get("/auth/profile");
		return response.data;
	},
};
