export function formatElapsedTime(totalSeconds: number): string {
	const safeSeconds = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(safeSeconds / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const seconds = safeSeconds % 60;

	return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function elapsedSecondsSince(startTime: string | null | undefined, nowMs = Date.now()): number {
	if (!startTime) return 0;

	const startedAt = new Date(startTime).getTime();
	if (!Number.isFinite(startedAt)) return 0;

	return Math.max(0, Math.floor((nowMs - startedAt) / 1000));
}
