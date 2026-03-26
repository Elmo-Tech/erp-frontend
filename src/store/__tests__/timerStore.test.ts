import { beforeEach, describe, expect, it } from "vitest";
import { useTimerStore } from "../timerStore";

describe("Timer Store", () => {
	beforeEach(() => {
		useTimerStore.setState({
			activeTimer: null,
			isLoading: true,
			isConnected: false,
		});
	});

	it("should initialize with the default timer state", () => {
		const state = useTimerStore.getState();

		expect(state.activeTimer).toBeNull();
		expect(state.isLoading).toBe(true);
		expect(state.isConnected).toBe(false);
	});

	it("should update the active timer", () => {
		const timer = {
			timeEntryId: 7,
			startTime: "2026-03-16T10:00:00.000Z",
			trackableType: "task",
			trackableId: 42,
			trackableDisplayName: "Landing page redesign",
			isActive: true,
		};

		useTimerStore.getState().setActiveTimer(timer);

		expect(useTimerStore.getState().activeTimer).toEqual(timer);
	});

	it("should update loading and connection state independently", () => {
		const { setIsLoading, setIsConnected } = useTimerStore.getState();

		setIsLoading(false);
		setIsConnected(true);

		const state = useTimerStore.getState();
		expect(state.isLoading).toBe(false);
		expect(state.isConnected).toBe(true);
		expect(state.activeTimer).toBeNull();
	});
});
