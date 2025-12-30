import { ProjectStatus, STATUS_TRANSITIONS } from "../types/project";

/**
 * Get human-readable label for project status
 */
export function getStatusLabel(status: ProjectStatus): string {
	const labels: Record<ProjectStatus, string> = {
		[ProjectStatus.DRAFT]: "Draft",
		[ProjectStatus.ACTIVE]: "Active",
		[ProjectStatus.UI_UX]: "UI/UX Phase",
		[ProjectStatus.DEVELOPMENT]: "Development",
		[ProjectStatus.TESTING]: "Testing",
		[ProjectStatus.COMPLETED]: "Completed",
		[ProjectStatus.ON_HOLD]: "On Hold",
		[ProjectStatus.CANCELLED]: "Cancelled",
	};

	return labels[status];
}

/**
 * Get color class for project status badge
 */
export function getStatusColor(status: ProjectStatus): string {
	const colors: Record<ProjectStatus, string> = {
		[ProjectStatus.DRAFT]: "bg-gray-100 text-gray-800 border-gray-200",
		[ProjectStatus.ACTIVE]: "bg-blue-100 text-blue-800 border-blue-200",
		[ProjectStatus.UI_UX]: "bg-purple-100 text-purple-800 border-purple-200",
		[ProjectStatus.DEVELOPMENT]: "bg-yellow-100 text-yellow-800 border-yellow-200",
		[ProjectStatus.TESTING]: "bg-orange-100 text-orange-800 border-orange-200",
		[ProjectStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
		[ProjectStatus.ON_HOLD]: "bg-amber-100 text-amber-800 border-amber-200",
		[ProjectStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
	};

	return colors[status];
}

/**
 * Check if transition from current status to target status is allowed
 */
export function canTransitionTo(currentStatus: ProjectStatus, targetStatus: ProjectStatus, previousStatus?: ProjectStatus | null): boolean {
	// Special case for ON_HOLD - can return to previous status
	if (currentStatus === ProjectStatus.ON_HOLD && previousStatus) {
		return targetStatus === previousStatus;
	}

	// Special case for CANCELLED - can be reached from any status except COMPLETED
	if (targetStatus === ProjectStatus.CANCELLED && currentStatus !== ProjectStatus.COMPLETED) {
		return true;
	}

	// Check normal transitions
	const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
	return allowedTransitions.includes(targetStatus);
}

/**
 * Get all available status transitions from current status
 */
export function getAvailableTransitions(currentStatus: ProjectStatus, previousStatus?: ProjectStatus | null): ProjectStatus[] {
	// Special case for ON_HOLD - can only return to previous status
	if (currentStatus === ProjectStatus.ON_HOLD && previousStatus) {
		return [previousStatus];
	}

	// Get base transitions
	const baseTransitions = STATUS_TRANSITIONS[currentStatus] || [];

	// Add CANCELLED option for all statuses except COMPLETED
	if (currentStatus !== ProjectStatus.COMPLETED && currentStatus !== ProjectStatus.CANCELLED) {
		const transitionsWithCancel = [...baseTransitions];
		if (!transitionsWithCancel.includes(ProjectStatus.CANCELLED)) {
			transitionsWithCancel.push(ProjectStatus.CANCELLED);
		}
		return transitionsWithCancel;
	}

	return baseTransitions;
}

/**
 * Get status progress percentage (for progress bars)
 */
export function getStatusProgress(status: ProjectStatus): number {
	const progressMap: Record<ProjectStatus, number> = {
		[ProjectStatus.DRAFT]: 0,
		[ProjectStatus.ACTIVE]: 10,
		[ProjectStatus.UI_UX]: 25,
		[ProjectStatus.DEVELOPMENT]: 50,
		[ProjectStatus.TESTING]: 80,
		[ProjectStatus.COMPLETED]: 100,
		[ProjectStatus.ON_HOLD]: 0, // No progress while on hold
		[ProjectStatus.CANCELLED]: 0, // No progress when cancelled
	};

	return progressMap[status];
}

/**
 * Check if status is a terminal state (no further transitions possible)
 */
export function isTerminalStatus(status: ProjectStatus): boolean {
	return status === ProjectStatus.COMPLETED || status === ProjectStatus.CANCELLED;
}

/**
 * Check if status is an active working state
 */
export function isActiveStatus(status: ProjectStatus): boolean {
	return [ProjectStatus.ACTIVE, ProjectStatus.UI_UX, ProjectStatus.DEVELOPMENT, ProjectStatus.TESTING].includes(status);
}

/**
 * Get status icon name (for use with icon libraries)
 */
export function getStatusIcon(status: ProjectStatus): string {
	const icons: Record<ProjectStatus, string> = {
		[ProjectStatus.DRAFT]: "file-text",
		[ProjectStatus.ACTIVE]: "play-circle",
		[ProjectStatus.UI_UX]: "palette",
		[ProjectStatus.DEVELOPMENT]: "code",
		[ProjectStatus.TESTING]: "bug",
		[ProjectStatus.COMPLETED]: "check-circle",
		[ProjectStatus.ON_HOLD]: "pause-circle",
		[ProjectStatus.CANCELLED]: "x-circle",
	};

	return icons[status];
}
