import { describe, expect, it } from "vitest";
import { invoiceSchema } from "@/features/finance/model/finance.schema";
import { assignHrProfileSchema, payrollTransactionSchema } from "@/features/hr/model/hr.schema";

const invoiceBase = {
	clientId: "1",
	projectId: null,
	issueDate: "2026-05-13",
	dueDate: "2026-05-20",
	status: "draft" as const,
	notes: "",
	items: [{ description: "Implementation", quantity: "1", unitPrice: "100" }],
};

describe("numeric form schemas", () => {
	it("does not coerce blank invoice tax or discount fields to zero", () => {
		const result = invoiceSchema.safeParse({
			...invoiceBase,
			taxRate: "",
			discountAmount: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(expect.arrayContaining(["taxRate", "discountAmount"]));
		}
	});

	it("converts valid numeric invoice strings into numbers", () => {
		const result = invoiceSchema.safeParse({
			...invoiceBase,
			taxRate: "14",
			discountAmount: "25.5",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.taxRate).toBe(14);
			expect(result.data.discountAmount).toBe(25.5);
			expect(result.data.items[0].unitPrice).toBe(100);
		}
	});

	it("does not coerce blank HR salary or payroll amounts to zero", () => {
		expect(
			assignHrProfileSchema.safeParse({
				user_id: "1",
				shift_id: null,
				base_salary: "",
				hourly_rate: "",
				join_date: "2026-05-13",
			}).success,
		).toBe(false);

		expect(
			payrollTransactionSchema.safeParse({
				user_id: "1",
				amount: "",
				type: "manual_bonus",
				reason: "Adjustment",
				transaction_date: "2026-05-13",
			}).success,
		).toBe(false);
	});
});
