import { describe, expect, it } from "vitest";
import { mapProjectFileListData, mapProjectFileResource, type RawProjectFileResource } from "../project-file-contract";

function makeRawProjectFile(overrides: Partial<RawProjectFileResource> = {}): RawProjectFileResource {
	return {
		fileId: 22,
		projectId: 2,
		name: "Launch Brief",
		type: "link",
		fileUrl: "https://example.test/launch-brief",
		mimeType: "",
		size: 0,
		description: "Kickoff document",
		category: "document",
		createdAt: "2026-06-01T10:00:00.000Z",
		isClientVisible: true,
		isDownloadable: false,
		visibleToRoles: ["manager"],
		createdBy: 1,
		updatedAt: "2026-06-02T10:00:00.000Z",
		...overrides,
	};
}

describe("project file contract", () => {
	it("maps backend file resources to the lightweight frontend contract", () => {
		const projectFile = mapProjectFileResource(makeRawProjectFile());

		expect(projectFile).toEqual({
			fileId: 22,
			projectId: 2,
			name: "Launch Brief",
			type: "link",
			fileUrl: "https://example.test/launch-brief",
			mimeType: "",
			size: 0,
			description: "Kickoff document",
			category: "document",
			createdAt: "2026-06-01T10:00:00.000Z",
		});
		expect("isClientVisible" in projectFile).toBe(false);
		expect("visibleToRoles" in projectFile).toBe(false);
		expect("createdBy" in projectFile).toBe(false);
		expect("updatedAt" in projectFile).toBe(false);
	});

	it("maps project file lists through the same resource contract", () => {
		expect(mapProjectFileListData({ files: [makeRawProjectFile({ fileId: 23, name: "QA Report" })] })).toEqual([
			expect.objectContaining({
				fileId: 23,
				name: "QA Report",
			}),
		]);
	});
});
