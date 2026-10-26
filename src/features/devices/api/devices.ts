import api from "@/lib/axios";
import {
	Device,
	DeviceConnectionInfo,
	DeviceEventPage,
	DeviceFormData,
	DevicePushResult,
} from "../types/device";

export const devicesApi = {
	getAll: async (): Promise<Device[]> => {
		const response = await api.get("/devices");
		return response.data.data;
	},

	getOne: async (deviceId: number): Promise<Device> => {
		const response = await api.get(`/devices/${deviceId}`);
		return response.data.data;
	},

	create: async (data: DeviceFormData): Promise<Device> => {
		const response = await api.post("/devices", data);
		return response.data.data;
	},

	update: async (deviceId: number, data: Partial<DeviceFormData>): Promise<Device> => {
		const response = await api.put(`/devices/${deviceId}`, data);
		return response.data.data;
	},

	remove: async (deviceId: number): Promise<void> => {
		await api.delete(`/devices/${deviceId}`);
	},

	testConnection: async (deviceId: number): Promise<DeviceConnectionInfo> => {
		const response = await api.post(`/devices/${deviceId}/test`, undefined, { skipSuccessToast: true });
		return response.data.data;
	},

	poll: async (deviceId: number): Promise<{ ingested: number; skipped: number }> => {
		const response = await api.post(`/devices/${deviceId}/poll`, undefined, { skipSuccessToast: true });
		return response.data.data;
	},

	pushUsers: async (deviceId: number): Promise<DevicePushResult> => {
		const response = await api.post(`/devices/${deviceId}/users/push`, undefined, { skipSuccessToast: true });
		return response.data.data;
	},

	pullUsers: async (deviceId: number): Promise<{ users: Record<string, unknown>[] }> => {
		const response = await api.get(`/devices/${deviceId}/users/pull`);
		return response.data.data;
	},

	linkUser: async (deviceId: number, userId: number) => {
		const response = await api.post(`/devices/${deviceId}/users`, { userId });
		return response.data.data;
	},

	unlinkUser: async (deviceId: number, deviceUserId: number): Promise<void> => {
		await api.delete(`/devices/${deviceId}/users/${deviceUserId}`);
	},

	getEvents: async (deviceId: number, page = 1, perPage = 25): Promise<DeviceEventPage> => {
		const response = await api.get(`/devices/${deviceId}/events`, { params: { page, perPage } });
		return response.data.data;
	},

	enableWebhook: async (deviceId: number): Promise<{ url: string }> => {
		const response = await api.post(`/devices/${deviceId}/webhook/enable`);
		return response.data.data;
	},

	disableWebhook: async (deviceId: number): Promise<void> => {
		await api.post(`/devices/${deviceId}/webhook/disable`);
	},
};
