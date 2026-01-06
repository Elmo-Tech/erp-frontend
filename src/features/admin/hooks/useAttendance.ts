import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "../api/attendance";
import { AttendanceFilters, AttendanceFormData } from "../types/attendance";
import { toast } from "sonner";

export const attendanceKeys = {
	all: ["attendance"] as const,
	list: (filters?: AttendanceFilters, page?: number) => [...attendanceKeys.all, "list", filters, page] as const,
};

export function useAttendanceList(filters?: AttendanceFilters, page = 1, perPage = 15) {
	return useQuery({
		queryKey: attendanceKeys.list(filters, page),
		queryFn: () => attendanceApi.getAll(filters, page, perPage),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AttendanceFormData) => attendanceApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("تم إنشاء سجل الحضور بنجاح");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "فشل في إنشاء سجل الحضور");
		},
	});
}

export function useUpdateAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceFormData> }) => attendanceApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
			toast.success("تم تحديث سجل الحضور بنجاح");
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			toast.error(error.response?.data?.message || "فشل في تحديث سجل الحضور");
		},
	});
}
