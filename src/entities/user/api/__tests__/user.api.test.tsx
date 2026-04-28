import { describe, expect, it, vi, type Mock } from "vitest";
import api from "@/shared/api/base";
import { userApi } from "../user.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

const mockedApi = api as unknown as {
	get: Mock;
	post: Mock;
	put: Mock;
	delete: Mock;
};

describe("userApi", () => {
	it("fetches admin users with filters", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { users: [], pagination: { total: 0 } } } });

		await userApi.getUsers({ search: "sara", role: "admin", isActive: true, page: 2, perPage: 25 });

		expect(mockedApi.get).toHaveBeenCalledWith("/admin/users/manage?filter%5Bsearch%5D=sara&filter%5Brole%5D=admin&filter%5BisActive%5D=true&page=2&perPage=25");
	});

	it("fetches roles and wraps the backend array response", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: [{ id: 1, name: "admin", permissions: [] }] } });

		await expect(userApi.getRoles()).resolves.toEqual({ roles: [{ id: 1, name: "admin", permissions: [] }] });
		expect(mockedApi.get).toHaveBeenCalledWith("/admin/roles");
	});

	it("fetches audit logs with filters", async () => {
		mockedApi.get.mockResolvedValueOnce({ data: { data: { auditLogs: [], pagination: { total: 0 } } } });

		await userApi.getAuditLogs({ action: "login", userId: 7, resourceId: 42, page: 3 });

		expect(mockedApi.get).toHaveBeenCalledWith("/admin/audit-logs?filter%5Baction%5D=login&filter%5Buser_id%5D=7&filter%5Bauditable_id%5D=42&page=3");
	});

	it("updates the current profile and changes password through auth endpoints", async () => {
		mockedApi.put.mockResolvedValueOnce({ data: { data: { profile: { name: "Mona" } } } });
		mockedApi.post.mockResolvedValueOnce({ data: { success: true } });

		await userApi.updateProfile({ name: "Mona" });
		await userApi.changePassword({
			current_password: "old-password",
			new_password: "new-password",
			new_password_confirmation: "new-password",
		});

		expect(mockedApi.put).toHaveBeenCalledWith("/auth/profile", { name: "Mona" });
		expect(mockedApi.post).toHaveBeenCalledWith("/auth/change-password", {
			current_password: "old-password",
			new_password: "new-password",
			new_password_confirmation: "new-password",
		});
	});
});
