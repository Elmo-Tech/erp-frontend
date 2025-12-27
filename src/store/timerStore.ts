import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EntityType = "task" | "quotation" | "lead";

interface TimerState {
	isRunning: boolean;
	entityType: EntityType | null;
	entityId: number | null;
	entityName: string | null;
	startTime: string | null;
	elapsedSeconds: number;

	// Actions
	startTimer: (entityType: EntityType, entityId: number, entityName: string) => void;
	stopTimer: () => void;
	tick: () => void;
	reset: () => void;
}

export const useTimerStore = create<TimerState>()(
	persist(
		(set, get) => ({
			isRunning: false,
			entityType: null,
			entityId: null,
			entityName: null,
			startTime: null,
			elapsedSeconds: 0,

			startTimer: (entityType, entityId, entityName) => {
				set({
					isRunning: true,
					entityType,
					entityId,
					entityName,
					startTime: new Date().toISOString(),
					elapsedSeconds: 0,
				});
			},

			stopTimer: () => {
				set({
					isRunning: false,
				});
			},

			tick: () => {
				const { isRunning, startTime } = get();
				if (isRunning && startTime) {
					const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
					set({ elapsedSeconds: elapsed });
				}
			},

			reset: () => {
				set({
					isRunning: false,
					entityType: null,
					entityId: null,
					entityName: null,
					startTime: null,
					elapsedSeconds: 0,
				});
			},
		}),
		{
			name: "timer-storage",
		}
	)
);
