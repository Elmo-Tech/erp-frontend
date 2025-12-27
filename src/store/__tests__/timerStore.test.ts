import { describe, it, expect, beforeEach } from "vitest";
import { useTimerStore } from "../timerStore";

describe("Timer Store", () => {
	beforeEach(() => {
		// Reset store state before each test
		useTimerStore.getState().reset();
	});

	it("should initialize with default state", () => {
		const state = useTimerStore.getState();

		expect(state.isRunning).toBe(false);
		expect(state.entityType).toBe(null);
		expect(state.entityId).toBe(null);
		expect(state.entityName).toBe(null);
		expect(state.startTime).toBe(null);
		expect(state.elapsedSeconds).toBe(0);
	});

	it("should start timer correctly", () => {
		const { startTimer } = useTimerStore.getState();

		startTimer("lead", 123, "Test Lead");

		const state = useTimerStore.getState();
		expect(state.isRunning).toBe(true);
		expect(state.entityType).toBe("lead");
		expect(state.entityId).toBe(123);
		expect(state.entityName).toBe("Test Lead");
		expect(state.startTime).toBeTruthy();
		expect(state.elapsedSeconds).toBe(0);
	});

	it("should stop timer correctly", () => {
		const { startTimer, stopTimer } = useTimerStore.getState();

		// Start timer first
		startTimer("quotation", 456, "Test Quotation");
		expect(useTimerStore.getState().isRunning).toBe(true);

		// Stop timer
		stopTimer();
		expect(useTimerStore.getState().isRunning).toBe(false);
	});

	it("should reset timer state", () => {
		const { startTimer, reset } = useTimerStore.getState();

		// Start timer first
		startTimer("task", 789, "Test Task");

		// Reset
		reset();

		const state = useTimerStore.getState();
		expect(state.isRunning).toBe(false);
		expect(state.entityType).toBe(null);
		expect(state.entityId).toBe(null);
		expect(state.entityName).toBe(null);
		expect(state.startTime).toBe(null);
		expect(state.elapsedSeconds).toBe(0);
	});

	it("should calculate elapsed seconds correctly", () => {
		const { startTimer, tick } = useTimerStore.getState();

		// Mock Date.now to control time
		const mockStartTime = new Date("2023-01-01T10:00:00Z");
		const mockCurrentTime = new Date("2023-01-01T10:01:30Z"); // 90 seconds later

		// Start timer with mocked start time
		startTimer("lead", 123, "Test Lead");
		useTimerStore.setState({ startTime: mockStartTime.toISOString() });

		// Mock Date.now for tick calculation
		const originalDateNow = Date.now;
		Date.now = () => mockCurrentTime.getTime();

		// Call tick
		tick();

		// Restore Date.now
		Date.now = originalDateNow;

		const state = useTimerStore.getState();
		expect(state.elapsedSeconds).toBe(90);
	});

	it("should not calculate elapsed seconds when not running", () => {
		const { tick } = useTimerStore.getState();

		// Call tick without starting timer
		tick();

		const state = useTimerStore.getState();
		expect(state.elapsedSeconds).toBe(0);
	});
});
