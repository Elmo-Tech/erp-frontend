"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeWorkspace, UpdateEmployeeForm } from "@/features/hr/components";
import { useEmployee } from "@/features/hr/hooks/useEmployees";
import { useRoles } from "@/features/admin/hooks/useRoles";
import { getRoleLabel } from "@/config/simplification";
import { useAuthStore } from "@/store/authStore";

export default function EmployeePage() {
	const { id } = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const review = searchParams.get("review");
	const reviewKind = review === "leave" || review === "permission" ? review : undefined;
	const month = searchParams.get("month") ?? "";
	const reviewMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : undefined;
	const employeeQuery = useEmployee(Number(id));
	const canManage = useAuthStore((state) => state.hasPermission("manage_employees"));
	const canEdit = useAuthStore((state) => state.hasPermission("manage_employees") || state.hasPermission("edit_employees"));
	const canManageProtectedUsers = useAuthStore((state) => state.hasPermission("manage_protected_users"));
	const { data: rolesData } = useRoles(canManage);
	const [editing, setEditing] = useState(false);
	const roles = (rolesData?.roles ?? [])
		.filter((role) => role.name !== "super-admin" || canManageProtectedUsers)
		.map((role) => ({ value: role.name, label: getRoleLabel(role.name) }));

	return (
		<div className="space-y-5">
			<Button variant="ghost" asChild><Link href="/dashboard/employees"><ArrowLeft />Back to employees</Link></Button>
			{employeeQuery.isLoading ? <Skeleton className="h-96 w-full" /> : employeeQuery.data ? (
				<>
					<EmployeeWorkspace key={`${id}-${reviewKind}-${reviewMonth}`} employee={employeeQuery.data} canManage={canManage} onEdit={() => setEditing(true)} reviewKind={reviewKind} reviewMonth={reviewMonth} />
					{canEdit && <UpdateEmployeeForm employee={employeeQuery.data} roles={roles} open={editing} onOpenChange={setEditing} />}
				</>
			) : (
				<div className="space-y-3 rounded-xl border p-6">
					<h1 className="text-lg font-semibold">Unable to load employee</h1>
					<p className="text-sm text-muted-foreground">Check the employee link and your access, or try again.</p>
					<Button variant="outline" onClick={() => employeeQuery.refetch()}>Try again</Button>
				</div>
			)}
		</div>
	);
}
