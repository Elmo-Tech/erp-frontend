"use client";

import { use } from "react";
import { ContractDetailsTabs } from "@/features/sales/components/ContractDetailsTabs";

interface ContractDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function ContractDetailsPage({ params }: ContractDetailsPageProps) {
	const { id } = use(params);
	const contractId = parseInt(id, 10);

	return <ContractDetailsTabs contractId={contractId} />;
}
