import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectFilesTab } from "../ProjectFilesTab";

const projectFiles = [
	{
		fileId: 22,
		projectId: 2,
		name: "Launch Brief",
		type: "link" as const,
		fileUrl: "https://example.test/launch-brief",
		mimeType: "",
		size: 0,
		description: "Kickoff document",
		category: "document",
		createdAt: "2026-06-01T10:00:00.000Z",
	},
];

vi.mock("@/features/projects/api/execution.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/features/projects/api/execution.api")>();

	return {
		...actual,
		useProjectFiles: () => ({ data: projectFiles, isLoading: false, error: null }),
		useUploadProjectFile: () => ({ mutateAsync: vi.fn(), isPending: false }),
		useDeleteProjectFile: () => ({ mutateAsync: vi.fn(), isPending: false }),
	};
});

describe("ProjectFilesTab", () => {
	it("renders project files through the shared DataTable contract", () => {
		render(<ProjectFilesTab projectId={2} />);

		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Category" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Size" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Created" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
		expect(screen.getByText("Launch Brief")).toBeInTheDocument();
		expect(screen.getByText("Kickoff document")).toBeInTheDocument();
	});
});
