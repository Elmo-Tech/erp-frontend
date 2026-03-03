// Deduction Types
export interface DeductionType {
	id: number;
	name: string;
	code: string;
	description?: string;
	category: "attendance" | "performance" | "behavior" | "financial" | "other";
	is_active: boolean;
	requires_approval: boolean;
	auto_calculate: boolean;
	default_amount?: number;
	max_amount?: number;
	frequency?: "once" | "daily" | "weekly" | "monthly";
	rules?: DeductionRule[];
	rules_count?: number;
	employee_deductions_count?: number;
	created_at: string;
	updated_at: string;
}

export interface DeductionRule {
	id: number;
	deduction_type_id: number;
	name: string;
	code: string;
	description?: string;
	rule_type: "fixed" | "tiered" | "accumulative" | "percentage";
	threshold_value: number;
	threshold_unit: string;
	deduction_value: number;
	deduction_unit: "amount" | "percentage" | "days_salary";
	max_deduction_amount?: number;
	repetition_penalty_factor?: number;
	grace_period_days?: number;
	is_active: boolean;
	effective_from?: string;
	effective_until?: string;
	conditions?: Record<string, unknown>;
	is_effective: boolean;
}

// Reward Types
export interface RewardType {
	id: number;
	name: string;
	code: string;
	description?: string;
	calculation_type: "fixed" | "percentage" | "points_based";
	base_amount: number;
	is_active: boolean;
	requires_approval: boolean;
	criteria?: Record<string, unknown>;
	multipliers?: Record<string, number>;
	employee_rewards_count?: number;
	created_at: string;
	updated_at: string;
}

// Employee Deduction
export interface EmployeeDeduction {
	id: number;
	user: {
		id: number;
		name: string;
		email: string;
	};
	deduction_type?: DeductionType;
	deduction_date: string;
	amount: number;
	reason: string;
	status: "pending" | "approved" | "rejected" | "cancelled";
	occurrences?: number;
	approved_by?: string;
	approved_at?: string;
	rejection_reason?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}

// Employee Reward
export interface EmployeeReward {
	id: number;
	user: {
		id: number;
		name: string;
		email: string;
	};
	reward_type?: RewardType;
	reward_date: string;
	amount: number;
	reason: string;
	status: "pending" | "approved" | "rejected" | "paid" | "cancelled";
	points_used?: number;
	approved_by?: string;
	approved_at?: string;
	rejection_reason?: string;
	paid_at?: string;
	payment_reference?: string;
	rewardable_type?: string;
	rewardable_id?: number;
	created_at: string;
	updated_at: string;
}

// Salary Adjustment
export interface SalaryAdjustment {
	id: number;
	user: {
		id: number;
		name: string;
	};
	adjustment_type: "deduction" | "reward" | "bonus" | "overtime" | "allowance" | "penalty" | "adjustment";
	amount: number;
	signed_amount: number;
	reason: string;
	adjustment_date: string;
	payroll_month: number;
	payroll_year: number;
	status: "pending" | "approved" | "processed" | "cancelled";
	approved_by?: string;
	approved_at?: string;
	notes?: string;
	reference_type?: string;
	reference_id?: number;
	created_at: string;
	updated_at: string;
}

// Payroll Summary
export interface PayrollSummary {
	period: {
		year: number;
		month: number;
	};
	total_employees: number;
	total_additions: number;
	total_deductions: number;
	net_adjustment: number;
	by_status: {
		pending: number;
		approved: number;
		processed: number;
	};
	by_type: {
		deductions: number;
		rewards: number;
		bonuses: number;
		overtime: number;
		allowances: number;
		penalties: number;
	};
	employees: EmployeePayrollSummary[];
}

export interface EmployeePayrollSummary {
	user_id: number;
	user_name: string;
	base_salary: number;
	total_additions: number;
	total_deductions: number;
	net_adjustment: number;
	adjustments: SalaryAdjustment[];
}

// API Response Types
export interface DeductionTypeListResponse {
	data: DeductionType[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

export interface RewardTypeListResponse {
	data: RewardType[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

export interface EmployeeDeductionListResponse {
	data: EmployeeDeduction[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

export interface EmployeeRewardListResponse {
	data: EmployeeReward[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

export interface SalaryAdjustmentListResponse {
	data: SalaryAdjustment[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

// Form Types
export interface CreateDeductionTypeInput {
	name: string;
	code: string;
	description?: string;
	category: "attendance" | "performance" | "behavior" | "financial" | "other";
	is_active?: boolean;
	requires_approval?: boolean;
	auto_calculate?: boolean;
	default_amount?: number;
	max_amount?: number;
	frequency?: "once" | "daily" | "weekly" | "monthly";
}

export interface CreateRewardTypeInput {
	name: string;
	code: string;
	description?: string;
	calculation_type: "fixed" | "percentage" | "points_based";
	base_amount: number;
	is_active?: boolean;
	requires_approval?: boolean;
	criteria?: Record<string, unknown>;
	multipliers?: Record<string, number>;
}

export interface CreateEmployeeDeductionInput {
	user_id: number;
	deduction_type_id: number;
	deduction_date: string;
	amount?: number;
	reason: string;
	occurrences?: number;
	notes?: string;
}

export interface CreateEmployeeRewardInput {
	user_id: number;
	reward_type_id: number;
	reward_date: string;
	amount?: number;
	reason: string;
	points_used?: number;
	performance_score?: number;
	rewardable_type?: string;
	rewardable_id?: number;
}
