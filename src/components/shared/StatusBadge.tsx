"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	LeadStatus,
	LeadStatusLabels,
	LeadStatusColors,
	LeadPriority,
	LeadPriorityLabels,
	LeadPriorityColors,
	QuotationStatus,
	QuotationStatusLabels,
	QuotationStatusColors,
	ContractStatus,
	ContractStatusLabels,
	ContractStatusColors,
	ProjectStatus,
	ProjectStatusLabels,
	ProjectStatusColors,
	TaskStatus,
	TaskStatusLabels,
	TaskStatusColors,
	TaskPriority,
	TaskPriorityLabels,
	TaskPriorityColors,
	InvoiceStatus,
	InvoiceStatusLabels,
	InvoiceStatusColors,
	MilestoneStatus,
	MilestoneStatusLabels,
	MilestoneStatusColors,
} from "@/lib/statusHelpers";

type StatusType = "lead" | "leadPriority" | "quotation" | "contract" | "project" | "task" | "taskPriority" | "invoice" | "milestone";

type StatusValue = LeadStatus | LeadPriority | QuotationStatus | ContractStatus | ProjectStatus | TaskStatus | TaskPriority | InvoiceStatus | MilestoneStatus;

interface StatusBadgeProps {
	type: StatusType;
	status: StatusValue | string;
	size?: "sm" | "md" | "lg";
	showBorder?: boolean;
	className?: string;
}

const STATUS_CONFIG = {
	lead: { labels: LeadStatusLabels, colors: LeadStatusColors },
	leadPriority: { labels: LeadPriorityLabels, colors: LeadPriorityColors },
	quotation: { labels: QuotationStatusLabels, colors: QuotationStatusColors },
	contract: { labels: ContractStatusLabels, colors: ContractStatusColors },
	project: { labels: ProjectStatusLabels, colors: ProjectStatusColors },
	task: { labels: TaskStatusLabels, colors: TaskStatusColors },
	taskPriority: { labels: TaskPriorityLabels, colors: TaskPriorityColors },
	invoice: { labels: InvoiceStatusLabels, colors: InvoiceStatusColors },
	milestone: { labels: MilestoneStatusLabels, colors: MilestoneStatusColors },
} as const;

const SIZE_CLASSES = {
	sm: "text-xs px-2 py-0.5",
	md: "text-xs px-2.5 py-0.5",
	lg: "text-sm px-3 py-1",
};

export function StatusBadge({ type, status, size = "md", showBorder = true, className }: StatusBadgeProps) {
	const config = STATUS_CONFIG[type];
	const label = (config.labels as Record<string, string>)[status] || status;
	const colorClass = (config.colors as Record<string, string>)[status] || "bg-gray-100 text-gray-800";

	return (
		<Badge
			variant="outline"
			className={cn(colorClass, SIZE_CLASSES[size], showBorder ? "border" : "border-transparent", "font-medium", className)}
		>
			{label}
		</Badge>
	);
}

// Convenience components for specific status types
export function LeadStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: LeadStatus | string }) {
	return (
		<StatusBadge
			type="lead"
			status={status}
			{...props}
		/>
	);
}

export function LeadPriorityBadge({ priority, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { priority: LeadPriority | string }) {
	return (
		<StatusBadge
			type="leadPriority"
			status={priority}
			{...props}
		/>
	);
}

export function QuotationStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: QuotationStatus | string }) {
	return (
		<StatusBadge
			type="quotation"
			status={status}
			{...props}
		/>
	);
}

export function ContractStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: ContractStatus | string }) {
	return (
		<StatusBadge
			type="contract"
			status={status}
			{...props}
		/>
	);
}

export function ProjectStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: ProjectStatus | string }) {
	return (
		<StatusBadge
			type="project"
			status={status}
			{...props}
		/>
	);
}

export function TaskStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: TaskStatus | string }) {
	return (
		<StatusBadge
			type="task"
			status={status}
			{...props}
		/>
	);
}

export function TaskPriorityBadge({ priority, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { priority: TaskPriority | string }) {
	return (
		<StatusBadge
			type="taskPriority"
			status={priority}
			{...props}
		/>
	);
}

export function InvoiceStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: InvoiceStatus | string }) {
	return (
		<StatusBadge
			type="invoice"
			status={status}
			{...props}
		/>
	);
}

export function MilestoneStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "type" | "status"> & { status: MilestoneStatus | string }) {
	return (
		<StatusBadge
			type="milestone"
			status={status}
			{...props}
		/>
	);
}
