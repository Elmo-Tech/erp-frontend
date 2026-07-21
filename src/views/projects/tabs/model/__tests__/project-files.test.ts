import { describe, expect, it } from "vitest";
import {
	buildProjectFileUploadDefaults,
	buildProjectFileUploadFormData,
	formatProjectFileSize,
	getProjectFileCategoryClass,
} from "../project-files";

describe("project-files model", () => {
	it("formats project file sizes for empty, byte, kilobyte, and megabyte values", () => {
		expect(formatProjectFileSize(null)).toBe("—");
		expect(formatProjectFileSize(0)).toBe("—");
		expect(formatProjectFileSize(512)).toBe("512 B");
		expect(formatProjectFileSize(2048)).toBe("2.0 KB");
		expect(formatProjectFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
	});

	it("builds upload defaults from the selected file name", () => {
		const file = new File(["content"], "final.wireframes.pdf", { type: "application/pdf" });

		expect(buildProjectFileUploadDefaults(file)).toEqual({
			name: "final.wireframes",
			category: "general",
			description: "",
		});
	});

	it("maps upload form values to multipart data without empty descriptions", () => {
		const file = new File(["content"], "brief.pdf", { type: "application/pdf" });
		const formData = buildProjectFileUploadFormData(file, {
			name: "Launch Brief",
			category: "document",
			description: "  ",
		});

		expect(formData.get("file")).toBe(file);
		expect(formData.get("name")).toBe("Launch Brief");
		expect(formData.get("type")).toBe("file");
		expect(formData.get("category")).toBe("document");
		expect(formData.has("description")).toBe(false);
	});

	it("trims non-empty descriptions and falls back for unknown categories", () => {
		const file = new File(["content"], "brief.pdf", { type: "application/pdf" });
		const formData = buildProjectFileUploadFormData(file, {
			name: "Launch Brief",
			category: "document",
			description: "  Kickoff document  ",
		});

		expect(formData.get("description")).toBe("Kickoff document");
		expect(getProjectFileCategoryClass("document")).toContain("bg-blue-50");
		expect(getProjectFileCategoryClass("unknown")).toContain("bg-muted");
	});
});
