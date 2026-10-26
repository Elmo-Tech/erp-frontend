import api from "@/lib/axios";
import { ProjectDriveFile, ProjectDriveFolder } from "../types/project";

export interface GoogleDriveStatus {
	connected: boolean;
	accountEmail: string | null;
	expiresAt: string | null;
	reason: string | null;
}

type GoogleDriveStatusPayload = Partial<GoogleDriveStatus>;

const normalizeOptionalText = (value: unknown): string | null => {
	return typeof value === "string" && value.trim() ? value.trim() : null;
};

export const normalizeGoogleDriveStatus = (status: GoogleDriveStatusPayload): GoogleDriveStatus => {
	return {
		connected: status.connected === true,
		accountEmail: normalizeOptionalText(status.accountEmail),
		expiresAt: normalizeOptionalText(status.expiresAt),
		reason: normalizeOptionalText(status.reason),
	};
};

export const projectDriveApi = {
	getOAuthUrl: async (state?: string): Promise<{ url: string; connected: boolean }> => {
		const response = await api.get<{ data: { url: string; connected: boolean } }>("/google-drive/oauth-url", {
			params: state ? { state } : undefined,
		});
		return response.data.data;
	},

	getStatus: async (): Promise<GoogleDriveStatus> => {
		const response = await api.get<{ data: GoogleDriveStatusPayload }>("/google-drive/status");
		return normalizeGoogleDriveStatus(response.data.data);
	},

	completeOAuth: async (code: string): Promise<void> => {
		await api.post("/google-drive/oauth-callback", { code });
	},

	searchFolders: async (projectId: number, search?: string): Promise<ProjectDriveFolder[]> => {
		const response = await api.get<{ data: { folders: ProjectDriveFolder[] } }>(`/projects/${projectId}/drive-folders`, {
			params: search ? { search } : undefined,
		});
		return response.data.data.folders;
	},

	connectFolder: async (projectId: number, folder: ProjectDriveFolder): Promise<void> => {
		await api.post(`/projects/${projectId}/drive-folder`, {
			folderId: folder.id,
			folderName: folder.name,
			folderUrl: folder.url,
		});
	},

	listFiles: async (projectId: number): Promise<ProjectDriveFile[]> => {
		const response = await api.get<{ data: { files: ProjectDriveFile[] } }>(`/projects/${projectId}/drive-files`);
		return response.data.data.files;
	},

	uploadFile: async (projectId: number, file: File): Promise<ProjectDriveFile> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await api.post<{ data: { file: ProjectDriveFile } }>(`/projects/${projectId}/drive-files`, formData, {
			skipSuccessToast: true,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data.file;
	},
};
