import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskDeliverablesPanel } from "../TaskDeliverablesPanel";
import type { TaskDeliverable } from "../../api/execution.api";

const mutationStub = {
	mutate: vi.fn(),
	isPending: false,
};

vi.mock("../../api/execution.api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../api/execution.api")>();

	return {
		...actual,
		useToggleDeliverable: () => mutationStub,
		useCreateDeliverable: () => mutationStub,
		useUpdateDeliverable: () => mutationStub,
		useDeleteDeliverable: () => mutationStub,
	};
});

const deliverables: TaskDeliverable[] = [
	{
		deliverableId: 41,
		taskId: 10,
		title: "Wire authenticated dashboard",
		isCompleted: true,
		createdAt: "2026-06-12T08:00:00.000Z",
		updatedAt: "2026-06-12T09:15:00.000Z",
	},
	{
		deliverableId: 42,
		taskId: 10,
		title: "Connect task filters",
		isCompleted: false,
		createdAt: "2026-06-12T08:00:00.000Z",
		updatedAt: "2026-06-12T09:15:00.000Z",
	},
];

describe("TaskDeliverablesPanel", () => {
	it("renders deliverable progress and management controls", () => {
		render(
			<TaskDeliverablesPanel
				deliverables={deliverables}
				projectId={2}
				taskId={10}
				isDone={false}
				canToggleDeliverables
				canCreateDeliverables
				canEditDeliverables
				canDeleteDeliverables
			/>,
		);

		expect(screen.getByText("Deliverables")).toBeInTheDocument();
		expect(screen.getByText("1/2 done")).toBeInTheDocument();
		expect(screen.getByText("Wire authenticated dashboard")).toBeInTheDocument();
		expect(screen.getByText("Connect task filters")).toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: /edit deliverable/i })).toHaveLength(2);
		expect(screen.getAllByRole("button", { name: /delete deliverable/i })).toHaveLength(2);
		expect(screen.getByPlaceholderText("Add a deliverable…")).toBeInTheDocument();
	});

	it("submits a new deliverable through the canonical mutation payload", () => {
		render(
			<TaskDeliverablesPanel
				deliverables={deliverables}
				projectId={2}
				taskId={10}
				isDone={false}
				canToggleDeliverables
				canCreateDeliverables
				canEditDeliverables
				canDeleteDeliverables
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText("Add a deliverable…"), {
			target: { value: "Document release checklist" },
		});
		fireEvent.click(screen.getByRole("button", { name: /add deliverable/i }));

		expect(mutationStub.mutate).toHaveBeenCalledWith(
			{ projectId: 2, taskId: 10, title: "Document release checklist" },
			expect.objectContaining({
				onSuccess: expect.any(Function),
				onError: expect.any(Function),
			}),
		);
	});

	it("hides write controls for completed tasks or read-only users", () => {
		render(
			<TaskDeliverablesPanel
				deliverables={[]}
				projectId={2}
				taskId={10}
				isDone={false}
				canToggleDeliverables={false}
				canCreateDeliverables={false}
				canEditDeliverables={false}
				canDeleteDeliverables={false}
			/>,
		);

		expect(screen.getByText("No deliverables yet.")).toBeInTheDocument();
		expect(screen.queryByPlaceholderText("Add a deliverable…")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /edit deliverable/i })).not.toBeInTheDocument();
	});

	it("keeps record editing independent from completion permission", () => {
		render(
			<TaskDeliverablesPanel
				deliverables={deliverables}
				projectId={2}
				taskId={10}
				isDone={false}
				canToggleDeliverables={false}
				canCreateDeliverables={false}
				canEditDeliverables
				canDeleteDeliverables={false}
			/>,
		);

		expect(screen.getAllByRole("button", { name: /edit deliverable/i })).toHaveLength(2);
		expect(screen.queryByRole("button", { name: /delete deliverable/i })).not.toBeInTheDocument();
		expect(screen.queryByPlaceholderText("Add a deliverable…")).not.toBeInTheDocument();
	});
});
