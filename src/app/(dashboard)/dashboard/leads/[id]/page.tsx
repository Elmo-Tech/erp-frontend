import { redirect } from "next/navigation";

interface LeadDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
	await params;
	redirect("/dashboard/leads");
}
