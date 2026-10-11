import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateClientForm } from "../UpdateClientForm";
import { ClientStatus, type Client } from "@/features/clients/types";

const mutateAsync = vi.fn();

vi.mock("@/features/clients/hooks/useClients", () => ({
	useUpdateClient: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const client: Client = {
	clientId: 1, name: "Existing Client", email: "client@example.com", phone: "", company: "", position: "",
	address: "", city: "New York", country: "", website: "https://example.com", notes: "",
	status: ClientStatus.ACTIVE, createdAt: "", updatedAt: "",
};

describe("UpdateClientForm", () => {
	beforeEach(() => mutateAsync.mockReset());

	it("Edit an existing client", async () => {
		mutateAsync.mockResolvedValueOnce({ ...client, city: "San Francisco", website: "https://updated.example.com" });
		const onOpenChange = vi.fn();
		render(<UpdateClientForm open client={client} onOpenChange={onOpenChange} />);
		fireEvent.change(screen.getByLabelText("Website"), { target: { value: "https://updated.example.com" } });
		fireEvent.change(screen.getByLabelText("City"), { target: { value: "San Francisco" } });
		fireEvent.click(screen.getByRole("button", { name: "Update Client" }));
		await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
			id: client.clientId,
			payload: expect.objectContaining({ email: client.email, website: "https://updated.example.com", city: "San Francisco" }),
		}));
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});

	it("uses the current client when a controlled edit dialog reopens", async () => {
		const onOpenChange = vi.fn();
		const { rerender } = render(<UpdateClientForm open client={client} onOpenChange={onOpenChange} />);
		fireEvent.change(screen.getByLabelText("Email"), { target: { value: "unsaved@example.com" } });
		rerender(<UpdateClientForm open={false} client={client} onOpenChange={onOpenChange} />);
		const selectedClient = { ...client, clientId: 2, email: "second@example.com" };
		rerender(<UpdateClientForm open client={selectedClient} onOpenChange={onOpenChange} />);
		expect(screen.getByLabelText("Email")).toHaveValue("second@example.com");
		mutateAsync.mockResolvedValueOnce(selectedClient);
		fireEvent.click(screen.getByRole("button", { name: "Update Client" }));
		await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: 2, payload: expect.objectContaining({ email: "second@example.com" }) }));
	});

	it("keeps edits open and displays the server field error on failed validation", async () => {
		mutateAsync.mockRejectedValueOnce({ isAxiosError: true, response: { status: 422, data: { errors: { email: ["The email has already been taken."] } } } });
		const onOpenChange = vi.fn();
		render(<UpdateClientForm open client={client} onOpenChange={onOpenChange} />);
		fireEvent.click(screen.getByRole("button", { name: "Update Client" }));
		await screen.findByText("The email has already been taken.");
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
