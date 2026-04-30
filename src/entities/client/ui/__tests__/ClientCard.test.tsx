import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClientStatus, ClientType, type ClientIndexRow } from "@/entities/client/model/types";
import { ClientCard } from "../ClientCard";

describe("ClientCard", () => {
	it("renders optimized directory row fields", () => {
		const client: ClientIndexRow = {
			id: 42,
			type: ClientType.COMPANY,
			display_name: "Acme Operations",
			email: "ops@acme.test",
			company_name: "Acme Ltd",
			position: "Procurement",
			status: ClientStatus.ACTIVE,
			country: "Egypt",
			projects_count: 3,
			created_at: "2026-04-30T10:00:00.000000Z",
		};

		render(<ClientCard client={client} />);

		expect(screen.getByText("Acme Operations")).toBeInTheDocument();
		expect(screen.getByText("ops@acme.test")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
	});
});
