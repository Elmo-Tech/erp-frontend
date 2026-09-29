import type { TaskHelpRequestStatus, TaskSupervisionUser } from "../types/taskSupervision";

export interface SupervisorCandidate extends TaskSupervisionUser {}

export const taskHelpRequestStatusLabels: Record<TaskHelpRequestStatus, string> = {
	open: "Open",
	acknowledged: "Acknowledged",
	resolved: "Resolved",
	cancelled: "Cancelled",
};

export function getViableSupervisorCandidates(users: Array<TaskSupervisionUser | null | undefined>): SupervisorCandidate[] {
	const candidates = new Map<number, SupervisorCandidate>();

	for (const user of users) {
		if (user && !candidates.has(user.userId)) {
			candidates.set(user.userId, user);
		}
	}

	return [...candidates.values()].sort((left, right) => left.name.localeCompare(right.name));
}

export function getSupervisionElapsedSeconds(startedAt: string, now = Date.now()): number {
	const startedAtMs = new Date(startedAt).getTime();
	if (Number.isNaN(startedAtMs)) return 0;

	return Math.max(0, Math.floor((now - startedAtMs) / 1000));
}

export function formatSupervisionDuration(seconds: number): string {
	const safeSeconds = Math.max(0, Math.floor(seconds));
	const hours = Math.floor(safeSeconds / 3_600);
	const minutes = Math.floor((safeSeconds % 3_600) / 60);
	const remainingSeconds = safeSeconds % 60;

	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
