"use client";

import { use } from "react";
import { ClientProjectViewWidget } from "@/widgets/client-portal/ui/ClientProjectViewWidget";

interface ClientProjectDetailPageProps {
	params: Promise<{ id: string }>;
}

export default function ClientProjectDetailPage({ params }: ClientProjectDetailPageProps) {
	const { id } = use(params);
	const projectId = Number.parseInt(id, 10);

	return <ClientProjectViewWidget projectId={projectId} />;
}
