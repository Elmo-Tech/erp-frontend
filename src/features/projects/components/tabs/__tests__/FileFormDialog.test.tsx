import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { FileFormDialog } from "../FileFormDialog";

const renderWithClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("FileFormDialog", () => {
	it("tells users that connected projects upload files to Google Drive", () => {
		renderWithClient(
			<FileFormDialog
				projectId={1}
				open
				onOpenChange={vi.fn()}
				driveFolderId="drive-folder-1"
			/>
		);

		expect(screen.getByText("Files upload to the connected Google Drive folder. Links stay in ERP.")).toBeInTheDocument();
	});
});
