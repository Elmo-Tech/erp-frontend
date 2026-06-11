import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type Column } from "../DataTable";

interface Row {
	id: number;
	name: string;
	status: string;
}

const rows: Row[] = [
	{ id: 1, name: "Acme", status: "active" },
	{ id: 2, name: "Globex", status: "inactive" },
];

const columns: Column<Row>[] = [
	{ key: "name", header: "Name", render: (row) => row.name },
	{ key: "status", header: "Status", render: (row) => row.status },
];

describe("DataTable", () => {
	it("renders filter content above the table", () => {
		render(
			<DataTable
				columns={columns}
				data={rows}
				keyExtractor={(row) => row.id}
				filters={<button type="button">Filter clients</button>}
			/>,
		);

		expect(screen.getByRole("button", { name: "Filter clients" })).toBeInTheDocument();
	});

	it("renders row actions without triggering the row click", () => {
		const onRowClick = vi.fn();
		const onArchive = vi.fn();

		render(
			<DataTable
				columns={columns}
				data={rows}
				keyExtractor={(row) => row.id}
				onRowClick={onRowClick}
				rowActions={(row) => (
					<button
						type="button"
						onClick={() => onArchive(row.id)}
					>
						Archive {row.name}
					</button>
				)}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Archive Acme" }));

		expect(onArchive).toHaveBeenCalledWith(1);
		expect(onRowClick).not.toHaveBeenCalled();
		expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
	});

	it("opens clickable rows with Enter and Space", () => {
		const onRowClick = vi.fn();

		render(
			<DataTable
				columns={columns}
				data={rows}
				keyExtractor={(row) => row.id}
				onRowClick={onRowClick}
			/>,
		);

		const acmeRow = screen.getByRole("button", { name: /Acme active/i });

		fireEvent.keyDown(acmeRow, { key: "Enter" });
		fireEvent.keyDown(acmeRow, { key: " " });

		expect(onRowClick).toHaveBeenCalledTimes(2);
		expect(onRowClick).toHaveBeenNthCalledWith(1, rows[0]);
		expect(onRowClick).toHaveBeenNthCalledWith(2, rows[0]);
	});
});
