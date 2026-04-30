import { redirect } from "next/navigation";

interface ClientProfileIndexPageProps {
	params: Promise<{ id: string }>;
}

export default async function ClientProfileIndexPage({ params }: ClientProfileIndexPageProps) {
	const { id } = await params;
	redirect(`/dashboard/clients/${id}/overview`);
}
