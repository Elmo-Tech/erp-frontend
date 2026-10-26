"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared";
import { ExternalLink, Folder, RefreshCw } from "lucide-react";
import { notifyApiError } from "@/lib/errorHandling";
import { projectDriveApi } from "../../api/projectDrive";
import { useConnectProjectDriveFolder, useProjectDriveFolders } from "../../hooks/useProjectDrive";
import { ProjectDriveFolder } from "../../types/project";

interface DriveFolderDialogProps {
	projectId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DriveFolderDialog({ projectId, open, onOpenChange }: DriveFolderDialogProps) {
	const [search, setSearch] = useState("");
	const [isStartingOAuth, setIsStartingOAuth] = useState(false);
	const folders = useProjectDriveFolders(projectId, search, open);
	const connectFolder = useConnectProjectDriveFolder(projectId);

	const handleOAuth = async () => {
		try {
			setIsStartingOAuth(true);
			const { url } = await projectDriveApi.getOAuthUrl(`/dashboard/projects/${projectId}`);
			window.location.href = url;
		} catch (error) {
			notifyApiError(error);
		} finally {
			setIsStartingOAuth(false);
		}
	};

	const handleSelect = async (folder: ProjectDriveFolder) => {
		try {
			await connectFolder.mutateAsync(folder);
			onOpenChange(false);
		} catch (error) {
			notifyApiError(error);
		}
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Connect Google Drive Folder"
			description="Choose the Drive folder used by this project."
			showFooter={false}
		>
			<div className="space-y-4">
				<div className="flex gap-2">
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search folders..."
					/>
					<Button
						type="button"
						variant="outline"
						onClick={() => folders.refetch()}
						disabled={folders.isLoading}
					>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>

				{folders.error ? (
					<div className="space-y-3 rounded-md border p-4">
						<p className="text-sm text-muted-foreground">Google Drive is not connected or folders could not be loaded.</p>
						<Button
							type="button"
							onClick={handleOAuth}
							disabled={isStartingOAuth}
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							Connect Google Drive
						</Button>
					</div>
				) : (
					<div className="max-h-72 overflow-y-auto rounded-md border">
						{folders.isLoading ? (
							<p className="p-4 text-sm text-muted-foreground">Loading folders...</p>
						) : folders.data?.length ? (
							folders.data.map((folder) => (
								<button
									key={folder.id}
									type="button"
									className="flex w-full items-center gap-3 border-b p-3 text-left text-sm last:border-b-0 hover:bg-muted"
									onClick={() => handleSelect(folder)}
									disabled={connectFolder.isPending}
								>
									<Folder className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">{folder.name}</span>
								</button>
							))
						) : (
							<p className="p-4 text-sm text-muted-foreground">No folders found.</p>
						)}
					</div>
				)}
			</div>
		</FormDialog>
	);
}
