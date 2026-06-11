import { describe, expect, it } from "vitest";
import { ClientStatus, ClientType } from "@/entities/client/model/types";
import { mapClientListResponse, mapClientResource, type RawClientListResponse, type RawClientResource } from "../client.api";

describe("client API mappers", () => {
	it("maps detail resources without inventing missing frontend fields", () => {
		const raw: RawClientResource = {
			clientId: 7,
			type: ClientType.COMPANY,
			displayName: "Acme Operations",
			legalName: "Acme LLC",
			companyName: "Acme",
			primaryEmail: "ops@acme.test",
			primaryPhone: "+20100",
			secondaryPhone: "",
			name: "Acme Operations",
			email: "ops@acme.test",
			phone: "+20100",
			company: "Acme",
			position: "",
			industry: "",
			address: "",
			city: "",
			state: "",
			country: "Egypt",
			postalCode: "",
			website: "",
			taxNumber: "",
			source: "website",
			lifecycleStage: "customer",
			leadTemperature: "",
			accountManagerId: 3,
			accountManager: { userId: 3, name: "Mona", email: "mona@example.test" },
			metadata: { segment: "enterprise" },
			notes: "",
			status: ClientStatus.ACTIVE,
			userId: null,
			leadId: null,
			hasPortalAccess: false,
			totalRevenue: 5000,
			activeProjectsCount: 2,
			contacts: [],
			createdAt: "2026-06-01T10:00:00.000Z",
			updatedAt: "2026-06-02T10:00:00.000Z",
		};

		const client = mapClientResource(raw);

		expect(client).toEqual(raw);
		expect("interests" in client).toBe(false);
		expect("projects" in client).toBe(false);
	});

	it("maps list envelopes through explicit raw list rows", () => {
		const raw: RawClientListResponse = {
			clients: [
				{
					id: 1,
					type: ClientType.COMPANY,
					display_name: "Globex",
					email: "hello@globex.test",
					company_name: "Globex Ltd",
					position: null,
					primary_phone: null,
					status: ClientStatus.ACTIVE,
					country: null,
					projects_count: 4,
					active_projects_count: 2,
					total_revenue: 12000,
					created_at: "2026-05-01T10:00:00.000Z",
				},
			],
			pagination: {
				total: 1,
				count: 1,
				perPage: 15,
				currentPage: 1,
				totalPages: 1,
			},
		};

		expect(mapClientListResponse(raw)).toEqual(raw);
	});
});
