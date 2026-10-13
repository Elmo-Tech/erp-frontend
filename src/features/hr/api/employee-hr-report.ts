import api from "@/lib/axios";
import { downloadEmployeeDocumentBlob } from "../lib/employee-documents";
import type { EmployeeSalaryPeriod, EmployeeWorkCommitment } from "../types/employee-overview";

export interface EmployeeHrReportSection {
	key: string;
	title: string;
	columns: Record<string, string>;
	rows: Array<Record<string, string | number | null>>;
}

export interface EmployeeHrReport {
	employee: { id: number; name: string; email: string; specialization: string | null; isActive: boolean };
	period: { dateFrom: string; dateTo: string };
	generatedAt: string;
	timezone: string;
	workCommitment: EmployeeWorkCommitment;
	salaryPeriods: EmployeeSalaryPeriod[];
	sections: EmployeeHrReportSection[];
}

export const employeeHrReportApi = {
	get: async (id: number, dateFrom: string, dateTo: string) => (await api.get<{ data: EmployeeHrReport }>(`/employees/${id}/hr-report`, { params: { dateFrom, dateTo } })).data.data,
	download: async (id: number, dateFrom: string, dateTo: string) => {
		const response = await api.get<Blob>(`/employees/${id}/hr-report`, { params: { dateFrom, dateTo, format: "pdf" }, responseType: "blob" });
		downloadEmployeeDocumentBlob(response.data, `employee-${id}-${dateFrom}-${dateTo}.pdf`);
	},
};
