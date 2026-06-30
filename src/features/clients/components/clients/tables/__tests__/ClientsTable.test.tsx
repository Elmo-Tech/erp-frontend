import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientsTable } from "../ClientsTable";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/admin/hooks/usePermissions", () => ({
	usePermissions: () => ({
		canCreateClients: true,
		canEditClients: true,
		canDeleteClients: true,
	}),
}));

vi.mock("@/features/clients/hooks/useClients", () => ({
	useClients: vi.fn(),
	useDeleteClient: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { useClients } from "@/features/clients/hooks/useClients";

const mockUseClients = vi.mocked(useClients);

const renderWithClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("ClientsTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseClients.mockReturnValue({
			data: {
				clients: [
					{
						clientId: 1,
						name: "Active Client",
						email: "active@example.com",
						phone: "",
						company: "",
						position: "",
						address: "",
						city: "",
						country: "",
						website: "",
						notes: "",
						status: "active",
						createdAt: "",
						updatedAt: "",
					},
				],
				pagination: { total: 1, count: 1, perPage: 15, currentPage: 1, totalPages: 1 },
			},
			isLoading: false,
			error: null,
		} as ReturnType<typeof useClients>);
	});

	it("passes selected status into the clients query filters", async () => {
		renderWithClient(
			<ClientsTable
				onEdit={vi.fn()}
				onAdd={vi.fn()}
			/>
		);

		fireEvent.change(screen.getByRole("combobox", { name: "Client status" }), { target: { value: "active" } });

		expect(mockUseClients).toHaveBeenLastCalledWith(expect.objectContaining({ status: "active" }));
	});
});
