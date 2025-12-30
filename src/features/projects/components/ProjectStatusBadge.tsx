"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "../types/project";
import { getStatusLabel, getStatusColor, getStatusIcon } from "../helpers/statusHelpers";
import { FileText, PlayCircle, Palette, Code, Bug, CheckCircle, PauseCircle, XCircle } from "lucide-react";

interface ProjectStatusBadgeProps {
	status: ProjectStatus;
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

/**
 * ProjectStatusBadge component for displaying project status with appropriate styling
 * Requirements: 14.2 - Display status with appropriate color using getStatusColor helper
 */
export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, showIcon = false, size = "md", className = "" }) => {
	const IconComponent = STATUS_ICONS[status];

	// Size-based styling
	const sizeClasses = {
		sm: "text-xs px-2 py-1",
		md: "text-sm px-2.5 py-1",
		lg: "text-base px-3 py-1.5",
	};

	const iconSizes = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-5 w-5",
	};

	return (
		<Badge
			className={`
				${getStatusColor(status)} 
				${sizeClasses[size]} 
				font-medium 
				border 
				inline-flex 
				items-center 
				gap-1.5
				${className}
			`}
		>
			{showIcon && IconComponent && <IconComponent className={iconSizes[size]} />}
			{getStatusLabel(status)}
		</Badge>
	);
};
