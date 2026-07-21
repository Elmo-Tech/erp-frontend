import { describe, expect, it } from "vitest";
import { getPipelinePermissionFailure, type PipelinePermissionAccess } from "../pipeline-permission-gates";

const fullAccess: PipelinePermissionAccess = {
	canEditLeads: true,
	canConvertLeads: true,
	canCreateQuotations: true,
	canCreateContracts: true,
};

describe("getPipelinePermissionFailure", () => {
	it("requires edit permission for every stage transition", () => {
		expect(getPipelinePermissionFailure("new", "meeting", { ...fullAccess, canEditLeads: false })).toBe("You do not have permission to edit leads");
	});

	it("requires quotation creation when a forward transition crosses quotation", () => {
		expect(getPipelinePermissionFailure("proposal", "quotation", { ...fullAccess, canCreateQuotations: false })).toBe("You do not have permission to create quotations");
		expect(getPipelinePermissionFailure("new", "contract", { ...fullAccess, canCreateQuotations: false })).toBe("You do not have permission to create quotations");
	});

	it("requires contract creation when a forward transition crosses contract", () => {
		expect(getPipelinePermissionFailure("quotation", "contract", { ...fullAccess, canCreateContracts: false })).toBe("You do not have permission to create contracts");
	});

	it("requires convert permission for the won transition", () => {
		expect(getPipelinePermissionFailure("contract", "closed_won", { ...fullAccess, canConvertLeads: false })).toBe("You do not have permission to convert leads");
	});

	it("does not require new artifacts when moving backward", () => {
		expect(getPipelinePermissionFailure("contract", "proposal", { ...fullAccess, canCreateQuotations: false, canCreateContracts: false })).toBeNull();
	});
});
