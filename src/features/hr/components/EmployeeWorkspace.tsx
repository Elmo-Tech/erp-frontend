"use client";

import { useState } from "react";
import { Edit, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoleLabel } from "@/config/simplification";
import type { Employee } from "../types";
import { EmployeeAdvancesPanel } from "./EmployeeAdvancesDialog";
import { EmployeeAttendancePanel } from "./EmployeeAttendancePanel";
import { EmployeeContractsPanel } from "./EmployeeContractsDialog";
import { EmployeeDirectDeductionsPanel } from "./EmployeeDirectDeductionsDialog";
import { EmployeeDocumentsPanel } from "./EmployeeDocumentsDialog";
import { EmployeeLateDeductionsPanel } from "./EmployeeLateDeductionsDialog";
import { EmployeeLeavesPanel } from "./EmployeeLeavesDialog";
import { EmployeeOvertimeRequestsPanel } from "./EmployeeOvertimeRequestsDialog";
import { EmployeePartialPaysPanel } from "./EmployeePartialPaysDialog";
import { EmployeeShortPermissionsPanel } from "./EmployeeShortPermissionsDialog";
import { EmployeeSupervisionPanel } from "./EmployeeSupervisionPanel";

const workflows = [
	{ value: "contracts", label: "Contracts", Panel: EmployeeContractsPanel },
	{ value: "attendance", label: "Attendance", Panel: EmployeeAttendancePanel },
	{ value: "documents", label: "Documents", Panel: EmployeeDocumentsPanel },
	{ value: "leaves", label: "Leave", Panel: EmployeeLeavesPanel },
	{ value: "permissions", label: "Short permissions", Panel: EmployeeShortPermissionsPanel },
	{ value: "overtime", label: "Overtime", Panel: EmployeeOvertimeRequestsPanel },
	{ value: "late-deductions", label: "Late deductions", Panel: EmployeeLateDeductionsPanel },
	{ value: "deductions", label: "Direct deductions", Panel: EmployeeDirectDeductionsPanel },
	{ value: "advances", label: "Advances", Panel: EmployeeAdvancesPanel },
	{ value: "partial-pay", label: "Partial pay", Panel: EmployeePartialPaysPanel },
	{ value: "supervision", label: "Supervision", Panel: EmployeeSupervisionPanel },
] as const;

interface EmployeeWorkspaceProps {
	employee: Employee;
	canManage: boolean;
	onEdit: (employee: Employee) => void;
}

function formatTime(time: string | null) {
	if (!time) return "Not set";
	const hours = Number(time.slice(0, 2));
	const minutes = time.slice(3, 5);
	if (!Number.isInteger(hours) || !/^\d{2}$/.test(minutes)) return time;
	return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
}

function Overview({ employee, canManage }: Pick<EmployeeWorkspaceProps, "employee" | "canManage">) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-muted/20 p-4">
				<h2 className="text-lg font-semibold">Employee overview</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					{canManage
						? "Operational HR records, requests, and payroll adjustments are organized in the tabs above."
						: "Operational HR records are available to users with employee-management access."}
				</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Work schedule</p>
					<p className="mt-1 font-medium">{formatTime(employee.workStartTime)} to {formatTime(employee.expectedClockOut)}</p>
					<p className="mt-1 text-sm text-muted-foreground">{employee.workHoursPerDay} hours per day</p>
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Role</p>
					<p className="mt-1 font-medium">{employee.role ? getRoleLabel(employee.role) : "Not assigned"}</p>
					{employee.specialization && <p className="mt-1 text-sm text-muted-foreground">{employee.specialization}</p>}
				</div>
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground">Grace days</p>
					<p className="mt-1 font-medium">{employee.graceDaysRemaining} remaining</p>
					<p className="mt-1 text-sm text-muted-foreground">{employee.graceDaysUsed} used of {employee.graceDaysAllowed}</p>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<ShieldCheck className="h-4 w-4 text-muted-foreground" />
					<h2 className="font-semibold">Skills</h2>
				</div>
				{employee.skills.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{employee.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No skills recorded.</p>
				)}
			</div>
		</div>
	);
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
					<TabsContent value="overview" className="mt-0"><Overview employee={employee} canManage={canManage} /></TabsContent>
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
