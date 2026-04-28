"use client";

import { use } from "react";
import { PerformanceEvaluationWidget } from "@/widgets/hr-management/ui/PerformanceEvaluationWidget";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function EvaluationPeriodDetailPage({ params }: PageProps) {
	const { id } = use(params);
	const periodId = Number.parseInt(id, 10);

	return <PerformanceEvaluationWidget periodId={periodId} />;
}
