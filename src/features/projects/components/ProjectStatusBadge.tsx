"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus, ProjectStatusLabels, ProjectStatusColors } from "@/lib/statusHelpers";
import { FileText, PlayCircle, Palette, Code, Bug, CheckCircle, PauseCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLookupOptions } from "@/features/settings/hooks/useLookupOptions";

interface ProjectStatusBadgeProps {
	status: ProjectStatus | string;
	showIcon?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
}

// Icon mapping for project statuses
const STATUS_ICONS = {
	[ProjectStatus.DRAFT]: FileText,
	[ProjectStatus.ACTIVE]: PlayCircle,
	[ProjectStatus.UI_UX]: Palette,
	[ProjectStatus.DEVELOPMENT]: Code,
	[ProjectStatus.TESTING]: Bug,
	[ProjectStatus.COMPLETED]: CheckCircle,
	[ProjectStatus.ON_HOLD]: PauseCircle,
	[ProjectStatus.CANCELLED]: XCircle,
};

const SIZE_CLASSES = {
	sm: "text-xs px-2 py-0.5",
	md: "text-xs px-2.5 py-0.5",
	lg: "text-sm px-3 py-1",
};

const ICON_SIZES = {
	sm: "h-3 w-3",
	md: "h-3.5 w-3.5",
	lg: "h-4 w-4",
};

/**
 * ProjectStatusBadge component for displaying project status with appropriate styling
 */
export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, showIcon = false, size = "md", className = "" }) => {
	const IconComponent = STATUS_ICONS[status as ProjectStatus];
	const { data } = useLookupOptions("project_status");
	const option = data?.data.find((item) => item.value === status);
	const label = option?.label ?? ProjectStatusLabels[status as ProjectStatus] ?? status;
	const colorClass = option?.color ? "" : ProjectStatusColors[status as ProjectStatus] || "bg-gray-100 text-gray-800 border-gray-200";

	return (
		<Badge
			variant="outline"
			className={cn(colorClass, SIZE_CLASSES[size], "font-medium border inline-flex items-center gap-1.5", className)}
			style={option?.color ? { backgroundColor: `${option.color}15`, color: option.color, borderColor: `${option.color}30` } : undefined}
		>
			{showIcon && IconComponent && <IconComponent className={ICON_SIZES[size]} />}
			{label}
		</Badge>
	);
};
