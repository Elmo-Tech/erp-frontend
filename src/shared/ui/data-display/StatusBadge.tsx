"use client";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

export type StatusVariant = "default" | "success" | "warning" | "error" | "info" | "secondary";

interface StatusBadgeProps {
	label: string;
	variant?: StatusVariant;
	className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
	default: "bg-gray-100 text-gray-800 border-gray-200",
	success: "bg-green-100 text-green-800 border-green-200",
	warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
	error: "bg-red-100 text-red-800 border-red-200",
	info: "bg-blue-100 text-blue-800 border-blue-200",
	secondary: "bg-purple-100 text-purple-800 border-purple-200",
};

export function StatusBadge({ label, variant = "default", className }: StatusBadgeProps) {
	return <Badge className={cn("border", variantClasses[variant], className)}>{label}</Badge>;
}

// Helper to map common status strings to variants
export function getStatusVariant(status: string): StatusVariant {
	const statusMap: Record<string, StatusVariant> = {
		// Common statuses
		active: "success",
		completed: "success",
		done: "success",
		approved: "success",
		paid: "success",
		signed: "success",
		verified: "success",
		won: "success",
		// Warning statuses
		pending: "warning",
		in_progress: "warning",
		draft: "warning",
		pending_signature: "warning",
		negotiation: "warning",
		proposal: "warning",
		needs_revision: "warning",
		// Error statuses
		cancelled: "error",
		rejected: "error",
		overdue: "error",
		failed: "error",
		terminated: "error",
		lost: "error",
		expired: "error",
		poor: "error",
		// Info statuses
		new: "info",
		open: "info",
		sent: "info",
		viewed: "info",
		contacted: "info",
		qualified: "info",
		// Secondary
		on_hold: "secondary",
		testing: "secondary",
		review: "secondary",
		ui_ux: "secondary",
		development: "secondary",
		average: "secondary",
	};

	return statusMap[status.toLowerCase()] || "default";
}

// Helper for bonus tier variants
export function getBonusTierVariant(tier: string): StatusVariant {
	const tierMap: Record<string, StatusVariant> = {
		excellent: "success",
		good: "info",
		average: "warning",
		poor: "error",
	};
	return tierMap[tier.toLowerCase()] || "default";
}

// Helper for impact level variants
export function getImpactVariant(level: string): StatusVariant {
	const impactMap: Record<string, StatusVariant> = {
		high: "success",
		medium: "warning",
		low: "secondary",
	};
	return impactMap[level.toLowerCase()] || "default";
}

// Helper for category variants
export function getCategoryVariant(category: string): StatusVariant {
	const categoryMap: Record<string, StatusVariant> = {
		ai_tool: "secondary",
		automation: "info",
		new_tech: "success",
		process_improvement: "warning",
	};
	return categoryMap[category.toLowerCase()] || "default";
}
