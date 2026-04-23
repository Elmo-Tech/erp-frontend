import api from "@/shared/api/base";
import type {
	DeductionType,
	DeductionTypeListResponse,
	CreateDeductionTypeInput,
	RewardType,
	RewardTypeListResponse,
	CreateRewardTypeInput,
	EmployeeDeduction,
	EmployeeDeductionListResponse,
	CreateEmployeeDeductionInput,
	EmployeeReward,
	EmployeeRewardListResponse,
	CreateEmployeeRewardInput,
	SalaryAdjustment,
	SalaryAdjustmentListResponse,
	PayrollSummary,
} from "../types/deductions-rewards";

const BASE_URL = "/v1/hr";

// ==================== Deduction Types ====================

export const getDeductionTypes = async (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string }): Promise<DeductionTypeListResponse> => {
	const response = await api.get(`${BASE_URL}/deduction-types`, { params });
	return response.data;
};

export const getDeductionType = async (id: number): Promise<DeductionType> => {
	const response = await api.get(`${BASE_URL}/deduction-types/${id}`);
	return response.data.data;
};

export const createDeductionType = async (data: CreateDeductionTypeInput): Promise<DeductionType> => {
	const response = await api.post(`${BASE_URL}/deduction-types`, data);
	return response.data.data;
};

export const updateDeductionType = async (id: number, data: Partial<CreateDeductionTypeInput>): Promise<DeductionType> => {
	const response = await api.put(`${BASE_URL}/deduction-types/${id}`, data);
	return response.data.data;
};

export const deleteDeductionType = async (id: number): Promise<void> => {
	await api.delete(`${BASE_URL}/deduction-types/${id}`);
};

// ==================== Reward Types ====================

export const getRewardTypes = async (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string }): Promise<RewardTypeListResponse> => {
	const response = await api.get(`${BASE_URL}/reward-types`, { params });
	return response.data;
};

export const getRewardType = async (id: number): Promise<RewardType> => {
	const response = await api.get(`${BASE_URL}/reward-types/${id}`);
	return response.data.data;
};

export const createRewardType = async (data: CreateRewardTypeInput): Promise<RewardType> => {
	const response = await api.post(`${BASE_URL}/reward-types`, data);
	return response.data.data;
};

export const updateRewardType = async (id: number, data: Partial<CreateRewardTypeInput>): Promise<RewardType> => {
	const response = await api.put(`${BASE_URL}/reward-types/${id}`, data);
	return response.data.data;
};

export const deleteRewardType = async (id: number): Promise<void> => {
	await api.delete(`${BASE_URL}/reward-types/${id}`);
};

export const calculateRewardAmount = async (id: number, params: { base_salary?: number; points?: number; performance_score?: number }): Promise<{ amount: number; calculation_type: string; base_amount: number }> => {
	const response = await api.post(`${BASE_URL}/reward-types/${id}/calculate`, params);
	return response.data;
};

// ==================== Employee Deductions ====================

export const getEmployeeDeductions = async (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string; include?: string }): Promise<EmployeeDeductionListResponse> => {
	const response = await api.get(`${BASE_URL}/employee-deductions`, { params });
	return response.data;
};

export const getEmployeeDeduction = async (id: number): Promise<EmployeeDeduction> => {
	const response = await api.get(`${BASE_URL}/employee-deductions/${id}`);
	return response.data.data;
};

export const createEmployeeDeduction = async (data: CreateEmployeeDeductionInput): Promise<EmployeeDeduction> => {
	const response = await api.post(`${BASE_URL}/employee-deductions`, data);
	return response.data.data;
};

export const updateEmployeeDeduction = async (id: number, data: Partial<CreateEmployeeDeductionInput>): Promise<EmployeeDeduction> => {
	const response = await api.put(`${BASE_URL}/employee-deductions/${id}`, data);
	return response.data.data;
};

export const deleteEmployeeDeduction = async (id: number): Promise<void> => {
	await api.delete(`${BASE_URL}/employee-deductions/${id}`);
};

export const approveEmployeeDeduction = async (id: number, notes?: string): Promise<EmployeeDeduction> => {
	const response = await api.post(`${BASE_URL}/employee-deductions/${id}/approve`, { notes });
	return response.data.data;
};

export const rejectEmployeeDeduction = async (id: number, rejection_reason: string): Promise<EmployeeDeduction> => {
	const response = await api.post(`${BASE_URL}/employee-deductions/${id}/reject`, { rejection_reason });
	return response.data.data;
};

export const getEmployeeDeductionSummary = async (params: {
	user_id: number;
	year?: number;
	month?: number;
}): Promise<{
	total_deductions: number;
	total_amount: number;
	by_type: Array<{ deduction_type: string; count: number; total: number }>;
}> => {
	const response = await api.get(`${BASE_URL}/employee-deductions-summary`, { params });
	return response.data;
};

// ==================== Employee Rewards ====================

export const getEmployeeRewards = async (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string; include?: string }): Promise<EmployeeRewardListResponse> => {
	const response = await api.get(`${BASE_URL}/employee-rewards`, { params });
	return response.data;
};

export const getEmployeeReward = async (id: number): Promise<EmployeeReward> => {
	const response = await api.get(`${BASE_URL}/employee-rewards/${id}`);
	return response.data.data;
};

export const createEmployeeReward = async (data: CreateEmployeeRewardInput): Promise<EmployeeReward> => {
	const response = await api.post(`${BASE_URL}/employee-rewards`, data);
	return response.data.data;
};

export const updateEmployeeReward = async (id: number, data: Partial<CreateEmployeeRewardInput>): Promise<EmployeeReward> => {
	const response = await api.put(`${BASE_URL}/employee-rewards/${id}`, data);
	return response.data.data;
};

export const deleteEmployeeReward = async (id: number): Promise<void> => {
	await api.delete(`${BASE_URL}/employee-rewards/${id}`);
};

export const approveEmployeeReward = async (id: number, notes?: string): Promise<EmployeeReward> => {
	const response = await api.post(`${BASE_URL}/employee-rewards/${id}/approve`, { notes });
	return response.data.data;
};

export const rejectEmployeeReward = async (id: number, rejection_reason: string): Promise<EmployeeReward> => {
	const response = await api.post(`${BASE_URL}/employee-rewards/${id}/reject`, { rejection_reason });
	return response.data.data;
};

export const markRewardAsPaid = async (id: number, payment_reference?: string): Promise<EmployeeReward> => {
	const response = await api.post(`${BASE_URL}/employee-rewards/${id}/mark-paid`, { payment_reference });
	return response.data.data;
};

export const getEmployeeRewardSummary = async (params: {
	user_id: number;
	year?: number;
	month?: number;
}): Promise<{
	total_rewards: number;
	total_amount: number;
	total_points_used: number;
	by_type: Array<{ reward_type: string; count: number; total: number; points_used: number }>;
	by_status: { pending: number; approved: number; paid: number };
}> => {
	const response = await api.get(`${BASE_URL}/employee-rewards-summary`, { params });
	return response.data;
};

export const createRewardFromPoints = async (data: { user_id: number; points: number; reward_type_id: number; reason?: string }): Promise<EmployeeReward> => {
	const response = await api.post(`${BASE_URL}/employee-rewards/from-points`, data);
	return response.data.data;
};

// ==================== Salary Adjustments ====================

export const getSalaryAdjustments = async (params?: { page?: number; per_page?: number; filter?: Record<string, unknown>; sort?: string; include?: string }): Promise<SalaryAdjustmentListResponse> => {
	const response = await api.get(`${BASE_URL}/salary-adjustments`, { params });
	return response.data;
};

export const getSalaryAdjustment = async (id: number): Promise<SalaryAdjustment> => {
	const response = await api.get(`${BASE_URL}/salary-adjustments/${id}`);
	return response.data.data;
};

export const getPayrollSummary = async (params: { year: number; month: number }): Promise<PayrollSummary> => {
	const response = await api.get(`${BASE_URL}/salary-adjustments-payroll-summary`, { params });
	return response.data;
};

export const approveSalaryAdjustment = async (id: number, notes?: string): Promise<SalaryAdjustment> => {
	const response = await api.post(`${BASE_URL}/salary-adjustments/${id}/approve`, { notes });
	return response.data.data;
};

export const cancelSalaryAdjustment = async (id: number, reason: string): Promise<SalaryAdjustment> => {
	const response = await api.post(`${BASE_URL}/salary-adjustments/${id}/cancel`, { reason });
	return response.data.data;
};
