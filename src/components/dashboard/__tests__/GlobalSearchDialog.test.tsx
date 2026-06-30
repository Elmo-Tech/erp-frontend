import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalSearchDialog } from "../GlobalSearchDialog";

const push = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
}));

vi.mock("@/features/sales/hooks/useGlobalSearch", () => ({
	useGlobalSearch: vi.fn(),
}));

import { useGlobalSearch } from "@/features/sales/hooks/useGlobalSearch";

const mockUseGlobalSearch = vi.mocked(useGlobalSearch);

describe("GlobalSearchDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseGlobalSearch.mockReturnValue({
			query: "tables",
			setQuery: vi.fn(),
			data: {
				success: true,
				message: "ok",
				data: {
					query: "tables",
					totalCount: 1,
					results: {
						clients: [
							{
								id: 3,
								type: "client",
								title: "The Tables Company",
								subtitle: "ERP client",
								status: null,
								url: "/dashboard/clients/3",
								createdAt: "",
							},
						],
					},
				},
			},
			isLoading: false,
		} as unknown as ReturnType<typeof useGlobalSearch>);
	});

	it("opens with the keyboard shortcut and navigates to a selected result", async () => {
		render(<GlobalSearchDialog />);

		fireEvent.keyDown(window, { key: "k", metaKey: true });
		expect(screen.getByPlaceholderText("Search clients, projects, leads...")).toBeInTheDocument();

		fireEvent.click(screen.getByText("The Tables Company"));

		expect(push).toHaveBeenCalledWith("/dashboard/clients/3");
	});
});
