"use client";

import { use } from "react";
import { ClientDetailsComposite } from "@/widgets/client-management/ui/ClientDetailsComposite";

interface ClientDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function ClientDetailsPage({ params }: ClientDetailsPageProps) {
	const { id } = use(params);
	const clientId = parseInt(id, 10);

	return <ClientDetailsComposite clientId={clientId} />;
}
