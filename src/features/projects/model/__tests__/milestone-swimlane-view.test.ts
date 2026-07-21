import { describe, expect, it } from "vitest";
import { MilestoneStatus } from "@/shared/lib/statusHelpers";
import type { Milestone } from "../../api/execution.api";
import { buildMilestoneSwimlaneView } from "../milestone-swimlane-view";

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
	return {
		milestoneId: 8,
		projectId: 2,
		title: "Phase 1 - UI & UX",
		status: MilestoneStatus.PENDING,
		statusLabel: "Pending",
		progressPercentage: 42.4,
		paymentStageId: null,
		invoiceId: null,
		tasks: [],
		createdAt: "2026-06-01T10:00:00.000Z",
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("milestone-swimlane-view", () => {
	it("builds display fields for milestone status, progress, and task count", () => {
		const view = buildMilestoneSwimlaneView(makeMilestone(), 1);

		expect(view.progress).toBe(42.4);
		expect(view.progressLabel).toBe("42%");
		expect(view.taskCountLabel).toBe("1 task");
		expect(view.statusLabel).toBe("Pending");
		expect(view.statusColorClass).toContain("bg-muted");
	});

	it("uses fallback status and zero progress when optional backend fields are empty", () => {
		const view = buildMilestoneSwimlaneView(
			makeMilestone({
				status: null,
				statusLabel: null,
				progressPercentage: null,
			}),
			3,
		);

		expect(view.progress).toBe(0);
		expect(view.progressLabel).toBe("0%");
		expect(view.taskCountLabel).toBe("3 tasks");
		expect(view.statusLabel).toBe("Pending");
	});
});
