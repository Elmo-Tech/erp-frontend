"use client";

import { use } from "react";
import { ClientDetailsTabs } from "@/features/clients/components/ClientDetailsTabs";

interface ClientDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function ClientDetailsPage({ params }: ClientDetailsPageProps) {
	const { id } = use(params);
	const clientId = parseInt(id, 10);

	return <ClientDetailsTabs clientId={clientId} />;
}
