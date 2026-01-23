"use client";

import { Badge } from "@/components/ui/badge";
import type { CodeReviewStatus } from "../types/codeReview";

interface CodeReviewStatusBadgeProps {
	status: CodeReviewStatus;
}

export function CodeReviewStatusBadge({ status }: CodeReviewStatusBadgeProps) {
	const getStatusConfig = (status: CodeReviewStatus) => {
		switch (status) {
			case "pending":
				return { label: "Pending", variant: "secondary" as const };
			case "approved":
				return { label: "Approved", variant: "default" as const };
			case "needs_revision":
				return { label: "Needs Revision", variant: "destructive" as const };
			case "rejected":
				return { label: "Rejected", variant: "destructive" as const };
			default:
				return { label: "Unknown", variant: "secondary" as const };
		}
	};

	const { label, variant } = getStatusConfig(status);

	return <Badge variant={variant}>{label}</Badge>;
}
