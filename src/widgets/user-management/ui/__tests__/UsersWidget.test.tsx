import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore, type Permission } from "@/entities/user/model/auth.store";
import { UsersWidget } from "../UsersWidget";

vi.mock("@/features/users/model/use-user-actions", () => ({
	useUsers: () => ({
		data: {
			users: [
				{
					userId: 7,
					name: "Dev User",
					email: "dev@example.com",
					skills: [],
					roles: ["developer"],
					isActive: true,
					createdAt: "2026-07-01T00:00:00.000Z",
					updatedAt: "2026-07-01T00:00:00.000Z",
				},
			],
		},
		isLoading: false,
		error: null,
	}),
	useDeleteUser: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useToggleUserStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/features/users/ui/UserFormModal", () => ({
	UserFormModal: () => null,
}));

vi.mock("@/shared/ui/dialogs/ConfirmDialog", () => ({
	ConfirmDialog: () => null,
}));

function grant(...permissionNames: string[]): Permission[] {
	return permissionNames.map((permissionName) => ({ permissionName, access: true }));
}

describe("UsersWidget permission actions", () => {
	beforeEach(() => {
		useAuthStore.setState({ permissions: [] });
	});

	it("shows ordinary create/edit actions for manage_users but not sensitive actions", () => {
		useAuthStore.setState({ permissions: grant("manage_users") });
		render(<UsersWidget />);

		expect(screen.getByRole("button", { name: "New User" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Edit Dev User" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Toggle Dev User" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Delete Dev User" })).not.toBeInTheDocument();
	});

	it("shows delete only when delete_users is granted", () => {
		useAuthStore.setState({ permissions: grant("delete_users") });
		render(<UsersWidget />);

		expect(screen.getByRole("button", { name: "Delete Dev User" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "New User" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Edit Dev User" })).not.toBeInTheDocument();
	});

	it("shows status toggle only when toggle_user_status is granted", () => {
		useAuthStore.setState({ permissions: grant("toggle_user_status") });
		render(<UsersWidget />);

		expect(screen.getByRole("button", { name: "Toggle Dev User" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Edit Dev User" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Delete Dev User" })).not.toBeInTheDocument();
	});

	it.each(["assign_user_roles", "reset_user_credentials"])("opens the user editor for the exact %s flow", (permission) => {
		useAuthStore.setState({ permissions: grant(permission) });
		render(<UsersWidget />);

		expect(screen.getByRole("button", { name: "Edit Dev User" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "New User" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Toggle Dev User" })).not.toBeInTheDocument();
	});
});
