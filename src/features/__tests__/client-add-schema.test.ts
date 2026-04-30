import { describe, expect, it } from "vitest";
import { ClientStatus, ClientType } from "@/entities/client/model/types";
import { addClientSchema } from "@/features/clients/model/client.schema";

const sharedClassification = {
	country: "United States",
	status: ClientStatus.ACTIVE,
	leadSource: "website",
	interests: ["web-development"],
	notes: "",
};

describe("addClientSchema", () => {
	it("validates company clients without individual-only fields", () => {
		const result = addClientSchema.safeParse({
			type: ClientType.COMPANY,
			companyName: "Acme Inc.",
			companyPhone: "",
			companyEmail: "hello@acme.com",
			contactFirstName: "Jane",
			contactLastName: "Cooper",
			contactPhone: "",
			contactEmail: "",
			...sharedClassification,
		});

		expect(result.success).toBe(true);
	});

	it("validates individual clients without company-only fields", () => {
		const result = addClientSchema.safeParse({
			type: ClientType.INDIVIDUAL,
			firstName: "Alex",
			lastName: "Morgan",
			individualPhone: "",
			individualEmail: "alex@example.com",
			...sharedClassification,
		});

		expect(result.success).toBe(true);
	});

	it("allows account manager to be unassigned", () => {
		const result = addClientSchema.safeParse({
			type: ClientType.COMPANY,
			companyName: "Acme Inc.",
			companyPhone: "",
			companyEmail: "hello@acme.com",
			contactFirstName: "Jane",
			contactLastName: "Cooper",
			contactPhone: "",
			contactEmail: "",
			accountManagerId: "",
			...sharedClassification,
		});

		expect(result.success).toBe(true);
	});

	it("keeps required shared classification fields required", () => {
		const result = addClientSchema.safeParse({
			type: ClientType.INDIVIDUAL,
			firstName: "Alex",
			lastName: "Morgan",
			individualPhone: "",
			individualEmail: "alex@example.com",
			status: ClientStatus.ACTIVE,
			interests: [],
			notes: "",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(expect.arrayContaining(["country", "leadSource"]));
		}
	});
});
