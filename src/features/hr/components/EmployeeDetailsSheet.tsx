"use client";

import { useState } from "react";
import { Edit, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoleLabel } from "@/config/simplification";
import type { Employee } from "../types";
import { EmployeeAdvancesPanel } from "./EmployeeAdvancesDialog";
import { EmployeeContractsPanel } from "./EmployeeContractsDialog";
import { EmployeeDirectDeductionsPanel } from "./EmployeeDirectDeductionsDialog";
import { EmployeeDocumentsPanel } from "./EmployeeDocumentsDialog";
import { EmployeeLateDeductionsPanel } from "./EmployeeLateDeductionsDialog";
import { EmployeeLeavesPanel } from "./EmployeeLeavesDialog";
import { EmployeeOvertimeRequestsPanel } from "./EmployeeOvertimeRequestsDialog";
import { EmployeePartialPaysPanel } from "./EmployeePartialPaysDialog";
import { EmployeeShortPermissionsPanel } from "./EmployeeShortPermissionsDialog";

type WorkspaceTab = "overview" | "employment" | "time-leave" | "financial";

interface EmployeeDetailsSheetProps {
	employee: Employee;
	open: boolean;
	onOpenChange: (open: boolean) => void;
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

function Overview({ employee, canManage }: Pick<EmployeeDetailsSheetProps, "employee" | "canManage">) {
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

export function EmployeeDetailsSheet({ employee, open, onOpenChange, canManage, onEdit }: EmployeeDetailsSheetProps) {
	const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
	const panelProps = {
		employeeId: employee.userId,
		employeeName: employee.name,
		canManage,
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 p-0 sm:max-w-4xl xl:max-w-5xl">
				<SheetHeader className="border-b pr-12 sm:p-6">
					<div className="flex items-start gap-3">
						<Avatar className="h-12 w-12">
							<AvatarImage src={employee.avatar} alt={employee.name} />
							<AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<SheetTitle>{employee.name}</SheetTitle>
								<Badge variant={employee.isActive ? "default" : "secondary"}>{employee.isActive ? "Active" : "Inactive"}</Badge>
							</div>
							<SheetDescription className="truncate">{employee.email}</SheetDescription>
						</div>
						{canManage && (
							<Button type="button" variant="outline" size="sm" onClick={() => onEdit(employee)}>
								<Edit />
								Edit
							</Button>
						)}
					</div>
				</SheetHeader>

				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WorkspaceTab)} className="min-h-0 flex-1 gap-0">
					<div className="overflow-x-auto border-b px-4 pt-3 sm:px-6">
						<TabsList className="h-auto min-w-full justify-start gap-1 rounded-none bg-transparent p-0">
							<TabsTrigger value="overview" className="flex-none rounded-b-none px-3">Overview</TabsTrigger>
							{canManage && (
								<>
									<TabsTrigger value="employment" className="flex-none rounded-b-none px-3">Employment</TabsTrigger>
									<TabsTrigger value="time-leave" className="flex-none rounded-b-none px-3">Time & leave</TabsTrigger>
									<TabsTrigger value="financial" className="flex-none rounded-b-none px-3">Financial</TabsTrigger>
								</>
							)}
						</TabsList>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
						<TabsContent value="overview" className="mt-0">
							<Overview employee={employee} canManage={canManage} />
						</TabsContent>
						{canManage && (
							<>
								<TabsContent value="employment" forceMount className="mt-0 data-[state=inactive]:hidden">
									<div className="space-y-8">
										<EmployeeContractsPanel {...panelProps} isActive={activeTab === "employment"} />
										<div className="border-t" />
										<EmployeeDocumentsPanel {...panelProps} isActive={activeTab === "employment"} />
									</div>
								</TabsContent>
								<TabsContent value="time-leave" forceMount className="mt-0 data-[state=inactive]:hidden">
									<div className="space-y-8">
										<EmployeeLeavesPanel {...panelProps} isActive={activeTab === "time-leave"} />
										<div className="border-t" />
										<EmployeeShortPermissionsPanel {...panelProps} isActive={activeTab === "time-leave"} />
										<div className="border-t" />
										<EmployeeOvertimeRequestsPanel {...panelProps} isActive={activeTab === "time-leave"} />
										<div className="border-t" />
										<EmployeeLateDeductionsPanel {...panelProps} isActive={activeTab === "time-leave"} />
									</div>
								</TabsContent>
								<TabsContent value="financial" forceMount className="mt-0 data-[state=inactive]:hidden">
									<div className="space-y-8">
										<EmployeeDirectDeductionsPanel {...panelProps} isActive={activeTab === "financial"} />
										<div className="border-t" />
										<EmployeeAdvancesPanel {...panelProps} isActive={activeTab === "financial"} />
										<div className="border-t" />
										<EmployeePartialPaysPanel {...panelProps} isActive={activeTab === "financial"} />
									</div>
								</TabsContent>
							</>
						)}
					</div>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
}
