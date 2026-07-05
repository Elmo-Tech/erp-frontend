import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { FilesTab } from "../FilesTab";

vi.mock("@/components/shared", () => ({
	DataTable: ({ title, data, headerActions }: { title: string; data: Array<{ name: string }>; headerActions?: React.ReactNode }) => (
		<div>
			<h2>{title}</h2>
			<div>{headerActions}</div>
			{data.map((item) => (
				<div key={item.name}>{item.name}</div>
			))}
		</div>
	),
	ConfirmDialog: () => null,
}));

vi.mock("@/features/admin/hooks/usePermissions", () => ({
	usePermissions: () => ({
		canManageProjectFiles: true,
		canUploadProjectFiles: true,
		canDeleteProjectFiles: true,
	}),
}));

vi.mock("@/features/projects/hooks/useProjectDrive", () => ({
	useProjectDriveFiles: vi.fn(),
}));

vi.mock("../FileFormDialog", () => ({
	FileFormDialog: ({ driveFolderId }: { driveFolderId?: string }) => (
		<div>{driveFolderId ? "Drive upload enabled" : "Local upload enabled"}</div>
	),
}));

vi.mock("../DriveFolderDialog", () => ({
	DriveFolderDialog: () => <div>Drive folder dialog</div>,
}));

import { useProjectDriveFiles } from "@/features/projects/hooks/useProjectDrive";

const mockUseProjectDriveFiles = vi.mocked(useProjectDriveFiles);

const renderWithClient = (ui: React.ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("FilesTab Google Drive integration", () => {
	it("shows connect folder action when no Drive folder is connected", () => {
		mockUseProjectDriveFiles.mockReturnValue({ data: undefined, isLoading: false } as ReturnType<typeof useProjectDriveFiles>);

		renderWithClient(
			<FilesTab
				projectId={1}
				files={[]}
			/>
		);

		expect(screen.getByText("Connect Drive Folder")).toBeInTheDocument();
		expect(screen.getByText("Local upload enabled")).toBeInTheDocument();
	});

	it("renders Drive files when a folder is connected", () => {
		mockUseProjectDriveFiles.mockReturnValue({
			data: [{ id: "drive-1", name: "Drive Brief.pdf", mimeType: "application/pdf", size: 1200 }],
			isLoading: false,
		} as ReturnType<typeof useProjectDriveFiles>);

		renderWithClient(
			<FilesTab
				projectId={1}
				files={[]}
				googleDriveFolderId="folder-1"
				googleDriveFolderName="Client Docs"
			/>
		);

		expect(screen.getByText("Drive Brief.pdf")).toBeInTheDocument();
		expect(screen.getByText("Change Drive Folder")).toBeInTheDocument();
		expect(screen.getByText("Drive upload enabled")).toBeInTheDocument();
	});

	it("shows a retry action when Drive files fail to load", () => {
		const refetch = vi.fn();
		mockUseProjectDriveFiles.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: new Error("Google Drive token expired"),
			refetch,
		} as unknown as ReturnType<typeof useProjectDriveFiles>);

		renderWithClient(
			<FilesTab
				projectId={1}
				files={[]}
				googleDriveFolderId="folder-1"
				googleDriveFolderName="Client Docs"
			/>
		);

		expect(screen.getByText("Google Drive token expired")).toBeInTheDocument();
		screen.getByRole("button", { name: "Retry Drive" }).click();
		expect(refetch).toHaveBeenCalled();
	});
});
