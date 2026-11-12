import api from "@/lib/axios";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { projectPipelineApi } from "../../../api/projectPipeline";
import type { PipelineTask, ProjectWorkflowStage } from "../../../types/pipeline";
import { PipelineTaskDialog } from "../PipelineTaskDialog";

vi.mock("@/lib/axios", () => ({ default: { post: vi.fn().mockResolvedValue({ data: {} }) } }));
vi.mock("../../../api/projectPipeline", () => ({ projectPipelineApi: { createTask: vi.fn(), updateTask: vi.fn() } }));
vi.mock("@/features/hr/hooks/useEmployees", () => ({ useEmployees: () => ({ data: { employees: [{ userId: 9, name: "Sam Supervisor" }, { userId: 10, name: "Nour Supervisor" }] } }) }));
vi.mock("../../../hooks/useProjectMembers", () => ({ useProjectMembers: () => ({ data: { members: [] } }) }));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({ canAssignTasks: true, canManageTaskTeam: true }) }));
vi.mock("../PipelineEmployeePicker", () => ({ PipelineEmployeePicker: () => <div>Employees</div> }));
vi.mock("../PipelineTaskCoverField", () => ({ PipelineTaskCoverField: () => null }));
vi.mock("@/features/settings/hooks/useLookupOptions", () => ({ useLookupOptions: () => ({ data: { data: [
	{ id: 1, label: "Design", is_active: true }, { id: 2, label: "Social", is_active: true }, { id: 3, label: "Video", is_active: true },
] }, isLoading: false, isError: false }) }));

const stage: ProjectWorkflowStage = { stageId: 3, name: "Planned", slug: "planned", color: "#2563EB", category: "planned", position: 1, isTerminal: false, tasks: [] };
const task: PipelineTask = { taskId: 12, projectId: 2, workflowStageId: 3, title: "Delivery task", priority: "medium", assignees: [], position: 0, supervisorId: 9, supervisor: { userId: 9, name: "Sam Supervisor" } };

function renderDialog(existing?: PipelineTask) {
	const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
	return render(<QueryClientProvider client={client}><PipelineTaskDialog projectId={2} stage={stage} stages={[stage]} task={existing} open onOpenChange={vi.fn()} /></QueryClientProvider>);
}

describe("PipelineTaskDialog supervisor assignment", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ role: "admin" });
	});

	it("saves the selected supervisor with the new task in one request", async () => {
		vi.mocked(projectPipelineApi.createTask).mockResolvedValue(task);
		renderDialog();
		fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Delivery task" } });
		fireEvent.keyDown(screen.getByLabelText("Supervisor"), { key: "ArrowDown" });
		fireEvent.click(await screen.findByRole("option", { name: "Sam Supervisor" }));
		fireEvent.click(screen.getByRole("button", { name: "Create task" }));
		await waitFor(() => expect(projectPipelineApi.createTask).toHaveBeenCalledWith(2, expect.objectContaining({ title: "Delivery task", supervisorIds: [9] })));
	});

	it("saves two supervisors and checklist items", async () => {
		vi.mocked(projectPipelineApi.createTask).mockResolvedValue(task);
		renderDialog();
		fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Delivery task" } });
		fireEvent.keyDown(screen.getByLabelText("Supervisor"), { key: "ArrowDown" });
		fireEvent.click(await screen.findByRole("option", { name: "Sam Supervisor" }));
		fireEvent.keyDown(screen.getByLabelText("Second supervisor"), { key: "ArrowDown" });
		fireEvent.click(await screen.findByRole("option", { name: "Nour Supervisor" }));
		fireEvent.click(screen.getByRole("button", { name: "Add checklist item" }));
		fireEvent.change(screen.getByRole("textbox", { name: "Checklist item 1" }), { target: { value: "Draft layout" } });
		fireEvent.click(screen.getByRole("button", { name: "Create task" }));
		await waitFor(() => expect(projectPipelineApi.createTask).toHaveBeenCalledWith(2, expect.objectContaining({ supervisorIds: [9, 10], checklist: [expect.objectContaining({ text: "Draft layout", completed: false })] })));
	});

	it("saves up to two task types and prevents selecting a third", async () => {
		vi.mocked(projectPipelineApi.createTask).mockResolvedValue(task);
		renderDialog();
		fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Delivery task" } });
		fireEvent.click(screen.getByRole("checkbox", { name: "Design" }));
		fireEvent.click(screen.getByRole("checkbox", { name: "Social" }));
		expect(screen.getByRole("checkbox", { name: "Video" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Create task" }));
		await waitFor(() => expect(projectPipelineApi.createTask).toHaveBeenCalledWith(2, expect.objectContaining({ projectTypeIds: [1, 2] })));
	});

	it("uploads a PDF selected in the task editor after saving the task", async () => {
		vi.mocked(projectPipelineApi.updateTask).mockResolvedValue(task);
		renderDialog(task);
		const file = new File(["sample"], "brief.pdf", { type: "application/pdf" });
		fireEvent.change(screen.getByLabelText("Documents (PDF or PowerPoint)"), { target: { files: [file] } });
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		await waitFor(() => expect(api.post).toHaveBeenCalledWith("/tasks/12/attachments", expect.any(FormData), expect.any(Object)));
		const form = vi.mocked(api.post).mock.calls[0][1] as FormData;
		expect(form.get("file")).toBe(file);
	});

	it("removes the supervisor explicitly when editing", async () => {
		vi.mocked(projectPipelineApi.updateTask).mockResolvedValue({ ...task, supervisorId: null, supervisor: null });
		renderDialog(task);
		fireEvent.keyDown(screen.getByLabelText("Supervisor"), { key: "ArrowDown" });
		fireEvent.click(await screen.findByRole("option", { name: "No supervisor" }));
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		await waitFor(() => expect(projectPipelineApi.updateTask).toHaveBeenCalledWith(2, 12, expect.objectContaining({ supervisorIds: [] })));
	});
});
