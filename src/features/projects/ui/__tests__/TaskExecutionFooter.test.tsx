import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExecutionTaskStatus } from "../../api/execution.api";
import { TaskExecutionFooter } from "../TaskExecutionFooter";

const markDoneAction = {
	label: "Mark as Done",
	targetStatus: ExecutionTaskStatus.DONE,
	useCompleteEndpoint: true,
	requiresAllDeliverables: true,
} as const;

const submitForReviewAction = {
	label: "Submit for Review",
	targetStatus: ExecutionTaskStatus.IN_REVIEW,
	useCompleteEndpoint: false,
	requiresAllDeliverables: false,
} as const;

describe("TaskExecutionFooter", () => {
	it("blocks completion until required deliverables are done", () => {
		render(
			<TaskExecutionFooter
				primaryAction={markDoneAction}
				isDone={false}
				allDeliverablesDone={false}
				remainingDeliverables={2}
				isSaving={false}
				onPrimaryAction={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: /mark as done/i })).toBeDisabled();
		expect(screen.getByText("2 deliverables still pending")).toBeInTheDocument();
	});

	it("runs the available primary action", () => {
		const onPrimaryAction = vi.fn();

		render(
			<TaskExecutionFooter
				primaryAction={submitForReviewAction}
				isDone={false}
				allDeliverablesDone
				remainingDeliverables={0}
				isSaving={false}
				onPrimaryAction={onPrimaryAction}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: /submit for review/i }));

		expect(onPrimaryAction).toHaveBeenCalledTimes(1);
	});

	it("renders the completed task state without a primary action", () => {
		render(
			<TaskExecutionFooter
				primaryAction={null}
				isDone
				allDeliverablesDone
				remainingDeliverables={0}
				isSaving={false}
				onPrimaryAction={vi.fn()}
			/>,
		);

		expect(screen.getByText("Task completed")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /mark as done/i })).not.toBeInTheDocument();
	});
});
