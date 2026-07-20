import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { NotesPanel } from "../NotesPanel";

vi.mock("../../api/notes.api", () => ({
	useNotes: () => ({ data: [], isLoading: false, isError: false }),
	useCreateNote: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("NotesPanel permissions", () => {
	beforeEach(() => {
		useAuthStore.setState({
			user: { userId: 1, name: "Reader", email: "reader@example.test", avatar: "", role: "reader" },
			permissions: [{ permissionName: "view_internal_notes", access: true }],
		});
	});

	it("keeps notes readable without rendering write controls", () => {
		render(<NotesPanel modelType="client" modelId={10} />);

		expect(screen.getByText("No notes yet")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Add Note" })).not.toBeInTheDocument();
		expect(screen.queryByPlaceholderText("Add an internal note...")).not.toBeInTheDocument();
	});

	it("renders write controls only with the create permission", () => {
		useAuthStore.setState({
			permissions: [
				{ permissionName: "view_internal_notes", access: true },
				{ permissionName: "create_internal_notes", access: true },
			],
		});

		render(<NotesPanel modelType="project" modelId={11} />);

		expect(screen.getByRole("button", { name: "Add Note" })).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Add an internal note...")).toBeInTheDocument();
	});
});
