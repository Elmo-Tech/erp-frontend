import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateProjectForm } from "../CreateProjectForm";

vi.mock("@/features/projects/hooks/useProjects", () => ({
	useCreateDirectProject: vi.fn(),
}));

vi.mock("@/features/clients/hooks/useClients", () => ({
	useClients: vi.fn(),
	useClient: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

vi.mock("@/features/settings/hooks/useLookupOptions", () => ({
	useLookupOptions: vi.fn(),
}));

import { useClients } from "@/features/clients/hooks/useClients";
import { useCreateDirectProject } from "@/features/projects/hooks/useProjects";
import { useLookupOptions } from "@/features/settings/hooks/useLookupOptions";

const mockUseClients = vi.mocked(useClients);
const mockUseCreateDirectProject = vi.mocked(useCreateDirectProject);
const mockUseLookupOptions = vi.mocked(useLookupOptions);
const mutateAsync = vi.fn();

const renderWithClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("CreateProjectForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCreateDirectProject.mockReturnValue({
			mutateAsync,
			isPending: false,
		} as unknown as ReturnType<typeof useCreateDirectProject>);
		mockUseLookupOptions.mockImplementation((type) => ({
			data: {
				success: true,
				message: "Project types retrieved",
				data: type === "project_status" ? [
					{ id: 7, label: "Client Review", value: "client_review", is_active: true },
					{ id: 8, label: "Retired Status", value: "retired", is_active: false },
				] : [
					{ id: 3, label: "Website", value: "website", is_active: true },
					{ id: 4, label: "Legacy", value: "legacy", is_active: false },
				],
			},
			isLoading: false,
		} as ReturnType<typeof useLookupOptions>));
		mockUseClients.mockReturnValue({
			data: {
				clients: [
					{
						clientId: 7,
						name: "The Tables Company",
						email: "client@example.com",
						phone: "",
						company: "The Tables",
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

	it("requires selecting a client when the project is created from the projects page", async () => {
		renderWithClient(
			<CreateProjectForm
				open
				onOpenChange={vi.fn()}
			/>
		);

		expect(screen.getByText("Client")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
		expect(screen.getByRole("option", { name: "Client Review" })).toBeInTheDocument();
		expect(screen.queryByRole("option", { name: "Retired Status" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("option", { name: "Client Review" }));
		fireEvent.click(screen.getByRole("combobox", { name: "Client" }));
		fireEvent.click(await screen.findByText("The Tables Company"));
		fireEvent.click(screen.getByRole("combobox", { name: "Project Type" }));
		const websiteOption = await screen.findByRole("option", { name: "Website" });
		expect(screen.queryByRole("option", { name: "Legacy" })).not.toBeInTheDocument();
		fireEvent.click(websiteOption);
		fireEvent.change(screen.getByLabelText("Project Title"), { target: { value: "Website rebuild" } });
		const submitButton = screen.getByRole("button", { name: "Create Project" });

		await waitFor(() => expect(submitButton).not.toBeDisabled());
		fireEvent.click(submitButton);

		await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(
				expect.objectContaining({
					clientId: 7,
					projectTypeId: 3,
					status: "client_review",
					title: "Website rebuild",
			})
		));
	});
});
