import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance";
import { AttendanceFilters, AttendanceFormData } from "../types/attendance";
import { toast } from "sonner";

export const attendanceKeys = {
	all: ["attendance"] as const,
	list: (filters?: AttendanceFilters, page?: number) => {
		// Serialize filters to ensure proper cache invalidation
		const filterKey = filters ? JSON.stringify(filters) : 'empty';
		return [...attendanceKeys.all, "list", filterKey, page] as const;
	},
};

export function useAttendanceList(filters?: AttendanceFilters, page = 1, perPage = 15) {
	const queryKey = attendanceKeys.list(filters, page);

	return useQuery({
		queryKey,
		queryFn: () => attendanceApi.getAll(filters, page, perPage),
		staleTime: 0,
	});
}

export function useCreateAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AttendanceFormData) => attendanceApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("Attendance record created successfully");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "Failed to create attendance record");
		},
	});
}

export function useUpdateAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceFormData> }) => attendanceApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("Attendance record updated successfully");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "Failed to update attendance record");
		},
	});
}

export function useAddAttendanceDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: {
			id: number;
			data: {
				deduction_type_id: number;
				amount: number;
				reason?: string;
				late_minutes?: number;
			};
		}) => attendanceApi.addDeduction(params.id, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("Deduction added successfully");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "Failed to add deduction");
		},
	});
}

export function useMarkGraceDay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => attendanceApi.markGraceDay(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("Grace day marked successfully");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "Failed to mark grace day");
		},
	});
}

export function useRemoveGraceDay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => attendanceApi.removeGraceDay(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("Grace day removed successfully");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "Failed to remove grace day");
		},
	});
}
