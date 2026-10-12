import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as deductionsRewardsApi from "../api/deductions-rewards";
import type { CreateDeductionTypeInput, CreateRewardTypeInput, CreateEmployeeDeductionInput, CreateEmployeeRewardInput } from "../types/deductions-rewards";
import { directEmployeeDeductionKeys } from "./useDirectEmployeeDeductions";

// ==================== Deduction Types Hooks ====================

export const useDeductionTypes = (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string }) => {
	return useQuery({
		queryKey: ["deduction-types", params],
		queryFn: () => deductionsRewardsApi.getDeductionTypes(params),
	});
};

export const useDeductionType = (id: number) => {
	return useQuery({
		queryKey: ["deduction-type", id],
		queryFn: () => deductionsRewardsApi.getDeductionType(id),
		enabled: !!id,
	});
};

export const useCreateDeductionType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateDeductionTypeInput) => deductionsRewardsApi.createDeductionType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deduction-types"] });
			queryClient.invalidateQueries({ queryKey: directEmployeeDeductionKeys.types() });
		},
		onError: (error: Error) => {
			toast.error(`Failed to create deduction type: ${error.message}`);
		},
	});
};

export const useUpdateDeductionType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<CreateDeductionTypeInput> }) => deductionsRewardsApi.updateDeductionType(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["deduction-types"] });
			queryClient.invalidateQueries({ queryKey: ["deduction-type", variables.id] });
			queryClient.invalidateQueries({ queryKey: directEmployeeDeductionKeys.types() });
		},
		onError: (error: Error) => {
			toast.error(`Failed to update deduction type: ${error.message}`);
		},
	});
};

export const useDeleteDeductionType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deductionsRewardsApi.deleteDeductionType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deduction-types"] });
			queryClient.invalidateQueries({ queryKey: directEmployeeDeductionKeys.types() });
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete deduction type: ${error.message}`);
		},
	});
};

// ==================== Reward Types Hooks ====================

export const useRewardTypes = (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string }) => {
	return useQuery({
		queryKey: ["reward-types", params],
		queryFn: () => deductionsRewardsApi.getRewardTypes(params),
	});
};

export const useRewardType = (id: number) => {
	return useQuery({
		queryKey: ["reward-type", id],
		queryFn: () => deductionsRewardsApi.getRewardType(id),
		enabled: !!id,
	});
};

export const useCreateRewardType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRewardTypeInput) => deductionsRewardsApi.createRewardType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reward-types"] });
			toast.success("Reward type created successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create reward type: ${error.message}`);
		},
	});
};

export const useUpdateRewardType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<CreateRewardTypeInput> }) => deductionsRewardsApi.updateRewardType(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["reward-types"] });
			queryClient.invalidateQueries({ queryKey: ["reward-type", variables.id] });
			toast.success("Reward type updated successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to update reward type: ${error.message}`);
		},
	});
};

export const useDeleteRewardType = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deductionsRewardsApi.deleteRewardType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reward-types"] });
			toast.success("Reward type deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to delete reward type: ${error.message}`);
		},
	});
};

export const useCalculateRewardAmount = () => {
	return useMutation({
		mutationFn: ({ id, params }: { id: number; params: { base_salary?: number; points?: number; performance_score?: number } }) => deductionsRewardsApi.calculateRewardAmount(id, params),
	});
};

// ==================== Employee Deductions Hooks ====================

export const useEmployeeDeductions = (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string; include?: string }) => {
	return useQuery({
		queryKey: ["employee-deductions", params],
		queryFn: () => deductionsRewardsApi.getEmployeeDeductions(params),
	});
};

export const useEmployeeDeduction = (id: number) => {
	return useQuery({
		queryKey: ["employee-deduction", id],
		queryFn: () => deductionsRewardsApi.getEmployeeDeduction(id),
		enabled: !!id,
	});
};

export const useCreateEmployeeDeduction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEmployeeDeductionInput) => deductionsRewardsApi.createEmployeeDeduction(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-deductions"] });
			toast.success("Employee deduction created successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create employee deduction: ${error.message}`);
		},
	});
};

export const useApproveEmployeeDeduction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, notes }: { id: number; notes?: string }) => deductionsRewardsApi.approveEmployeeDeduction(id, notes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-deductions"] });
			toast.success("Deduction approved successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to approve deduction: ${error.message}`);
		},
	});
};

export const useRejectEmployeeDeduction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) => deductionsRewardsApi.rejectEmployeeDeduction(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-deductions"] });
			toast.success("Deduction rejected");
		},
		onError: (error: Error) => {
			toast.error(`Failed to reject deduction: ${error.message}`);
		},
	});
};

export const useEmployeeDeductionSummary = (params: { user_id: number; year?: number; month?: number }) => {
	return useQuery({
		queryKey: ["employee-deduction-summary", params],
		queryFn: () => deductionsRewardsApi.getEmployeeDeductionSummary(params),
		enabled: !!params.user_id,
	});
};

// ==================== Employee Rewards Hooks ====================

export const useEmployeeRewards = (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string; include?: string }) => {
	return useQuery({
		queryKey: ["employee-rewards", params],
		queryFn: () => deductionsRewardsApi.getEmployeeRewards(params),
	});
};

export const useEmployeeReward = (id: number) => {
	return useQuery({
		queryKey: ["employee-reward", id],
		queryFn: () => deductionsRewardsApi.getEmployeeReward(id),
		enabled: !!id,
	});
};

export const useCreateEmployeeReward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEmployeeRewardInput) => deductionsRewardsApi.createEmployeeReward(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-rewards"] });
			toast.success("Employee reward created successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create employee reward: ${error.message}`);
		},
	});
};

export const useApproveEmployeeReward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, notes }: { id: number; notes?: string }) => deductionsRewardsApi.approveEmployeeReward(id, notes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-rewards"] });
			toast.success("Reward approved successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to approve reward: ${error.message}`);
		},
	});
};

export const useRejectEmployeeReward = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) => deductionsRewardsApi.rejectEmployeeReward(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-rewards"] });
			toast.success("Reward rejected");
		},
		onError: (error: Error) => {
			toast.error(`Failed to reject reward: ${error.message}`);
		},
	});
};

export const useMarkRewardAsPaid = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payment_reference }: { id: number; payment_reference?: string }) => deductionsRewardsApi.markRewardAsPaid(id, payment_reference),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-rewards"] });
			toast.success("Reward marked as paid");
		},
		onError: (error: Error) => {
			toast.error(`Failed to mark reward as paid: ${error.message}`);
		},
	});
};

export const useCreateRewardFromPoints = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { user_id: number; points: number; reward_type_id: number; reason?: string }) => deductionsRewardsApi.createRewardFromPoints(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employee-rewards"] });
			queryClient.invalidateQueries({ queryKey: ["user-points"] });
			toast.success("Reward created from points successfully");
		},
		onError: (error: Error) => {
			toast.error(`Failed to create reward from points: ${error.message}`);
		},
	});
};

export const useEmployeeRewardSummary = (params: { user_id: number; year?: number; month?: number }) => {
	return useQuery({
		queryKey: ["employee-reward-summary", params],
		queryFn: () => deductionsRewardsApi.getEmployeeRewardSummary(params),
		enabled: !!params.user_id,
	});
};

// ==================== Salary Adjustments Hooks ====================

export const useSalaryAdjustments = (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string; include?: string }) => {
	return useQuery({
		queryKey: ["salary-adjustments", params],
		queryFn: () => deductionsRewardsApi.getSalaryAdjustments(params),
	});
};

export const useSalaryAdjustment = (id: number) => {
	return useQuery({
		queryKey: ["salary-adjustment", id],
		queryFn: () => deductionsRewardsApi.getSalaryAdjustment(id),
		enabled: !!id,
	});
};

export const usePayrollSummary = (params: { year: number; month: number }) => {
	return useQuery({
		queryKey: ["payroll-summary", params],
		queryFn: () => deductionsRewardsApi.getPayrollSummary(params),
		enabled: !!params.year && !!params.month,
	});
};

export const useApproveSalaryAdjustment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, notes }: { id: number; notes?: string }) => deductionsRewardsApi.approveSalaryAdjustment(id, notes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["salary-adjustments"] });
			queryClient.invalidateQueries({ queryKey: ["payroll-summary"] });
			toast.success("Salary adjustment approved");
		},
		onError: (error: Error) => {
			toast.error(`Failed to approve adjustment: ${error.message}`);
		},
	});
};

export const useCancelSalaryAdjustment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason: string }) => deductionsRewardsApi.cancelSalaryAdjustment(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["salary-adjustments"] });
			queryClient.invalidateQueries({ queryKey: ["payroll-summary"] });
			toast.success("Salary adjustment cancelled");
		},
		onError: (error: Error) => {
			toast.error(`Failed to cancel adjustment: ${error.message}`);
		},
	});
};
