import { describe, expect, it } from "vitest";
import { ProjectStatus } from "@/entities/project/model/types";
import { toChangedUpdateProjectPayload, type CreateDirectProjectFormData } from "../project.schema";

const baseFormData: CreateDirectProjectFormData = {
	clientId: 1,
	title: "Legacy Project",
	description: "Existing scope",
	budget: 1000,
	deadline: "2026-06-01",
	status: ProjectStatus.ACTIVE,
	reason: "",
};

const baseProject = {
	title: "Legacy Project",
	description: "Existing scope",
	budget: 1000,
	deadline: "2026-06-01",
	status: ProjectStatus.ACTIVE,
};

describe("project update payload", () => {
	it("omits unchanged budget and deadline so backend validators do not run on stale values", () => {
		const payload = toChangedUpdateProjectPayload(
			{
				...baseFormData,
				title: "Legacy Project v2",
			},
			baseProject,
		);

		expect(payload).toEqual({ title: "Legacy Project v2" });
	});

	it("includes reason only when budget or deadline changed", () => {
		const payload = toChangedUpdateProjectPayload(
			{
				...baseFormData,
				budget: 1250,
				reason: "Scope increased",
			},
			baseProject,
		);

		expect(payload).toEqual({
			budget: 1250,
			reason: "Scope increased",
		});
	});
});
