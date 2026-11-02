"use client";

import { useState } from "react";
import { CalendarDays, ChartNoAxesCombined, Edit, FileText, Folder, Wallet, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Employee } from "../types";
import { EmployeeContractsPanel } from "./EmployeeContractsDialog";
import { EmployeeDocumentsPanel } from "./EmployeeDocumentsDialog";
import { EmployeeOverviewPanel } from "./EmployeeOverviewPanel";
import { EmployeeTimeOffPanel } from "./EmployeeTimeOffPanel";
import { EmployeeFinancialPanel } from "./EmployeeFinancialPanel";
import { EmployeeReportDialog } from "./EmployeeReportDialog";
import { useAuthStore } from "@/store/authStore";
import { resourcePermissions } from "@/config/access";

const workflows = [
	{ value: "contracts", label: "Contracts", Icon: FileText, Panel: EmployeeContractsPanel },
	{ value: "attendance", label: "Attendance & time off", Icon: CalendarDays, Panel: EmployeeTimeOffPanel },
	{ value: "payroll", label: "Salary & advances", Icon: Wallet, Panel: EmployeeFinancialPanel },
	{ value: "documents", label: "Documents", Icon: Folder, Panel: EmployeeDocumentsPanel },
] as const;

interface EmployeeWorkspaceProps {
	employee: Employee;
	canManage: boolean;
	onEdit: (employee: Employee) => void;
	reviewKind?: "leave" | "permission";
	reviewMonth?: string;
}

export function EmployeeWorkspace({ employee, canManage, onEdit, reviewKind, reviewMonth }: EmployeeWorkspaceProps) {
	const [activeTab, setActiveTab] = useState(reviewKind ? "attendance" : "overview");
	const [reportOpen, setReportOpen] = useState(false);
	const { hasPermission: has } = useAuthStore((state) => state);
	const sectionPermissions: Record<string, string[]> = { contracts: resourcePermissions("employee_contracts"), attendance: [...resourcePermissions("leaves"), ...resourcePermissions("permissions"), "view_all_attendance", "manage_attendance"], payroll: ["manage_employee_salary", "view_employee_salary", ...resourcePermissions("employee_advances"), ...resourcePermissions("deductions"), ...resourcePermissions("overtime")], documents: resourcePermissions("employee_documents") };
	const available = workflows.filter(({ value }) => canManage || sectionPermissions[value].some(has));
	const panelProps = {
		employeeId: employee.userId,
		employeeName: employee.name,
		canManage,
	};

	return (
		<div className="min-w-0 space-y-6">
			<header className="rounded-2xl border bg-card p-4 sm:p-6">
				<div className="flex flex-wrap items-center gap-4">
					<Avatar className="h-14 w-14 rounded-2xl ring-1 ring-border">
						<AvatarImage src={employee.avatar} alt={employee.name} />
						<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="min-w-40 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-2xl font-semibold">{employee.name}</h1>
							<Badge variant="secondary" className={employee.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : undefined}>{employee.isActive ? "Active" : "Inactive"}</Badge>
						</div>
						<p className="truncate text-sm text-muted-foreground">{employee.email}</p>
					</div>
					<div className="flex flex-wrap gap-2">{(canManage || has("edit_employees")) && <Button type="button" variant="outline" size="sm" onClick={() => onEdit(employee)}><Edit />Edit</Button>}{(canManage || has("view_employee_reports")) && <Button type="button" size="sm" onClick={() => setReportOpen(true)}><Download />Employee report</Button>}</div>
				</div>
			</header>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 gap-6">
				<div className="overflow-x-auto border-b">
					<TabsList className="h-auto w-max min-w-full justify-start gap-1 rounded-none bg-transparent p-0">
						<TabsTrigger value="overview" className="flex-none gap-2 rounded-none border-0 border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"><ChartNoAxesCombined className="size-4" />Overview</TabsTrigger>
						{available.map(({ value, label, Icon }) => (
							<TabsTrigger key={value} value={value} className="flex-none gap-2 rounded-none border-0 border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"><Icon className="size-4" />{label}</TabsTrigger>
						))}
					</TabsList>
				</div>

				<div className="min-w-0">
					<TabsContent value="overview" forceMount hidden={activeTab !== "overview"} className="mt-0 data-[state=inactive]:hidden"><EmployeeOverviewPanel employee={employee} canManage={canManage} isActive={activeTab === "overview"} /></TabsContent>
					{available.map(({ value, Panel }) => (
						<TabsContent key={value} value={value} forceMount hidden={activeTab !== value} className="mt-0 data-[state=inactive]:hidden">
							<Panel {...panelProps} canManage={canManage || sectionPermissions[value].some(has)} isActive={activeTab === value} {...(value === "attendance" ? { reviewKind, reviewMonth } : {})} />
						</TabsContent>
					))}
				</div>
			</Tabs>
			{(canManage || has("view_employee_reports")) && <EmployeeReportDialog employeeId={employee.userId} employeeName={employee.name} open={reportOpen} onOpenChange={setReportOpen} />}
		</div>
	);
}
