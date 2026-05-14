import type { Metadata } from "next";
import EmployeeReportPage from "@/views/hr/admin/EmployeeReportPage";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { id } = await params;
	return { title: `Employee Report #${id} | HR Admin` };
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	return <EmployeeReportPage userId={Number(id)} />;
}
