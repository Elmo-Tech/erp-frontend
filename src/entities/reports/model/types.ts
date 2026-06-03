export type ReportKey = "overview" | "projects" | "team-time" | "sales-finance";

export interface ReportFilters {
	from?: string;
	to?: string;
	projectId?: number;
	clientId?: number;
	userId?: number;
	status?: string;
}

export interface ExecutiveOverviewReport {
	filters: ReportFilters;
	metrics: {
		projectsTotal: number;
		activeProjects: number;
		completedProjects: number;
		invoicedTotal: number;
		paidTotal: number;
		overdueTotal: number;
		subscriptionCostTotal: number;
		openLeads: number;
		loggedMinutes: number;
		internalCost: number | null;
		profit: number | null;
	};
}

export interface ProjectProfitabilityRow {
	projectId: number;
	title: string;
	clientId: number;
	clientName: string | null;
	status: string;
	budget: number;
	deadline: string | null;
	invoicedTotal: number;
	paidTotal: number;
	loggedMinutes: number;
	internalCost: number | null;
	profit: number | null;
	marginPercent: number | null;
}

export interface ProjectProfitabilityReport {
	filters: ReportFilters;
	summary: {
		projects: number;
		invoicedTotal: number;
		paidTotal: number;
		loggedMinutes: number;
	};
	rows: ProjectProfitabilityRow[];
}

export interface TeamTimeRow {
	userId: number;
	name: string;
	email: string | null;
	assignedTasks: number;
	completedTasks: number;
	loggedMinutes: number;
	internalCost: number | null;
}

export interface TeamTimeReport {
	filters: ReportFilters;
	summary: {
		members: number;
		loggedMinutes: number;
		assignedTasks: number;
		completedTasks: number;
	};
	rows: TeamTimeRow[];
}

export interface SalesFinanceRow {
	type: "invoice" | "subscription";
	id: number;
	reference: string;
	clientId: number | null;
	clientName: string | null;
	projectId: number | null;
	projectTitle: string | null;
	status: string;
	amount: number;
	dueDate: string | null;
}

export interface SalesFinanceReport {
	filters: ReportFilters;
	summary: {
		invoices: number;
		paidTotal: number;
		overdueTotal: number;
		subscriptionCostTotal: number;
		leads: number;
	};
	rows: SalesFinanceRow[];
	leadStages: Record<string, number>;
}
