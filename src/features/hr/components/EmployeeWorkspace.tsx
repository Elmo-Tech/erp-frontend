"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Employee } from "../types";
import { EmployeeAdvancesPanel } from "./EmployeeAdvancesDialog";
import { EmployeeAttendancePanel } from "./EmployeeAttendancePanel";
import { EmployeeContractsPanel } from "./EmployeeContractsDialog";
import { EmployeeDirectDeductionsPanel } from "./EmployeeDirectDeductionsDialog";
import { EmployeeDocumentsPanel } from "./EmployeeDocumentsDialog";
import { EmployeeLateDeductionsPanel } from "./EmployeeLateDeductionsDialog";
import { EmployeeLeavesPanel } from "./EmployeeLeavesDialog";
import { EmployeeOvertimeRequestsPanel } from "./EmployeeOvertimeRequestsDialog";
import { EmployeeShortPermissionsPanel } from "./EmployeeShortPermissionsDialog";
import { EmployeeOverviewPanel } from "./EmployeeOverviewPanel";

const workflows = [
	{ value: "contracts", label: "Contracts", Panel: EmployeeContractsPanel },
	{ value: "attendance", label: "Attendance & time off", Panel: EmployeeTimeOffPanel },
	{ value: "payroll", label: "Salary & advances", Panel: EmployeeFinancialPanel },
	{ value: "documents", label: "Documents", Panel: EmployeeDocumentsPanel },
] as const;

interface EmployeeWorkspaceProps {
	employee: Employee;
	canManage: boolean;
	onEdit: (employee: Employee) => void;
}

interface PanelProps { employeeId: number; employeeName: string; canManage: boolean; isActive: boolean }

function EmployeeTimeOffPanel(props: PanelProps) {
	return <div className="space-y-8">
		<nav aria-label="Time off sections" className="flex flex-wrap gap-2">{[["attendance-records", "Attendance"], ["employee-leaves", "Leave"], ["employee-permissions", "Short permissions"]].map(([id, label]) => <Button key={id} variant="outline" size="sm" asChild><a href={`#${id}`}>{label}</a></Button>)}</nav>
		<section id="attendance-records" className="scroll-mt-24 space-y-3"><h2 className="text-lg font-semibold">Attendance records</h2><EmployeeAttendancePanel {...props} /></section>
		<section id="employee-leaves" className="scroll-mt-24 border-t pt-6"><EmployeeLeavesPanel {...props} /></section>
		<section id="employee-permissions" className="scroll-mt-24 border-t pt-6"><EmployeeShortPermissionsPanel {...props} /></section>
	</div>;
}

function EmployeeFinancialPanel(props: PanelProps) {
	return <div className="space-y-8">
		<div><h2 className="text-lg font-semibold">Salary, advances & deductions</h2><p className="text-sm text-muted-foreground">Base salary and hourly rate are set in Contracts. Manage salary advances, deductions, and overtime here; all summary figures are on Overview.</p></div>
		<nav aria-label="Financial sections" className="flex flex-wrap gap-2">{[["employee-advances", "Advances"], ["direct-deductions", "Direct deductions"], ["late-deductions", "Late deductions"], ["employee-overtime", "Overtime"]].map(([id, label]) => <Button key={id} variant="outline" size="sm" asChild><a href={`#${id}`}>{label}</a></Button>)}</nav>
		<section id="employee-advances" className="scroll-mt-24"><EmployeeAdvancesPanel {...props} /></section>
		<section id="direct-deductions" className="scroll-mt-24 border-t pt-6"><EmployeeDirectDeductionsPanel {...props} /></section>
		<section id="late-deductions" className="scroll-mt-24 border-t pt-6"><EmployeeLateDeductionsPanel {...props} /></section>
		<section id="employee-overtime" className="scroll-mt-24 border-t pt-6"><EmployeeOvertimeRequestsPanel {...props} /></section>
	</div>;
}

export function EmployeeWorkspace({ employee, canManage, onEdit }: EmployeeWorkspaceProps) {
	const [activeTab, setActiveTab] = useState("overview");
	const panelProps = {
		employeeId: employee.userId,
		employeeName: employee.name,
		canManage,
	};

	return (
		<div className="min-w-0 space-y-6">
			<header className="rounded-xl border bg-card p-4 sm:p-6">
				<div className="flex items-start gap-3">
					<Avatar className="h-12 w-12">
						<AvatarImage src={employee.avatar} alt={employee.name} />
						<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-2xl font-semibold">{employee.name}</h1>
							<Badge variant={employee.isActive ? "default" : "secondary"}>{employee.isActive ? "Active" : "Inactive"}</Badge>
						</div>
						<p className="truncate text-sm text-muted-foreground">{employee.email}</p>
					</div>
					{canManage && <Button type="button" variant="outline" size="sm" onClick={() => onEdit(employee)}><Edit />Edit</Button>}
				</div>
			</header>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 gap-6">
				<div className="overflow-x-auto border-b">
					<TabsList className="h-auto w-max min-w-full justify-start gap-1 rounded-none bg-transparent p-0">
						<TabsTrigger value="overview" className="flex-none rounded-b-none px-3 py-3">Overview</TabsTrigger>
						{canManage && workflows.map(({ value, label }) => (
							<TabsTrigger key={value} value={value} className="flex-none rounded-b-none px-3 py-3">{label}</TabsTrigger>
						))}
					</TabsList>
				</div>

				<div className="rounded-xl border bg-card p-4 sm:p-6">
					<TabsContent value="overview" forceMount hidden={activeTab !== "overview"} className="mt-0 data-[state=inactive]:hidden"><EmployeeOverviewPanel employee={employee} canManage={canManage} isActive={activeTab === "overview"} /></TabsContent>
					{canManage && workflows.map(({ value, Panel }) => (
						<TabsContent key={value} value={value} forceMount hidden={activeTab !== value} className="mt-0 data-[state=inactive]:hidden">
							<Panel {...panelProps} isActive={activeTab === value} />
						</TabsContent>
					))}
				</div>
			</Tabs>
		</div>
	);
}
