import { describe, expect, it } from "vitest";
import { mapPersonalTaskFormToPayload, personalTaskFormDefaults } from "../personal-task-forms";

describe("personal task forms model", () => {
	it("maps personal task modal fields to the API payload without assignee or milestone", () => {
		expect(
			mapPersonalTaskFormToPayload({
				title: "Prepare weekly notes",
				description: "  Summarize delivery blockers  ",
				dueDate: "2026-06-20",
				priority: "high",
			}),
		).toEqual({
			title: "Prepare weekly notes",
			description: "Summarize delivery blockers",
			dueDate: "2026-06-20",
			priority: "high",
		});
	});

	it("uses medium priority as the default personal task importance", () => {
		expect(personalTaskFormDefaults).toEqual({
			title: "",
			description: "",
			dueDate: "",
			priority: "medium",
		});
	});
});
