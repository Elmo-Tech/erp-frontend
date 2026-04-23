"use client";

import { use } from "react";
import { LeadDetailsTabs } from "@/_old/features/sales/components/LeadDetailsTabs";

interface LeadDetailsPageProps {
	params: Promise<{ id: string }>;
}

export default function LeadDetailsPage({ params }: LeadDetailsPageProps) {
	const { id } = use(params);
	const leadId = parseInt(id, 10);

	return <LeadDetailsTabs leadId={leadId} />;
}
