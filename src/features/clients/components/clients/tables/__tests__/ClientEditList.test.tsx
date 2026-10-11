import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { ClientStatus, type UpdateClientPayload } from "@/features/clients/types";
import { ClientsWrapper } from "@/features/clients/components/wrappers/ClientsWrapper";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/admin/hooks/usePermissions", () => ({ usePermissions: () => ({ canCreateClients: true, canEditClients: true, canDeleteClients: false }) }));

it("Edit an existing client — updated Website and City appear in the list row", async () => {
	let client = { clientId: 1, name: "Automation Client", email: "client@example.com", phone: "", company: "", position: "", address: "", city: "New York", country: "", website: "https://original.example.com", notes: "", status: ClientStatus.ACTIVE, createdAt: "", updatedAt: "" };
	vi.mocked(api.get).mockImplementation(async () => ({ data: { data: { clients: [client], pagination: { total: 1, count: 1, perPage: 15, currentPage: 1, totalPages: 1 } } } }));
	vi.mocked(api.put).mockImplementation(async (_url, payload) => { client = { ...client, ...(payload as UpdateClientPayload) }; return { data: { data: client } }; });
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	render(<QueryClientProvider client={queryClient}><ClientsWrapper /></QueryClientProvider>);
	const row = (await screen.findByText("Automation Client")).closest("tr")!;
	fireEvent.keyDown(within(row).getByRole("button"), { key: "Enter" });
	fireEvent.click(await screen.findByRole("menuitem", { name: /edit/i }));
	fireEvent.change(screen.getByLabelText("Website"), { target: { value: "https://automation-test-client.example.com" } });
	fireEvent.change(screen.getByLabelText("City"), { target: { value: "San Francisco" } });
	fireEvent.click(screen.getByRole("button", { name: "Update Client" }));
	await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	expect(within(row).getByText("https://automation-test-client.example.com")).toBeVisible();
	expect(within(row).getByText("San Francisco")).toBeVisible();
});
