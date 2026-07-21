import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/shared/api/base";
import { sendInvoice } from "../finance.api";

vi.mock("@/shared/api/base", () => ({
	default: {
		post: vi.fn(),
	},
}));

describe("finance invoice actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sends an invoice through the dedicated action endpoint", async () => {
		vi.mocked(api.post).mockResolvedValueOnce({
			data: {
				success: true,
				message: "Invoice sent successfully",
				data: { id: 41, status: "sent" },
			},
		});

		await expect(sendInvoice(41)).resolves.toMatchObject({ id: 41, status: "sent" });
		expect(api.post).toHaveBeenCalledWith("/finance/invoices/41/send");
	});
});
