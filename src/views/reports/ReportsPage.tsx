"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, RotateCcw } from "lucide-react";
import { clientApi } from "@/entities/client/api/client.api";
import type { ClientFilters } from "@/entities/client/model/types";
import { projectApi } from "@/entities/project/api/project.api";
import { ProjectStatus, ProjectStatusLabels } from "@/entities/project/model/types";
import { reportsApi } from "@/entities/reports/api/reports.api";
import type { ProjectProfitabilityRow, ReportFilters, ReportKey, SalesFinanceRow, TeamTimeRow } from "@/entities/reports/model/types";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { userApi } from "@/entities/user/api/user.api";
import { ProtectedDashboardRoute } from "@/widgets/layout/ui/ProtectedDashboardRoute";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { DataTable, type Column } from "@/shared/ui/data-display/DataTable";
import { FilterSelect } from "@/shared/ui/filters/FilterSelect";
import { DatePicker } from "@/shared/ui/forms";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { formatCurrency } from "@/shared/lib/formatters";

const REPORT_TABS: Array<{ key: ReportKey; label: string }> = [
	{ key: "overview", label: "Overview" },
	{ key: "projects", label: "Projects" },
	{ key: "team-time", label: "Team & Time" },
	{ key: "sales-finance", label: "Sales & Finance" },
];

const STATUS_OPTIONS = [
	...Object.values(ProjectStatus).map((status) => ({ value: status, label: ProjectStatusLabels[status] })),
	{ value: "paid", label: "Paid" },
	{ value: "overdue", label: "Overdue" },
	{ value: "sent", label: "Sent" },
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "cancelled", label: "Cancelled" },
];

const DEFAULT_FILTERS: ReportFilters = {};

export default function ReportsPage() {
	const canViewFinancialStats = useAuthStore((state) => state.hasPermission("view_financial_stats"));
	const [selectedReport, setSelectedReport] = useState<ReportKey>("overview");
	const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
	const activeReport = canViewFinancialStats ? selectedReport : "team-time";
	const visibleReportTabs = canViewFinancialStats ? REPORT_TABS : REPORT_TABS.filter((tab) => tab.key === "team-time");

	const overview = useQuery({
		queryKey: ["reports", "overview", filters],
		queryFn: () => reportsApi.getOverview(filters),
		enabled: canViewFinancialStats,
	});
	const projects = useQuery({
		queryKey: ["reports", "projects", filters],
		queryFn: () => reportsApi.getProjects(filters),
		enabled: canViewFinancialStats,
	});
	const teamTime = useQuery({
		queryKey: ["reports", "team-time", filters],
		queryFn: () => reportsApi.getTeamTime(filters),
	});
	const salesFinance = useQuery({
		queryKey: ["reports", "sales-finance", filters],
		queryFn: () => reportsApi.getSalesFinance(filters),
		enabled: canViewFinancialStats,
	});

	const updateFilters = (partial: Partial<ReportFilters>) => {
		setFilters((current) => ({ ...current, ...partial }));
	};

	const exportCsv = () => {
		window.open(reportsApi.exportCsv(activeReport, filters), "_blank", "noopener,noreferrer");
	};

	return (
		<ProtectedDashboardRoute requiredPermission="view_reports">
			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div className="min-w-0">
						<h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
						<p className="text-sm text-muted-foreground">Filter operational, project, team, and finance performance data.</p>
					</div>
					<Button
						size="sm"
						onClick={exportCsv}
					>
						<Download data-icon="inline-start" />
						Export CSV
					</Button>
				</div>

				<ReportsFilterBar
					filters={filters}
					onChange={updateFilters}
					onReset={() => setFilters(DEFAULT_FILTERS)}
				/>

				<Tabs
					value={activeReport}
					onValueChange={(value) => setSelectedReport(value as ReportKey)}
					className="gap-4"
				>
					<TabsList className="w-full justify-start overflow-x-auto rounded-md">
						{visibleReportTabs.map((tab) => (
							<TabsTrigger
								key={tab.key}
								value={tab.key}
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					{canViewFinancialStats && <TabsContent value="overview">
						{overview.data ? (
							<OverviewReport data={overview.data.metrics} />
						) : (
							<ReportState isLoading={overview.isLoading} error={overview.error} />
						)}
					</TabsContent>}

					{canViewFinancialStats && <TabsContent value="projects">
						<ProjectReportTable
							rows={projects.data?.rows ?? []}
							isLoading={projects.isLoading}
							error={projects.error}
						/>
					</TabsContent>}

					<TabsContent value="team-time">
						<TeamTimeReportTable
							rows={teamTime.data?.rows ?? []}
							isLoading={teamTime.isLoading}
							error={teamTime.error}
						/>
					</TabsContent>

					{canViewFinancialStats && <TabsContent value="sales-finance">
						<SalesFinanceReportTable
							rows={salesFinance.data?.rows ?? []}
							isLoading={salesFinance.isLoading}
							error={salesFinance.error}
						/>
					</TabsContent>}
				</Tabs>
			</section>
		</ProtectedDashboardRoute>
	);
}

function ReportsFilterBar({ filters, onChange, onReset }: { filters: ReportFilters; onChange: (filters: Partial<ReportFilters>) => void; onReset: () => void }) {
	const clientsQuery = useQuery({
		queryKey: ["reports", "filter-clients"],
		queryFn: () => clientApi.getClients({ perPage: 100 } as ClientFilters),
		staleTime: 5 * 60 * 1000,
	});
	const projectsQuery = useQuery({
		queryKey: ["reports", "filter-projects"],
		queryFn: () => projectApi.getProjects({ perPage: 100 }),
		staleTime: 5 * 60 * 1000,
	});
	const usersQuery = useQuery({
		queryKey: ["reports", "filter-users"],
		queryFn: () => userApi.getInternalUsers(),
		staleTime: 5 * 60 * 1000,
	});

	const clientOptions = useMemo(
		() => (clientsQuery.data?.clients ?? []).map((client) => ({ value: String(client.id), label: client.company_name ? `${client.display_name} / ${client.company_name}` : client.display_name })),
		[clientsQuery.data?.clients],
	);
	const projectOptions = useMemo(
		() => (projectsQuery.data?.projects ?? []).map((project) => ({ value: String(project.projectId), label: project.title })),
		[projectsQuery.data?.projects],
	);
	const userOptions = useMemo(
		() => (usersQuery.data?.users ?? []).map((user) => ({ value: String(user.id), label: user.name })),
		[usersQuery.data?.users],
	);

	return (
		<div className="grid gap-3 border-y py-3 md:grid-cols-2 xl:grid-cols-[repeat(6,minmax(0,1fr))_auto] xl:items-end">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="reports-from">From</Label>
				<DatePicker
					id="reports-from"
					value={filters.from ?? ""}
					onChange={(value) => onChange({ from: value || undefined })}
				/>
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="reports-to">To</Label>
				<DatePicker
					id="reports-to"
					value={filters.to ?? ""}
					onChange={(value) => onChange({ to: value || undefined })}
				/>
			</div>
			<FilterSelect
				value={filters.projectId ? String(filters.projectId) : undefined}
				onChange={(value) => onChange({ projectId: value ? Number(value) : undefined })}
				options={projectOptions}
				placeholder="Project"
				allLabel="All projects"
				className="w-full"
				disabled={projectsQuery.isLoading}
			/>
			<FilterSelect
				value={filters.clientId ? String(filters.clientId) : undefined}
				onChange={(value) => onChange({ clientId: value ? Number(value) : undefined })}
				options={clientOptions}
				placeholder="Client"
				allLabel="All clients"
				className="w-full"
				disabled={clientsQuery.isLoading}
			/>
			<FilterSelect
				value={filters.userId ? String(filters.userId) : undefined}
				onChange={(value) => onChange({ userId: value ? Number(value) : undefined })}
				options={userOptions}
				placeholder="Employee"
				allLabel="All employees"
				className="w-full"
				disabled={usersQuery.isLoading}
			/>
			<FilterSelect
				value={filters.status}
				onChange={(value) => onChange({ status: value || undefined })}
				options={STATUS_OPTIONS}
				placeholder="Status"
				allLabel="All statuses"
				className="w-full"
			/>
			<Button
				variant="outline"
				size="icon"
				onClick={onReset}
				aria-label="Reset report filters"
				className="self-end"
			>
				<RotateCcw className="size-4" />
			</Button>
		</div>
	);
}

function OverviewReport({ data }: { data: Record<string, number | null> }) {
	const metrics = [
		{ label: "Projects", value: data.projectsTotal },
		{ label: "Active Projects", value: data.activeProjects },
		{ label: "Completed Projects", value: data.completedProjects },
		{ label: "Invoiced", value: money(data.invoicedTotal) },
		{ label: "Paid", value: money(data.paidTotal) },
		{ label: "Overdue", value: money(data.overdueTotal) },
		{ label: "Subscriptions", value: money(data.subscriptionCostTotal) },
		{ label: "Open Leads", value: data.openLeads },
		{ label: "Logged Time", value: minutes(data.loggedMinutes) },
		{ label: "Internal Cost", value: nullableMoney(data.internalCost) },
		{ label: "Profit", value: nullableMoney(data.profit) },
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => (
				<Card key={metric.label}>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-semibold tabular-nums">{metric.value ?? "—"}</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function ProjectReportTable({ rows, isLoading, error }: { rows: ProjectProfitabilityRow[]; isLoading: boolean; error: Error | null }) {
	const columns: Column<ProjectProfitabilityRow>[] = [
		{ key: "title", header: "Project", render: (row) => <span className="font-medium">{row.title}</span> },
		{ key: "client", header: "Client", render: (row) => row.clientName ?? "—" },
		{ key: "status", header: "Status", render: (row) => <Status value={row.status} /> },
		{ key: "invoiced", header: "Invoiced", className: "text-right", render: (row) => money(row.invoicedTotal) },
		{ key: "paid", header: "Paid", className: "text-right", render: (row) => money(row.paidTotal) },
		{ key: "time", header: "Time", className: "text-right", render: (row) => minutes(row.loggedMinutes) },
		{ key: "cost", header: "Cost", className: "text-right", render: (row) => nullableMoney(row.internalCost) },
		{ key: "profit", header: "Profit", className: "text-right", render: (row) => nullableMoney(row.profit) },
	];

	return <DataTable title="Project Profitability" columns={columns} data={rows} keyExtractor={(row) => row.projectId} isLoading={isLoading} error={error} emptyState={{ icon: BarChart3, title: "No project report rows", description: "Adjust the filters to broaden the report." }} />;
}

function TeamTimeReportTable({ rows, isLoading, error }: { rows: TeamTimeRow[]; isLoading: boolean; error: Error | null }) {
	const columns: Column<TeamTimeRow>[] = [
		{ key: "name", header: "Employee", render: (row) => <span className="font-medium">{row.name}</span> },
		{ key: "email", header: "Email", render: (row) => row.email ?? "—" },
		{ key: "assigned", header: "Assigned", className: "text-right", render: (row) => row.assignedTasks },
		{ key: "completed", header: "Completed", className: "text-right", render: (row) => row.completedTasks },
		{ key: "time", header: "Logged Time", className: "text-right", render: (row) => minutes(row.loggedMinutes) },
		{ key: "cost", header: "Cost", className: "text-right", render: (row) => nullableMoney(row.internalCost) },
	];

	return <DataTable title="Team & Time" columns={columns} data={rows} keyExtractor={(row) => row.userId} isLoading={isLoading} error={error} emptyState={{ icon: BarChart3, title: "No team time rows", description: "Logged project time will appear here." }} />;
}

function SalesFinanceReportTable({ rows, isLoading, error }: { rows: SalesFinanceRow[]; isLoading: boolean; error: Error | null }) {
	const columns: Column<SalesFinanceRow>[] = [
		{ key: "type", header: "Type", render: (row) => <Badge variant="outline">{row.type}</Badge> },
		{ key: "reference", header: "Reference", render: (row) => <span className="font-medium">{row.reference}</span> },
		{ key: "client", header: "Client", render: (row) => row.clientName ?? "—" },
		{ key: "project", header: "Project", render: (row) => row.projectTitle ?? "—" },
		{ key: "status", header: "Status", render: (row) => <Status value={row.status} /> },
		{ key: "amount", header: "Amount", className: "text-right", render: (row) => money(row.amount) },
		{ key: "due", header: "Due", render: (row) => row.dueDate ?? "—" },
	];

	return <DataTable title="Sales & Finance" columns={columns} data={rows} keyExtractor={(row) => `${row.type}-${row.id}`} isLoading={isLoading} error={error} emptyState={{ icon: BarChart3, title: "No finance rows", description: "Invoices and subscriptions matching the filters will appear here." }} />;
}

function ReportState({ isLoading, error }: { isLoading: boolean; error: Error | null }) {
	if (isLoading) {
		return <div className="rounded-md border px-4 py-10 text-center text-sm text-muted-foreground">Loading report…</div>;
	}

	if (error) {
		return <div className="rounded-md border px-4 py-10 text-center text-sm text-destructive">{error.message}</div>;
	}

	return <div className="rounded-md border px-4 py-10 text-center text-sm text-muted-foreground">No report data.</div>;
}

function Status({ value }: { value: string }) {
	return (
		<Badge
			variant="outline"
			className="capitalize"
		>
			{value.replaceAll("_", " ")}
		</Badge>
	);
}

function money(value: number | null | undefined) {
	return formatCurrency(value ?? 0);
}

function nullableMoney(value: number | null | undefined) {
	return value == null ? "—" : money(value);
}

function minutes(value: number | null | undefined) {
	const total = value ?? 0;
	const hours = Math.floor(total / 60);
	const mins = total % 60;
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}
