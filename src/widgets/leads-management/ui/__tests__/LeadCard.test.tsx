import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Lead } from "@/features/leads/model/types";
import { LeadCard } from "../LeadCard";

vi.mock("@hello-pangea/dnd", () => ({
	Draggable: ({ children }: { children: (provided: Record<string, unknown>, snapshot: { isDragging: boolean }) => React.ReactNode }) =>
		children(
			{
				innerRef: vi.fn(),
				draggableProps: {},
				dragHandleProps: {},
			},
			{ isDragging: false },
		),
}));

const lead: Lead = {
	id: 17,
	name: "Acme renewal",
	company: "Acme",
	email: "buyer@acme.test",
	stage: "proposal",
	createdAt: "2026-07-21T09:00:00.000Z",
	updatedAt: "2026-07-21T09:00:00.000Z",
};

describe("LeadCard", () => {
	it("keeps details and pipeline progression as separate Kanban actions", () => {
		const onCardClick = vi.fn();
		const onAdvance = vi.fn();
		const onManageActions = vi.fn();

		render(
			<LeadCard
				lead={lead}
				index={0}
				isDragDisabled={false}
				onCardClick={onCardClick}
				onAdvance={onAdvance}
				onManageActions={onManageActions}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Move Acme renewal to Quotation" }));

		expect(onAdvance).toHaveBeenCalledWith(lead);
		expect(onCardClick).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "View Acme renewal details" }));
		expect(onCardClick).toHaveBeenCalledWith(17);

		fireEvent.click(screen.getByRole("button", { name: "Manage Acme renewal pipeline actions" }));
		expect(onManageActions).toHaveBeenCalledWith(lead);
	});
});
