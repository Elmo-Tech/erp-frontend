"use client";

import { useAuthStore } from "@/store/authStore";
import { useEmployee } from "../hooks/useEmployees";
import { EmployeeOverviewPanel } from "./EmployeeOverviewPanel";
import { EmployeeContractsPanel } from "./EmployeeContractsDialog";
import { MyRequestsPanel } from "./MyRequestsPanel";

export function MyEmployeeProfile() {
	const user = useAuthStore((state) => state.user);
	const query = useEmployee(user?.userId ?? 0);
	if (query.isLoading) return <p>Loading your employee profile…</p>;
	if (!query.data) return <p role="alert">Your employee details could not be loaded.</p>;
	return <div className="space-y-5"><EmployeeOverviewPanel employee={query.data} canManage={false} isActive /><details className="rounded-xl border p-4"><summary className="cursor-pointer font-semibold">My employment contracts</summary><div className="mt-4"><EmployeeContractsPanel employeeId={query.data.userId} employeeName={query.data.name} canManage={false} isActive /></div></details><details open className="rounded-xl border p-4"><summary className="cursor-pointer font-semibold">My requests & decisions</summary><div className="mt-4"><MyRequestsPanel /></div></details></div>;
}
