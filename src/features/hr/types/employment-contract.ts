export const employmentContractWorkDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export type EmploymentContractWorkDay = (typeof employmentContractWorkDays)[number];
export type EmploymentType = "full_time" | "part_time";
export type EmploymentContractStatus = "draft" | "active" | "expired" | "terminated" | "superseded";

export interface EmploymentContract {
	id: number;
	employeeId: number;
	employmentType: EmploymentType;
	baseSalary: number;
	hourlyRate?: number | null;
	startDate: string;
	endDate: string;
	durationMonths: number;
	workDays: EmploymentContractWorkDay[];
	workHoursPerDay: number;
	workStartTime: string;
	status: EmploymentContractStatus;
	terminatedOn: string | null;
	notes?: string | null;
	isCurrent: boolean;
	hasFile?: boolean;
	fileName?: string | null;
	fileSize?: number | null;
	fileMimeType?: string | null;
	fileUploadedAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface EmploymentContractPayload {
	employmentType: EmploymentType;
	baseSalary: number;
	hourlyRate?: number | null;
	startDate: string;
	durationMonths: number;
	workDays: EmploymentContractWorkDay[];
	workHoursPerDay: number;
	workStartTime: string;
	status: EmploymentContractStatus;
	terminatedOn?: string | null;
	notes?: string | null;
}

export interface EmploymentContractFormValues {
	employmentType: EmploymentType;
	baseSalary: number;
	hourlyRate?: number | null;
	startDate: string;
	durationMonths: number;
	workDays: EmploymentContractWorkDay[];
	workHoursPerDay: number;
	workStartTime: string;
	status: EmploymentContractStatus;
	terminatedOn: string;
	notes: string;
}
