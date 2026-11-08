import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { devicesApi } from "../api/devices";
import { DeviceFormData } from "../types/device";

export const deviceKeys = {
	all: ["devices"] as const,
	list: () => [...deviceKeys.all, "list"] as const,
	detail: (deviceId: number) => [...deviceKeys.all, "detail", deviceId] as const,
	events: (deviceId: number) => [...deviceKeys.all, "events", deviceId] as const,
};

export function useDevices() {
	return useQuery({
		queryKey: deviceKeys.list(),
		queryFn: () => devicesApi.getAll(),
	});
}

export function useDevice(deviceId: number | null) {
	return useQuery({
		queryKey: deviceKeys.detail(deviceId ?? 0),
		queryFn: () => devicesApi.getOne(deviceId as number),
		enabled: deviceId !== null,
	});
}

export function useDeviceEvents(deviceId: number | null, page = 1) {
	return useQuery({
		queryKey: [...deviceKeys.events(deviceId ?? 0), page],
		queryFn: () => devicesApi.getEvents(deviceId as number, page),
		enabled: deviceId !== null,
	});
}

export function useCreateDevice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: DeviceFormData) => devicesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}

export function useUpdateDevice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deviceId, data }: { deviceId: number; data: Partial<DeviceFormData> }) =>
			devicesApi.update(deviceId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}

export function useDeleteDevice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deviceId: number) => devicesApi.remove(deviceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}

export function useTestDeviceConnection() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deviceId: number) => devicesApi.testConnection(deviceId),
		onSuccess: (info) => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
			toast.success(
				`${info.deviceName ?? "Device"} is reachable${
					info.firmware ? ` (firmware ${info.firmware})` : ""
				}`
			);
		},
	});
}

export function usePollDevice() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deviceId: number) => devicesApi.poll(deviceId),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
			toast.success(`${result.ingested} event(s) ingested from the device`);
		},
	});
}

export function usePushDeviceUsers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deviceId: number) => devicesApi.pushUsers(deviceId),
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
			toast.success(`${result.pushed} employee(s) sent to the device`);
		},
	});
}

export function useMapExistingDeviceUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ deviceId, userId, deviceEmployeeNo }: { deviceId: number; userId: number; deviceEmployeeNo: string }) => devicesApi.mapExistingUser(deviceId, userId, deviceEmployeeNo),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
	});
}

export function useLinkDeviceUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deviceId, userId }: { deviceId: number; userId: number }) =>
			devicesApi.linkUser(deviceId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}

export function useUnlinkDeviceUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ deviceId, deviceUserId }: { deviceId: number; deviceUserId: number }) =>
			devicesApi.unlinkUser(deviceId, deviceUserId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}

export function useEnableDeviceWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deviceId: number) => devicesApi.enableWebhook(deviceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}

export function useDisableDeviceWebhook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (deviceId: number) => devicesApi.disableWebhook(deviceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: deviceKeys.all });
		},
	});
}
