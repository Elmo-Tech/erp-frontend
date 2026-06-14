import { describe, expect, it } from "vitest";
import { quotationDirectUploadSchema } from "../../ui/PipelineModals/stageModal.schema";

function validQuotationInput(currency: string) {
	return {
		upload_file: new File(["%PDF"], "quote.pdf", { type: "application/pdf" }),
		base_price: "100",
		commission_type: "percentage",
		currency,
		final_total: "120",
		payment_stages: [],
		notes: "",
	};
}

describe("quotation direct upload schema", () => {
	it("accepts configured currency codes beyond the old hardcoded enum", () => {
		const result = quotationDirectUploadSchema.safeParse(validQuotationInput("KWD"));

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.currency).toBe("KWD");
		}
	});

	it("rejects an empty currency selection", () => {
		const result = quotationDirectUploadSchema.safeParse(validQuotationInput(""));

		expect(result.success).toBe(false);
	});
});
