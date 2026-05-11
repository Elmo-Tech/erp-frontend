"use client";

import { EmployeeReportWidget } from "@/widgets/hr-management/ui/EmployeeReportWidget";

interface EmployeeReportPageProps {
	userId: number;
}

export default function EmployeeReportPage({ userId }: EmployeeReportPageProps) {
	return (
		<div className="mx-auto w-full max-w-5xl">
			<EmployeeReportWidget userId={userId} />
		</div>
	);
}
