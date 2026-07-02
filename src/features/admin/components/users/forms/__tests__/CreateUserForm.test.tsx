import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateUserForm } from "../CreateUserForm";

const mocks = vi.hoisted(() => ({
	mutateAsync: vi.fn(),
	toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		error: mocks.toastError,
		success: vi.fn(),
	},
}));

vi.mock("../../../../hooks/useUsers", () => ({
	useCreateUser: () => ({
		mutateAsync: mocks.mutateAsync,
		isPending: false,
	}),
}));

vi.mock("../../../../hooks/useRoles", () => ({
	useRoles: () => ({
		data: { roles: [{ name: "admin" }] },
	}),
}));

vi.mock("../../../../hooks/useEnums", () => ({
	useUserSpecializations: () => ({
		data: { data: [] },
	}),
}));

vi.mock("../../../../hooks/usePermissions", () => ({
	usePermissions: () => ({
		canViewInternalCosts: false,
		canManageInternalCosts: false,
	}),
}));

const renderWithClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("CreateUserForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows the API validation message when duplicate email creation fails", async () => {
		mocks.mutateAsync.mockRejectedValue({
			response: {
				status: 422,
				data: { errors: { email: ["The email has already been taken."] } },
			},
		});

		renderWithClient(
			<CreateUserForm
				open
				onOpenChange={vi.fn()}
			/>
		);

		fireEvent.change(screen.getByLabelText("Name"), { target: { value: "QA User" } });
		fireEvent.change(screen.getByLabelText("Email"), { target: { value: "qa@example.com" } });
		fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
		fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "password123" } });
		fireEvent.click(screen.getByRole("button", { name: "Create User" }));

		await waitFor(() => {
			expect(mocks.toastError).toHaveBeenCalledWith("The email has already been taken.");
		});
	});
});
