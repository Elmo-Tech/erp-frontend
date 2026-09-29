import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { employeesApi } from "./employees";

vi.mock("@/lib/axios", () => ({
	default: {
		post: vi.fn(),
	},
}));

describe("employeesApi.uploadAvatar", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uploads the avatar in the expected multipart field", async () => {
		const avatar = new File(["avatar"], "employee.webp", { type: "image/webp" });
		const employee = { userId: 12, avatar: "https://example.test/employee.webp" };
		vi.mocked(api.post).mockResolvedValue({ data: { data: employee } });

		await expect(employeesApi.uploadAvatar(12, avatar)).resolves.toEqual(employee);

		const formData = vi.mocked(api.post).mock.calls[0][1] as FormData;
		expect(api.post).toHaveBeenCalledWith("/employees/12/avatar", expect.any(FormData), {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		expect(formData.get("avatar")).toBe(avatar);
	});
});
